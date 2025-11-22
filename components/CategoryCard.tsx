import Link from 'next/link'
import * as LucideIcons from 'lucide-react'

interface CategoryCardProps {
  name: string
  slug: string
  icon: string
  description: string | null
}

export function CategoryCard({ name, slug, icon, description }: CategoryCardProps) {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] || LucideIcons.MoreHorizontal

  return (
    <Link
      href={`/businesses/category/${slug}`}
      className="flex flex-col items-center gap-3 p-6 rounded-lg border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 bg-white"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-center text-gray-900">{name}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center line-clamp-2">{description}</p>
      )}
    </Link>
  )
}
