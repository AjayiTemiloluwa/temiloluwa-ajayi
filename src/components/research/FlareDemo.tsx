'use client'

import { useMemo, useState } from 'react'
import { Flame, RotateCcw, Satellite } from 'lucide-react'
import { flareCases, flareCasesCite, flareInputs, flareInputsCite, flareR2Cite } from '@/data/flareDemo'
import { Cited } from '@/components/ui/Cited'

/**
 * FlareDemo — "beat the model" on the gas-flaring paper's own test flares.
 *
 * For each of the five held-out flares the visitor sees what the random
 * forest predicted, guesses the measured volume on a log slider, then
 * reveals the truth: three bars (model, you, measured) and whoever was
 * closer takes the point. Every number comes from page 13 of the draft;
 * nothing is simulated. The trained model itself is not online.
 */

/** BCM → million m³, the unit people can picture. */
const mcm = (bcm: number) => bcm * 1000
const fmt = (v: number) => (v >= 10 ? v.toFixed(1) : v.toFixed(2))

// the slider runs on a log scale from 0.5 to 100 million m³
const LO = Math.log10(0.5)
const HI = Math.log10(100)
const toPos = (v: number) => ((Math.log10(v) - LO) / (HI - LO)) * 100
const fromPos = (p: number) => 10 ** (LO + (p / 100) * (HI - LO))

/** How far off, as a ratio: 1.5 means 50% too high or 1/1.5 too low. Symmetric on a log scale. */
const miss = (guess: number, truth: number) => Math.abs(Math.log(guess / truth))
const pct = (v: number, truth: number) => Math.round(((v - truth) / truth) * 100)

type Result = { you: number; winner: 'you' | 'model' | 'tie' }

