'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Plus,
  Calendar,
  Compass,
  Home,
  Building2,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Plus,
  Calendar,
  Compass,
  Home,
  Building2,
}

interface QuickAction {
  label: string
  description: string
  href: string
  icon: string
  color: 'emerald' | 'purple' | 'cyan' | 'blue' | 'orange' | 'pink'
  badge?: string | number
  badgeVariant?: 'warning' | 'danger' | 'info'
}

interface AdminQuickActionsProps {
  actions: QuickAction[]
}

const colorVariants = {
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/25',
    hover: 'group-hover:shadow-emerald-500/40',
    iconBg: 'bg-white/20',
    badge: 'bg-white/25 text-white',
  },
  purple: {
    gradient: 'from-purple-500 to-violet-600',
    glow: 'shadow-purple-500/25',
    hover: 'group-hover:shadow-purple-500/40',
    iconBg: 'bg-white/20',
    badge: 'bg-white/25 text-white',
  },
  cyan: {
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/25',
    hover: 'group-hover:shadow-cyan-500/40',
    iconBg: 'bg-white/20',
    badge: 'bg-white/25 text-white',
  },
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/25',
    hover: 'group-hover:shadow-blue-500/40',
    iconBg: 'bg-white/20',
    badge: 'bg-white/25 text-white',
  },
  orange: {
    gradient: 'from-orange-500 to-red-600',
    glow: 'shadow-orange-500/25',
    hover: 'group-hover:shadow-orange-500/40',
    iconBg: 'bg-white/20',
    badge: 'bg-white/25 text-white',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/25',
    hover: 'group-hover:shadow-pink-500/40',
    iconBg: 'bg-white/20',
    badge: 'bg-white/25 text-white',
  },
}

const badgeVariants = {
  warning: 'bg-orange-500 text-white',
  danger: 'bg-red-500 text-white animate-pulse',
  info: 'bg-blue-500 text-white',
}

export function AdminQuickActions({ actions }: AdminQuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {actions.map((action) => {
        const Icon = iconMap[action.icon] || Plus
        const colors = colorVariants[action.color]

        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'group relative overflow-hidden rounded-2xl p-5',
              'bg-gradient-to-br text-white',
              colors.gradient,
              'shadow-lg transition-all duration-300',
              colors.glow,
              'hover:-translate-y-1 hover:shadow-xl',
              colors.hover
            )}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-xl',
                  colors.iconBg,
                  'group-hover:scale-110 transition-transform duration-300'
                )}>
                  <Icon size={22} />
                </div>
                {action.badge && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    action.badgeVariant ? badgeVariants[action.badgeVariant] : colors.badge
                  )}>
                    {action.badge}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-lg mb-1">{action.label}</h3>
              <p className="text-white/80 text-sm leading-snug">{action.description}</p>

              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                <span>Go to</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// Alternative card style for secondary actions
export function AdminActionCard({
  label,
  description,
  href,
  icon: Icon,
  stats,
}: {
  label: string
  description: string
  href: string
  icon: LucideIcon
  stats?: { label: string; value: string | number }[]
}) {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">{label}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>

      {stats && stats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}
