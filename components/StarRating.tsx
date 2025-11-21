import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showNumber?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-8 h-8',
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showNumber = false,
  className = ''
}: StarRatingProps) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75
  const hasThreeQuarterStar = rating % 1 >= 0.75

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      // Full star
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
        />
      )
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Half star - use a wrapper with gradient
      stars.push(
        <div key={i} className="relative inline-block">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      )
    } else if (i === fullStars + 1 && hasThreeQuarterStar) {
      // Three-quarter star
      stars.push(
        <div key={i} className="relative inline-block">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '75%' }}>
            <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      )
    } else {
      // Empty star
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} text-gray-300`}
        />
      )
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars}
      {showNumber && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
