import { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { MapPin, Star, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign Up - Waypoint',
  description: 'Create your Waypoint account to discover Guyana.',
}

const features = [
  { icon: MapPin, text: 'Discover local businesses & hidden gems' },
  { icon: Star, text: 'Leave reviews & share your experiences' },
  { icon: Shield, text: 'List and manage your own business' },
]

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Decorative Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh-dark" />
        {/* Subtle texture */}
        <div className="absolute inset-0 leaf-pattern opacity-20" />
        {/* Gold accent line on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[hsl(var(--gold-500))]/30 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <span className="font-display text-lg text-[hsl(var(--gold-400))]">W</span>
              </div>
              <span className="font-display text-xl text-white/90">Waypoint</span>
            </Link>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <p className="text-[hsl(var(--gold-400))] text-sm font-medium tracking-widest uppercase mb-4">
                Join the community
              </p>
              <h1 className="font-display text-4xl xl:text-5xl text-white leading-[1.1] tracking-tight">
                Discover the<br />best of{' '}
                <span className="text-gradient-gold">Guyana</span>
              </h1>
              <p className="text-white/60 text-lg mt-5 max-w-sm leading-relaxed">
                Connect with local businesses, explore events, and uncover hidden gems across the country.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-[hsl(var(--gold-400))]" />
                  </div>
                  <span className="text-white/70 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Waypoint. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[hsl(var(--jungle-50))]">
        <div className="w-full max-w-[440px]">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl text-[hsl(var(--jungle-700))]">Waypoint</span>
            </Link>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.04] border border-[hsl(var(--border))] p-6 sm:p-8">
            <div className="text-center mb-7">
              <h2 className="font-display text-2xl text-[hsl(var(--jungle-800))]">
                Create your account
              </h2>
              <p className="mt-2 text-[hsl(var(--jungle-600))] text-sm">
                Join Waypoint to discover Guyana
              </p>
            </div>

            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  )
}
