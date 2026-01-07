'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { PasswordInput } from '@/components/forms/inputs/PasswordInput'
import { Button } from '@/components/ui/button'
import { SocialAuthButtons } from './SocialAuthButtons'
import { AuthDivider } from './AuthDivider'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function SignUpForm() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({})

  const updateField = (field: keyof SignUpFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = signUpSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignUpFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            full_name: formData.name,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists' })
          toast.error('Account already exists', {
            description: 'Please sign in instead or use a different email.',
          })
        } else {
          toast.error('Sign up failed', {
            description: error.message,
          })
        }
        return
      }

      if (data.user) {
        toast.success('Account created!', {
          description: 'Welcome to Waypoint.',
        })
        // Use hard navigation to ensure server components re-fetch auth state
        window.location.href = '/'
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <SocialAuthButtons mode="signup" />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Full name"
          name="name"
          value={formData.name}
          onChange={updateField('name')}
          required
          error={errors.name}
          placeholder="Enter your name"
        />

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
          placeholder="Create a password"
          showStrengthIndicator
        />

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={updateField('confirmPassword')}
          required
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
