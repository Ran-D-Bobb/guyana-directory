'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Calendar,
  CalendarClock,
  Compass,
  Home,
  Users,
  Star,
  Eye,
  MessageCircle,
  TrendingUp as TrendingUpIcon,
  Activity,
  CheckCircle,
  Sparkles,
  Clock,
  Heart,
  Flag,
  Shield,
  ThumbsUp,
  AlertTriangle,
  FileWarning,
  ClipboardList,
  Copy,
  EyeOff,
  Image,
  FileText,
  Phone,
  Tag,
  MapPin,
} from 'lucide-react'

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Calendar,
  CalendarClock,
  Compass,
  Home,
  Users,
  Star,
  Eye,
  MessageCircle,
  TrendingUp: TrendingUpIcon,
  Activity,
  CheckCircle,
  Sparkles,
  Clock,
  Heart,
  Flag,
  Shield,
  ThumbsUp,
  AlertTriangle,
  FileWarning,
  ClipboardList,
  Copy,
  EyeOff,
  Image,
  FileText,
  Phone,
  Tag,
  MapPin,
}

interface AdminStatCardProps {
  label: string
  value: number | string
  icon: string
  trend?: {
    value: number
    label?: string
  }
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'cyan' | 'pink' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorVariants = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-600',
    trend: 'text-emerald-600 bg-emerald-50',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    trend: 'text-blue-600 bg-blue-50',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
    trend: 'text-purple-600 bg-purple-50',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600',
    trend: 'text-orange-600 bg-orange-50',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
    trend: 'text-red-600 bg-red-50',
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'bg-cyan-100 text-cyan-600',
    text: 'text-cyan-600',
    trend: 'text-cyan-600 bg-cyan-50',
  },
  pink: {
    bg: 'bg-pink-50',
    icon: 'bg-pink-100 text-pink-600',
    text: 'text-pink-600',
    trend: 'text-pink-600 bg-pink-50',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
    trend: 'text-yellow-600 bg-yellow-50',
  },
}

const sizeVariants = {
  sm: {
    card: 'p-4',
    icon: 'w-10 h-10',
    iconSize: 18,
    value: 'text-2xl',
    label: 'text-xs',
  },
  md: {
    card: 'p-5',
    icon: 'w-12 h-12',
    iconSize: 22,
    value: 'text-3xl',
    label: 'text-sm',
  },
  lg: {
    card: 'p-6',
    icon: 'w-14 h-14',
    iconSize: 26,
    value: 'text-4xl',
    label: 'text-sm',
  },
}

export function AdminStatCard({
  label,
  value,
  icon,
  trend,
  color = 'emerald',
  size = 'md',
  className,
}: AdminStatCardProps) {
  const Icon = iconMap[icon] || Building2
  const colorClasses = colorVariants[color]
  const sizeClasses = sizeVariants[size]

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null

  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border border-slate-200/80 shadow-sm',
        'hover:shadow-lg hover:border-slate-300/80 hover:-translate-y-0.5',
        'transition-all duration-300',
        sizeClasses.card,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('font-medium text-slate-500 mb-1', sizeClasses.label)}>
            {label}
          </p>
          <p className={cn('font-bold text-slate-900 tracking-tight', sizeClasses.value)}>
            {formattedValue}
          </p>
          {trend && TrendIcon && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  trend.value >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                )}
              >
                <TrendIcon size={12} />
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-slate-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            colorClasses.icon,
            sizeClasses.icon
          )}
        >
          <Icon size={sizeClasses.iconSize} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

// Compact variant for dashboard grids
export function AdminStatCardCompact({
  label,
  value,
  icon,
  color = 'emerald',
  href,
}: {
  label: string
  value: number | string
  icon: string
  color?: keyof typeof colorVariants
  href?: string
}) {
  const Icon = iconMap[icon] || Building2
  const colorClasses = colorVariants[color]
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value

  const content = (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
      colorClasses.bg,
      href && 'hover:shadow-md cursor-pointer'
    )}>
      <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg', colorClasses.icon)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{formattedValue}</p>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
