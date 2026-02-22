'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { PasswordInput } from '@/components/forms/inputs/PasswordInput'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null)
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({})

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setHasValidSession(!!session)
    }
    checkSession()
  }, [supabase.auth])

  const updateField = (field: keyof ResetPasswordFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form data
    const result = resetPasswordSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ResetPasswordFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('same as')) {
          setErrors({ password: 'New password must be different from your current password' })
        } else {
          toast.error('Failed to reset password', {
            description: error.message,
          })
        }
        return
      }

      setIsSuccess(true)
      toast.success('Password updated', {
        description: 'Your password has been successfully reset.',
      })

      // Sign out and redirect to login after a short delay
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while checking session
  if (hasValidSession === null) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
        <p className="text-gray-500 mt-4">Verifying your reset link...</p>
      </div>
    )
  }

  // Invalid or expired session
  if (!hasValidSession) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Link expired</h2>
        <p className="text-gray-600 mb-6">
          This password reset link has expired or is invalid.
        </p>
        <div className="space-y-3">
          <Link href="/auth/forgot-password">
            <Button className="w-full bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))]">
              Request new reset link
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-[hsl(var(--jungle-100))] rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-[hsl(var(--jungle-500))]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password updated</h2>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to sign in...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New password"
          name="password"
          value={formData.password}
          onChange={updateField('password')}
          required
          error={errors.password}
          placeholder="Enter new password"
          showStrengthIndicator
        />

        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={updateField('confirmPassword')}
          required
          error={errors.confirmPassword}
          placeholder="Confirm new password"
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-medium transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </div>
  )
}
