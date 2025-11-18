'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';

interface TourismWhatsAppButtonProps {
  whatsappNumber: string;
  experienceName: string;
  experienceId: string;
  variant?: 'default' | 'booking' | 'compact';
  className?: string;
  source?: 'detail' | 'card' | 'kiosk';
  userId?: string | null;
  showText?: boolean;
  children?: React.ReactNode;
}

export function TourismWhatsAppButton({
  whatsappNumber,
  experienceName,
  experienceId,
  variant = 'default',
  className,
  source = 'detail',
  userId,
  showText = true,
  children
}: TourismWhatsAppButtonProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  // Detect device type
  const getDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Generate session ID for anonymous tracking
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('tourism_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tourism_session_id', sessionId);
    }
    return sessionId;
  };

  const trackInquiryClick = async () => {
    try {
      // Insert into tourism_inquiry_clicks table
      const { error } = await supabase
        .from('tourism_inquiry_clicks')
        .insert({
          experience_id: experienceId,
          device_type: getDeviceType(),
          user_agent: navigator.userAgent,
          location_source: source,
          user_id: userId || null,
          session_id: getSessionId(),
          user_preferences: {
            timestamp: new Date().toISOString(),
            experience_name: experienceName,
            source_page: window.location.pathname
          }
        });

      if (error) {
        console.error('Error tracking inquiry click:', error);
        // Don't show error to user - tracking shouldn't block the main action
      }
    } catch (error) {
      console.error('Error tracking inquiry click:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    setIsLoading(true);

    // Track the inquiry click
    await trackInquiryClick();

    // Format the phone number (remove spaces, dashes, etc.)
    const formattedPhone = whatsappNumber.replace(/\D/g, '');

    // Create the message
    const message = `Hi! I found "${experienceName}" on Guyana Tourism Directory and I'm interested in booking. Could you please provide more information?`;

    // Determine if mobile or desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Show success message
    toast.success('Opening WhatsApp...');

    setIsLoading(false);
  };

  // Variant-specific styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'booking':
        return cn(
          'w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
          'text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl',
          'transform transition-all duration-200 hover:-translate-y-0.5'
        );
      case 'compact':
        return cn(
          'bg-green-600 hover:bg-green-700 text-white',
          'text-sm py-2 px-4'
        );
      default:
        return cn(
          'bg-green-600 hover:bg-green-700 text-white',
          'font-medium shadow-md hover:shadow-lg'
        );
    }
  };

  // Variant-specific content
  const getButtonContent = () => {
    if (children) return children;

    switch (variant) {
      case 'booking':
        return (
          <>
            <MessageCircle className="h-6 w-6 mr-2" />
            {showText && <span>Book via WhatsApp</span>}
          </>
        );
      case 'compact':
        return (
          <>
            <MessageCircle className="h-4 w-4 mr-1" />
            {showText && <span>Inquire</span>}
          </>
        );
      default:
        return (
          <>
            <MessageCircle className="h-5 w-5 mr-2" />
            {showText && <span>Contact via WhatsApp</span>}
          </>
        );
    }
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      disabled={isLoading}
      className={cn(getVariantClasses(), className)}
      size={variant === 'compact' ? 'sm' : variant === 'booking' ? 'lg' : 'default'}
    >
      {isLoading ? (
        <span className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Opening...
        </span>
      ) : (
        getButtonContent()
      )}
    </Button>
  );
}