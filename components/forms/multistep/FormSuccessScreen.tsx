'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Home, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FormSuccessScreenProps {
  title?: string
  message?: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  className?: string
}

export function FormSuccessScreen({
  title = 'Successfully Submitted!',
  message = 'Your submission has been received and is being processed.',
  primaryAction,
  secondaryAction,
  className,
}: FormSuccessScreenProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[60vh] px-6 py-12',
      className
    )}>
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="relative"
      >
        {/* Pulse rings */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="absolute inset-0 rounded-full bg-emerald-200"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.5,
            delay: 0.2,
          }}
          className="absolute inset-0 rounded-full bg-emerald-300"
        />

        {/* Check icon */}
        <div className="relative w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.3,
            }}
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-2xl font-bold text-gray-900 text-center"
      >
        {title}
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-gray-600 text-center max-w-md"
      >
        {message}
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        {primaryAction && (
          <Button
            size="lg"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={primaryAction.onClick}
            asChild={!!primaryAction.href}
          >
            {primaryAction.href ? (
              <a href={primaryAction.href}>
                {primaryAction.icon || <ArrowRight className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </a>
            ) : (
              <>
                {primaryAction.icon || <ArrowRight className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </>
            )}
          </Button>
        )}

        {secondaryAction && (
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={secondaryAction.onClick}
            asChild={!!secondaryAction.href}
          >
            {secondaryAction.href ? (
              <a href={secondaryAction.href}>
                {secondaryAction.icon || <Home className="w-4 h-4 mr-2" />}
                {secondaryAction.label}
              </a>
            ) : (
              <>
                {secondaryAction.icon || <Home className="w-4 h-4 mr-2" />}
                {secondaryAction.label}
              </>
            )}
          </Button>
        )}
      </motion.div>
    </div>
  )
}

// Pre-configured success screens for common use cases
export function BusinessSuccessScreen({ businessSlug }: { businessSlug?: string }) {
  return (
    <FormSuccessScreen
      title="Business Listed!"
      message="Your business has been submitted successfully. It will be visible to customers shortly."
      primaryAction={{
        label: 'View Business',
        href: businessSlug ? `/businesses/${businessSlug}` : '/dashboard/my-business',
      }}
      secondaryAction={{
        label: 'Add Photos',
        href: '/dashboard/my-business/photos',
        icon: <Plus className="w-4 h-4 mr-2" />,
      }}
    />
  )
}

export function RentalSuccessScreen({ rentalId }: { rentalId?: string }) {
  return (
    <FormSuccessScreen
      title="Rental Listed!"
      message="Your rental property has been published and is now visible to potential tenants."
      primaryAction={{
        label: 'Add Photos',
        href: rentalId ? `/dashboard/my-rentals/${rentalId}/photos` : '/dashboard/my-rentals',
        icon: <Plus className="w-4 h-4 mr-2" />,
      }}
      secondaryAction={{
        label: 'View Listings',
        href: '/dashboard/my-rentals',
      }}
    />
  )
}

export function EventSuccessScreen({ eventSlug }: { eventSlug?: string }) {
  return (
    <FormSuccessScreen
      title="Event Created!"
      message="Your event has been published and is ready to receive attendees."
      primaryAction={{
        label: 'View Event',
        href: eventSlug ? `/events/${eventSlug}` : '/dashboard/my-events',
      }}
      secondaryAction={{
        label: 'Create Another',
        href: '/dashboard/my-events/new',
        icon: <Plus className="w-4 h-4 mr-2" />,
      }}
    />
  )
}

export function TourismSuccessScreen({ experienceSlug }: { experienceSlug?: string }) {
  return (
    <FormSuccessScreen
      title="Experience Listed!"
      message="Your tourism experience has been submitted and will be visible to tourists shortly."
      primaryAction={{
        label: 'View Experience',
        href: experienceSlug ? `/tourism/${experienceSlug}` : '/dashboard/my-experiences',
      }}
      secondaryAction={{
        label: 'Add Photos',
        href: '/dashboard/my-experiences/photos',
        icon: <Plus className="w-4 h-4 mr-2" />,
      }}
    />
  )
}
