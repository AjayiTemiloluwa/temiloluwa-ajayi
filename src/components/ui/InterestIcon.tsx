import {
  AudioLines,
  BarChart3,
  ChefHat,
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Plug,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import type { Interest } from '@/data/interests'

/** One icon per interest key — shared by /interests and /life. */
const ICONS: Record<Interest['icon'], typeof Cpu> = {
  cpu: Cpu,
  'trending-up': TrendingUp,
  zap: Zap,
  'graduation-cap': GraduationCap,
  users: Users,
  'bar-chart': BarChart3,
  'chef-hat': ChefHat,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
  plug: Plug,
  audio: AudioLines,
}

export function InterestIcon({ icon, className = '' }: { icon: Interest['icon']; className?: string }) {
  const Icon = ICONS[icon]
  return <Icon className={className} aria-hidden="true" />
}
