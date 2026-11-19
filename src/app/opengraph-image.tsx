import { ImageResponse } from 'next/og'
import { profile } from '@/data/resume'
import { studies } from '@/data/research'

/**
 * The link preview (LinkedIn, Slack, X, WhatsApp): name, role and the
 * research line in the site's night-studio colours. Next serves it as
 * /opengraph-image and wires the og:image / twitter:image tags itself.
 */
export const alt = `${profile.name}, ${profile.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'radial-gradient(circle at 85% 20%, rgba(10,228,72,0.28), transparent 45%), #0e100f',
          color: '#fffce1',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#0ae448' }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: '#0ae448' }} />
          {profile.availability}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{profile.firstName}</div>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05, color: '#0ae448' }}>{profile.lastName}</div>
          <div style={{ marginTop: 28, fontSize: 34, color: 'rgba(255,252,225,0.8)' }}>
            {`${profile.role} · Machine learning for energy problems`}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: 'rgba(255,252,225,0.65)' }}>
          <span>{`${studies.length} draft manuscripts · every claim sourced`}</span>
          <span>{profile.location}</span>
        </div>
      </div>
    ),
    size,
  )
}
