const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** Spell out a small count ("six chapters") so copy follows the data. */
export function countWord(n: number, capitalize = false): string {
  const w = WORDS[n] ?? String(n)
  return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w
}
