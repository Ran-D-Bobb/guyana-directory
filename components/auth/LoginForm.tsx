'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { PasswordInput } from '@/components/forms/inputs/PasswordInput'
import { Button } from '@/components/ui/button'
import { SocialAuthButtons } from './SocialAuthButtons'
import { AuthDivider } from './AuthDivider'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import { getAuthRedirectUrl } from '@/lib/utils'

export function LoginForm() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showUnverifiedWarning, setShowUnverifiedWarning] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})

  const updateField = (field: keyof LoginFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear unverified warning when user changes input
    if (showUnverifiedWarning) {
      setShowUnverifiedWarning(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setShowUnverifiedWarning(false)

    // Validate form data
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // Handle specific errors
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid credentials', {
            description: 'Please check your email and password.',
          })
          setErrors({ password: 'Invalid email or password' })
        } else if (error.message.includes('Email not confirmed')) {
          setShowUnverifiedWarning(true)
          setUnverifiedEmail(formData.email)
          toast.error('Email not verified', {
            description: 'Please check your email for the verification link.',
          })
        } else {
          toast.error('Sign in failed', {
            description: error.message,
          })
        }
        return
      }

      if (data.user) {
        toast.success('Welcome back!')
        // Use hard navigation to ensure server components re-fetch auth state
        window.location.href = '/'
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
        options: {
          emailRedirectTo: getAuthRedirectUrl('/auth/callback?type=signup'),
        },
      })

      if (error) {
        toast.error('Failed to resend email', {
          description: error.message,
        })
      } else {
        toast.success('Verification email sent', {
          description: 'Please check your inbox.',
        })
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <SocialAuthButtons mode="signin" />

      <AuthDivider />

      {showUnverifiedWarning && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Email not verified</p>
              <p className="text-sm text-amber-700 mt-1">
                Please verify your email before signing in.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isLoading}
                className="text-sm text-amber-700 underline hover:text-amber-800 mt-2"
              >
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={updateField('email')}
          required
          error={errors.email}
          placeholder="you@example.com"
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={updateField('password')}
          required
          error={errors.password}
          placeholder="Enter your password"
        />

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[hsl(var(--jungle-500))] hover:text-[hsl(var(--jungle-700))] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-medium transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--jungle-600))]">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-[hsl(var(--jungle-500))] hover:text-[hsl(var(--jungle-700))] transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  )
}
