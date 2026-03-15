'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { getAuthRedirectUrl } from '@/lib/utils'

export function ForgotPasswordForm() {
  const supabase = createClient()
  const t = useTranslations('auth')
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
        redirectTo: getAuthRedirectUrl('/auth/callback?type=recovery'),
      })

      if (error) {
        toast.error(t('failedToSendResetEmail'), {
          description: error.message,
        })
        return
      }

      // Always show success even if email doesn't exist (security best practice)
      setEmailSent(true)
      setSentToEmail(formData.email)
      toast.success(t('resetEmailSent'), {
        description: t('resetEmailSentDesc'),
      })
    } catch (error) {
      toast.error(t('unexpectedError'))
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sentToEmail, {
        redirectTo: getAuthRedirectUrl('/auth/callback?type=recovery'),
      })

      if (error) {
        toast.error(t('failedToResendEmail'), {
          description: error.message,
        })
      } else {
        toast.success(t('emailSentToast'), {
          description: t('emailSentToastDesc'),
        })
      }
    } catch {
      toast.error(t('unexpectedError'))
    } finally {
      setIsLoading(false)
    }
  }

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-[hsl(var(--jungle-100))] rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-[hsl(var(--jungle-500))]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('checkEmailTitle')}</h2>
        <p className="text-gray-600 mb-6">
          {t('checkEmailBody')}<br />
          <span className="font-medium text-gray-900">{sentToEmail}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {t('clickLinkToReset')}
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
            {t('resendResetEmail')}
          </Button>
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToSignIn')}
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
          label={t('emailLabel')}
          name="email"
          type="email"
          value={formData.email}
          onChange={updateField('email')}
          required
          error={errors.email}
          placeholder={t('emailPlaceholder')}
          helperText={t('emailHelperText')}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-medium transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t('sendResetLink')
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/auth/login" className="font-medium text-[hsl(var(--jungle-500))] hover:text-[hsl(var(--jungle-700))] inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('backToSignIn')}
        </Link>
      </p>
    </div>
  )
}
