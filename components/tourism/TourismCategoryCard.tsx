'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { getTourismCategoryImage } from '@/lib/category-images';

interface TourismCategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string | null;
  };
  experienceCount?: number;
  imageUrl?: string;
}

export default function TourismCategoryCard({ category, experienceCount = 0, imageUrl }: TourismCategoryCardProps) {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[category.icon] || Icons.MapPin;
  const categoryImage = imageUrl || getTourismCategoryImage(category.slug);

  return (
    <Link href={`/tourism/category/${category.slug}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
          <Image
            src={categoryImage}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          {/* Icon Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md">
            <IconComponent className="h-6 w-6 text-green-600" />
          </div>

          {/* Count Badge */}
          {experienceCount > 0 && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {experienceCount} {experienceCount === 1 ? 'Experience' : 'Experiences'}
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Hover Call to Action */}
          <div className="mt-3 flex items-center text-sm text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Explore</span>
            <Icons.ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}