export function FlareDemo() {
  const [i, setI] = useState(0)
  const [pos, setPos] = useState(50)
  const [results, setResults] = useState<(Result | null)[]>(() => flareCases.map(() => null))

  const c = flareCases[i]
  const model = mcm(c.predicted)
  const truth = mcm(c.measured)
  const guess = fromPos(pos)
  const done = results[i]
  const score = useMemo(
    () => results.reduce((s, r) => (r ? { you: s.you + (r.winner === 'you' ? 1 : 0), model: s.model + (r.winner === 'model' ? 1 : 0) } : s), { you: 0, model: 0 }),
    [results],
  )
  const played = results.filter(Boolean).length

  const reveal = () => {
    const a = miss(guess, truth)
    const b = miss(model, truth)
    const winner = Math.abs(a - b) < 0.02 ? 'tie' : a < b ? 'you' : 'model'
    setResults((r) => r.map((x, k) => (k === i ? { you: guess, winner } : x)))
  }
  const go = (k: number) => {
    setI(k)
    setPos(50)
  }
  const reset = () => {
    setResults(flareCases.map(() => null))
    go(0)
  }

  const bars = [
    { key: 'model', label: 'Model predicted', value: model, tone: 'bg-fg/45' },
    { key: 'you', label: 'You guessed', value: done ? done.you : guess, tone: 'bg-accent/55' },
    { key: 'truth', label: 'Measured', value: truth, tone: 'bg-accent' },
  ] as const

  return (
    <div className="overflow-hidden rounded-2xl border border-fg/15">
      {/* header: title + score */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-fg/15 bg-fg/[0.03] px-5 py-4 sm:px-6">
        <p className="flex items-center gap-2.5 text-[15px] font-semibold">
          <Flame className="h-5 w-5 text-accent" aria-hidden="true" />
          Beat the model
        </p>
        <p className="text-sm tabular-nums text-fg/75" aria-live="polite">
          You <span className="display text-xl text-accent">{score.you}</span>
          <span className="mx-2 text-fg/40">–</span>
          <span className="display text-xl">{score.model}</span> Model
          <span className="ml-3 text-fg/65">{played}/5 flares</span>
        </p>
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[1fr_15rem]">
        <div>
          {/* flare picker */}
          <div role="tablist" aria-label="Test flares" className="flex flex-wrap gap-2">
            {flareCases.map((f, k) => {
              const r = results[k]
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={k === i}
                  onClick={() => go(k)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition ${
                    k === i ? 'border-fg bg-fg text-paper' : 'border-fg/25 text-fg/80 hover:border-fg'
                  }`}
                >
                  Flare {f.id}
                  {r && <span aria-label={r.winner === 'you' ? 'you won' : r.winner === 'model' ? 'model won' : 'tie'}>{r.winner === 'you' ? '★' : r.winner === 'model' ? '·' : '='}</span>}
                </button>
              )
            })}
          </div>

          <p className="prose-body mt-6 text-[15px]">
            The model looked at this flare from space and predicted{' '}
            <strong className="text-fg">{fmt(model)} million m³</strong> of gas burned in a year. How much do you think was really
            flared?
          </p>

          {/* the guess */}
          <label className="mt-6 block">
            <span className="flex items-baseline justify-between gap-3">
              <span className="eyebrow">Your guess</span>
              <span className="display text-3xl tabular-nums text-accent">
                {fmt(done ? done.you : guess)} <span className="text-base text-fg/60">million m³</span>
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={done ? toPos(done.you) : pos}
              disabled={!!done}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-valuetext={`${fmt(guess)} million cubic metres`}
              className="flare-range mt-3 w-full"
            />
            <span className="meta mt-1 flex justify-between">
              <span>0.5</span>
              <span>5</span>
              <span>50</span>
              <span>100</span>
            </span>
          </label>

          {/* the bars — model, you, measured — on the same log scale as the slider */}
          <div className="mt-6 space-y-3" aria-live="polite">
            {bars.map((b) => {
              const hidden = !done && b.key === 'truth'
              return (
                <div key={b.key} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-[13px]">
                  <span className="text-fg/75">{b.label}</span>
                  <span className="relative h-7 overflow-hidden rounded-full bg-fg/[0.06]">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full ${b.tone} transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none`}
                      style={{ width: hidden ? '0%' : `${Math.max(3, Math.min(100, toPos(b.value)))}%` }}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center font-semibold tabular-nums text-fg">
                      {hidden ? '?' : `${fmt(b.value)}`}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!done ? (
              <button type="button" onClick={reveal} className="btn-primary">
                <Satellite className="h-4 w-4" aria-hidden="true" /> Reveal the measured volume
              </button>
            ) : (
              <>
                <p className="text-[15px] font-semibold" role="status">
                  {done.winner === 'you' ? 'You beat the model on this one.' : done.winner === 'model' ? 'The model was closer.' : 'Dead heat.'}{' '}
                  <span className="font-normal text-fg/70">
                    The model was {Math.abs(pct(model, truth))}% {model > truth ? 'too high' : 'too low'}; you were{' '}
                    {Math.abs(pct(done.you, truth))}% {done.you > truth ? 'too high' : 'too low'}.
                  </span>
                </p>
                {played < 5 ? (
                  <button type="button" onClick={() => go(results.findIndex((r) => !r))} className="btn-ghost !h-10">
                    Next flare
                  </button>
                ) : (
                  <button type="button" onClick={reset} className="btn-ghost !h-10">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Play again
                  </button>
                )}
              </>
            )}
          </div>

          <Cited cite={flareCasesCite} className="meta mt-5">
            Real numbers: the five test flares printed in the paper, converted from billion to million m³.
          </Cited>
        </div>

        {/* what the model reads + how much it explains */}
        <aside className="border-t border-fg/15 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="eyebrow">What the model reads</p>
          <ul className="mt-3 space-y-3">
            {flareInputs.map((f) => (
              <li key={f.name}>
                <p className="text-[14px] font-semibold">{f.name}</p>
                <p className="meta">{f.plain}</p>
              </li>
            ))}
          </ul>
          <Cited cite={flareInputsCite} className="meta mt-2" />

          <p className="eyebrow mt-8">How much it explains</p>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-fg/10" role="img" aria-label="66% of the variation explained, 34% not">
            <span className="h-full bg-accent" style={{ width: '65.8%' }} />
          </div>
          <p className="meta mt-2">
            About two thirds of the differences between flares (R² = 0.658). The rest comes from things the model can’t see.
          </p>
          <Cited cite={flareR2Cite} className="meta mt-1" />
        </aside>
      </div>

      <p className="border-t border-fg/15 bg-fg/[0.03] px-5 py-3 text-[13px] text-fg/70 sm:px-6">
        The trained model isn’t online yet. This game replays the paper’s recorded results, so you are playing against what the
        model actually predicted.
      </p>
    </div>
  )
}
