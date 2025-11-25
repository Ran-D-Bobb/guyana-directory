'use client'

import Link from 'next/link'
import {
  LucideIcon,
  ArrowRight,
  Eye,
  MessageCircle,
  Star,
  TrendingUp,
  Clock,
  Building2,
  Calendar,
  Compass,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Eye,
  MessageCircle,
  Star,
  TrendingUp,
  Clock,
  Building2,
  Calendar,
  Compass,
  Home,
}

interface ActivityItem {
  id: string
  title: string
  subtitle?: string
  href: string
  badges?: Array<{
    label: string
    variant: 'verified' | 'featured' | 'pending' | 'approved' | 'success' | 'warning' | 'danger'
  }>
  stats?: Array<{
    icon: string
    value: number | string
    label?: string
  }>
  timestamp?: string
  image?: string
}

interface AdminRecentActivityProps {
  title: string
  icon: string
  iconColor?: string
  iconBg?: string
  items: ActivityItem[]
  viewAllHref: string
  viewAllLabel?: string
  emptyMessage?: string
  emptyIcon?: string
}

const badgeVariants = {
  verified: 'bg-blue-100 text-blue-700',
  featured: 'bg-amber-100 text-amber-700',
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-emerald-100 text-emerald-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-orange-100 text-orange-700',
  danger: 'bg-red-100 text-red-700',
}

export function AdminRecentActivity({
  title,
  icon,
  iconColor = 'text-emerald-600',
  iconBg = 'bg-emerald-100',
  items,
  viewAllHref,
  viewAllLabel = 'View All',
  emptyMessage = 'No recent activity',
  emptyIcon,
}: AdminRecentActivityProps) {
  const Icon = iconMap[icon] || Building2
  const EmptyIcon = emptyIcon ? iconMap[emptyIcon] : undefined

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg', iconBg)}>
            <Icon size={18} className={iconColor} />
          </div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Content */}
      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            {EmptyIcon && (
              <EmptyIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            )}
            <p className="text-slate-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-start gap-3 p-4 hover:bg-slate-50/80 transition-colors"
            >
              {item.image && (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.badges.map((badge, index) => (
                        <span
                          key={index}
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap',
                            badgeVariants[badge.variant]
                          )}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {item.subtitle && (
                  <p className="text-sm text-slate-500 mb-2 line-clamp-1">{item.subtitle}</p>
                )}

                <div className="flex items-center gap-4">
                  {item.stats && item.stats.map((stat, index) => {
                    const StatIcon = iconMap[stat.icon] || Eye
                    return (
                      <span
                        key={index}
                        className="flex items-center gap-1 text-xs text-slate-400"
                      >
                        <StatIcon size={12} />
                        <span className="font-medium">{stat.value}</span>
                        {stat.label && <span>{stat.label}</span>}
                      </span>
                    )
                  })}
                  {item.timestamp && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                      <Clock size={12} />
                      {item.timestamp}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

// Compact version for smaller spaces
export function AdminRecentActivityCompact({
  title,
  icon,
  iconColor = 'text-slate-600',
  items,
  viewAllHref,
}: {
  title: string
  icon: string
  iconColor?: string
  items: Array<{ id: string; title: string; href: string; value?: string | number }>
  viewAllHref: string
}) {
  const Icon = iconMap[icon] || Building2
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconColor} />
          <span className="text-sm font-medium text-slate-900">{title}</span>
        </div>
        <Link href={viewAllHref} className="text-xs text-slate-500 hover:text-emerald-600">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between py-1.5 text-sm hover:text-emerald-600 transition-colors"
          >
            <span className="text-slate-700 truncate">{item.title}</span>
            {item.value && (
              <span className="text-slate-400 text-xs flex-shrink-0 ml-2">{item.value}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
