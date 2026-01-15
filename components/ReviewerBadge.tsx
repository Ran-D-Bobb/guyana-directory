'use client'

import { Award, Star, Crown, Trophy } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type BadgeTier = 'newcomer' | 'contributor' | 'local_expert' | 'top_reviewer' | null

interface BadgeConfig {
  label: string
  description: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  borderColor: string
  iconColor: string
}

const badgeConfigs: Record<NonNullable<BadgeTier>, BadgeConfig> = {
  newcomer: {
    label: 'Newcomer',
    description: 'Wrote 1-2 reviews',
    icon: <Star className="w-3 h-3" />,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  contributor: {
    label: 'Contributor',
    description: 'Wrote 3-5 reviews',
    icon: <Award className="w-3 h-3" />,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    iconColor: 'text-slate-500',
  },
  local_expert: {
    label: 'Local Expert',
    description: 'Wrote 6-9 reviews',
    icon: <Trophy className="w-3 h-3" />,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    iconColor: 'text-yellow-600',
  },
  top_reviewer: {
    label: 'Top Reviewer',
    description: 'Wrote 10+ reviews',
    icon: <Crown className="w-3 h-3" />,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
  },
}

interface ReviewerBadgeProps {
  badge: BadgeTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showTooltip?: boolean
}

export function ReviewerBadge({
  badge,
  size = 'sm',
  showLabel = true,
  showTooltip = true,
}: ReviewerBadgeProps) {
  if (!badge) return null

  const config = badgeConfigs[badge]

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const badgeContent = (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${config.bgColor} ${config.textColor} border ${config.borderColor} rounded-full font-medium`}
    >
      <span className={config.iconColor}>
        {size === 'sm' ? config.icon : (
          size === 'md' ? (
            <span className={iconSizes.md}>{config.icon}</span>
          ) : (
            <span className={iconSizes.lg}>{config.icon}</span>
          )
        )}
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  )

  if (!showTooltip) {
    return badgeContent
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{config.label}</p>
          <p className="text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Helper function to calculate badge from review count
export function getBadgeFromReviewCount(reviewCount: number | null | undefined): BadgeTier {
  if (!reviewCount || reviewCount === 0) return null
  if (reviewCount >= 1 && reviewCount <= 2) return 'newcomer'
  if (reviewCount >= 3 && reviewCount <= 5) return 'contributor'
  if (reviewCount >= 6 && reviewCount <= 9) return 'local_expert'
  return 'top_reviewer' // 10+
}

// Helper function to get progress to next badge
export function getBadgeProgress(reviewCount: number | null | undefined): {
  currentBadge: BadgeTier
  nextBadge: BadgeTier
  reviewsNeeded: number
  progress: number // 0-100
} {
  const count = reviewCount ?? 0

  if (count === 0) {
    return { currentBadge: null, nextBadge: 'newcomer', reviewsNeeded: 1, progress: 0 }
  }
  if (count >= 1 && count <= 2) {
    return { currentBadge: 'newcomer', nextBadge: 'contributor', reviewsNeeded: 3 - count, progress: ((count - 1) / 2) * 100 }
  }
  if (count >= 3 && count <= 5) {
    return { currentBadge: 'contributor', nextBadge: 'local_expert', reviewsNeeded: 6 - count, progress: ((count - 3) / 3) * 100 }
  }
  if (count >= 6 && count <= 9) {
    return { currentBadge: 'local_expert', nextBadge: 'top_reviewer', reviewsNeeded: 10 - count, progress: ((count - 6) / 4) * 100 }
  }
  // 10+
  return { currentBadge: 'top_reviewer', nextBadge: null, reviewsNeeded: 0, progress: 100 }
}
