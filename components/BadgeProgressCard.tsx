'use client'

import { Award, Star, Crown, Trophy, ChevronRight } from 'lucide-react'
import { ReviewerBadge, BadgeTier, getBadgeProgress, getBadgeFromReviewCount } from './ReviewerBadge'

interface BadgeProgressCardProps {
  reviewCount: number
}

const badgeInfo: Record<NonNullable<BadgeTier>, {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  reviews: string
}> = {
  newcomer: {
    label: 'Newcomer',
    icon: <Star className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    reviews: '1-2 reviews',
  },
  contributor: {
    label: 'Contributor',
    icon: <Award className="w-5 h-5" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    reviews: '3-5 reviews',
  },
  local_expert: {
    label: 'Local Expert',
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    reviews: '6-9 reviews',
  },
  top_reviewer: {
    label: 'Top Reviewer',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    reviews: '10+ reviews',
  },
}

const badgeTiers: NonNullable<BadgeTier>[] = ['newcomer', 'contributor', 'local_expert', 'top_reviewer']

export function BadgeProgressCard({ reviewCount }: BadgeProgressCardProps) {
  const { nextBadge, reviewsNeeded } = getBadgeProgress(reviewCount)
  const currentBadgeActual = getBadgeFromReviewCount(reviewCount)

  // Calculate overall progress (0-100) across all tiers
  const overallProgress = reviewCount === 0 ? 0 :
    reviewCount >= 10 ? 100 :
    reviewCount >= 6 ? 75 + ((reviewCount - 6) / 4) * 25 :
    reviewCount >= 3 ? 50 + ((reviewCount - 3) / 3) * 25 :
    reviewCount >= 1 ? 25 + ((reviewCount - 1) / 2) * 25 :
    0

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
        Reviewer Badge
      </h2>

      {/* Current Badge Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {currentBadgeActual ? (
            <>
              <div className={`p-3 rounded-xl ${badgeInfo[currentBadgeActual].bgColor}`}>
                <span className={badgeInfo[currentBadgeActual].color}>
                  {badgeInfo[currentBadgeActual].icon}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Badge</p>
                <ReviewerBadge badge={currentBadgeActual} size="md" showTooltip={false} />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-gray-100">
                <Star className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Badge</p>
                <p className="font-medium text-gray-600">No badge yet</p>
              </div>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[hsl(var(--jungle-700))]">{reviewCount}</p>
          <p className="text-sm text-gray-500">{reviewCount === 1 ? 'review' : 'reviews'}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-[hsl(var(--jungle-600))]">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[hsl(var(--jungle-500))] to-[hsl(var(--jungle-400))] rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Next Badge Preview */}
      {nextBadge && (
        <div className="mb-6 p-4 rounded-xl bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-100))]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${badgeInfo[nextBadge].bgColor}`}>
              <span className={badgeInfo[nextBadge].color}>
                {badgeInfo[nextBadge].icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Next: <span className="font-semibold">{badgeInfo[nextBadge].label}</span></p>
              <p className="text-sm text-[hsl(var(--jungle-600))] font-medium">
                {reviewsNeeded} more {reviewsNeeded === 1 ? 'review' : 'reviews'} to go!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Badge Tiers */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">All Badge Tiers</p>
        {badgeTiers.map((tier, index) => {
          const info = badgeInfo[tier]
          const isUnlocked = currentBadgeActual && badgeTiers.indexOf(currentBadgeActual) >= index
          const isCurrent = currentBadgeActual === tier

          return (
            <div
              key={tier}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isCurrent
                  ? 'bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-200))]'
                  : isUnlocked
                    ? 'bg-gray-50'
                    : 'opacity-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${info.bgColor}`}>
                <span className={info.color}>
                  {info.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {info.label}
                </p>
                <p className="text-xs text-gray-500">{info.reviews}</p>
              </div>
              {isCurrent && (
                <span className="text-xs font-medium text-[hsl(var(--jungle-600))] bg-[hsl(var(--jungle-100))] px-2 py-1 rounded-full">
                  Current
                </span>
              )}
              {isUnlocked && !isCurrent && (
                <span className="text-xs text-gray-400">Unlocked</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
