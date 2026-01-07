'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'

export function ForgotPasswordForm() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({})

  const updateField = (field: keyof ForgotPasswordFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form data
    const result = forgotPasswordSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ForgotPasswordFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        toast.error('Failed to send reset email', {
          description: error.message,
        })
        return
      }

      // Always show success even if email doesn't exist (security best practice)
      setEmailSent(true)
      setSentToEmail(formData.email)
      toast.success('Reset email sent', {
        description: 'Check your inbox for the password reset link.',
      })
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sentToEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        toast.error('Failed to resend email', {
          description: error.message,
        })
      } else {
        toast.success('Email sent', {
          description: 'We sent another password reset email.',
        })
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-600 mb-6">
          We sent a password reset link to<br />
          <span className="font-medium text-gray-900">{sentToEmail}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Click the link in the email to reset your password.
        </p>
        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Resend reset email
          </Button>
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

  return (
    <div className="w-full">
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
          helperText="Enter the email address associated with your account."
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
