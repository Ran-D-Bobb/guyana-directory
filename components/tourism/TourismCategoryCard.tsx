'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

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

// Tourism category-specific images (using Unsplash)
const categoryImages: { [key: string]: string } = {
  'nature-wildlife': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop', // Rainforest
  'adventure': 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&h=600&fit=crop', // Kayaking
  'culture': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', // Cultural performance
  'eco-lodges': 'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=800&h=600&fit=crop', // Eco lodge
  'tours-guides': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop', // Tour guide
  'water-activities': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', // Water activity
  'food-culinary': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&h=600&fit=crop', // Local cuisine
  'history-heritage': 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=600&fit=crop', // Colonial architecture
  'photography': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop', // Photography
  'bird-watching': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=600&fit=crop', // Bird
  'expeditions': 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&h=600&fit=crop', // Expedition
  'transfers': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop', // Transfer vehicle
};

export default function TourismCategoryCard({ category, experienceCount = 0, imageUrl }: TourismCategoryCardProps) {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[category.icon] || Icons.MapPin;
  const categoryImage = imageUrl || categoryImages[category.slug] || categoryImages['nature-wildlife'];

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