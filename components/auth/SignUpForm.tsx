'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { PasswordInput } from '@/components/forms/inputs/PasswordInput'
import { Button } from '@/components/ui/button'
import { SocialAuthButtons } from './SocialAuthButtons'
import { AuthDivider } from './AuthDivider'
import { getAuthRedirectUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, User, Building2, ArrowLeft, Check } from 'lucide-react'

type AccountType = 'personal' | 'business'

export function SignUpForm() {
  const supabase = createClient()
  const t = useTranslations('auth')
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [accountType, setAccountType] = useState<AccountType | null>(null)
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
            account_type: accountType,
          },
          emailRedirectTo: getAuthRedirectUrl('/auth/callback?type=signup'),
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: t('emailAlreadyRegistered') })
          toast.error(t('accountAlreadyExists'), {
            description: t('accountAlreadyExistsDesc'),
          })
        } else {
          toast.error(t('signUpFailed'), {
            description: error.message,
          })
        }
        return
      }

      if (data.user) {
        toast.success(t('accountCreated'), {
          description: t('accountCreatedDesc'),
        })
        // Redirect to verify-email page so user knows to check their email
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
      }
    } catch (error) {
      toast.error(t('unexpectedError'))
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Account type selection
  if (step === 'type') {
    return (
      <div className="w-full">
        <h3 className="text-base font-semibold text-[hsl(var(--jungle-800))] text-center mb-1">
          {t('chooseAccountType')}
        </h3>
        <p className="text-sm text-[hsl(var(--jungle-600))] text-center mb-6">
          {t('chooseAccountTypeHint')}
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setAccountType('personal')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              accountType === 'personal'
                ? 'border-[hsl(var(--jungle-500))] bg-[hsl(var(--jungle-50))] shadow-sm shadow-[hsl(var(--jungle-500))]/10'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--jungle-300))] hover:bg-[hsl(var(--jungle-50))]/50'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                accountType === 'personal'
                  ? 'bg-[hsl(var(--jungle-500))] text-white'
                  : 'bg-[hsl(var(--jungle-100))] text-[hsl(var(--jungle-600))]'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[hsl(var(--jungle-800))]">{t('personalAccount')}</p>
                  {accountType === 'personal' && (
                    <div className="w-5 h-5 rounded-full bg-[hsl(var(--jungle-500))] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--jungle-600))] mt-0.5">
                  {t('personalAccountDesc')}
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('business')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              accountType === 'business'
                ? 'border-[hsl(var(--jungle-500))] bg-[hsl(var(--jungle-50))] shadow-sm shadow-[hsl(var(--jungle-500))]/10'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--jungle-300))] hover:bg-[hsl(var(--jungle-50))]/50'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                accountType === 'business'
                  ? 'bg-[hsl(var(--jungle-500))] text-white'
                  : 'bg-[hsl(var(--jungle-100))] text-[hsl(var(--jungle-600))]'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[hsl(var(--jungle-800))]">{t('businessAccount')}</p>
                  {accountType === 'business' && (
                    <div className="w-5 h-5 rounded-full bg-[hsl(var(--jungle-500))] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--jungle-600))] mt-0.5">
                  {t('businessAccountDesc')}
                </p>
              </div>
            </div>
          </button>
        </div>

        <Button
          type="button"
          onClick={() => { if (accountType) setStep('form') }}
          disabled={!accountType}
          className="w-full h-12 mt-6 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-medium transition-all disabled:opacity-40"
        >
          {t('continueButton')}
        </Button>

        <p className="mt-6 text-center text-sm text-[hsl(var(--jungle-600))]">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="font-medium text-[hsl(var(--jungle-500))] hover:text-[hsl(var(--jungle-700))] transition-colors">
            {t('signIn')}
          </Link>
        </p>
      </div>
    )
  }

  // Step 2: Signup form (social + email)
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setStep('type')}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--jungle-600))] hover:text-[hsl(var(--jungle-800))] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('changeAccountType')}
      </button>

      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-[hsl(var(--jungle-50))] rounded-lg border border-[hsl(var(--jungle-200))]">
        {accountType === 'personal' ? (
          <User className="w-4 h-4 text-[hsl(var(--jungle-600))] shrink-0" />
        ) : (
          <Building2 className="w-4 h-4 text-[hsl(var(--jungle-600))] shrink-0" />
        )}
        <span className="text-sm font-medium text-[hsl(var(--jungle-700))]">
          {accountType === 'personal' ? t('personalAccountLabel') : t('businessAccountLabel')}
        </span>
      </div>

      <SocialAuthButtons mode="signup" accountType={accountType} />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label={t('fullName')}
          name="name"
          value={formData.name}
          onChange={updateField('name')}
          required
          error={errors.name}
          placeholder={t('fullNamePlaceholder')}
        />

        <TextInput
          label={t('emailLabel')}
          name="email"
          type="email"
          value={formData.email}
          onChange={updateField('email')}
          required
          error={errors.email}
          placeholder={t('emailPlaceholder')}
        />

        <PasswordInput
          label={t('passwordLabel')}
          name="password"
          value={formData.password}
          onChange={updateField('password')}
          required
          error={errors.password}
          placeholder={t('createPasswordPlaceholder')}
          showStrengthIndicator
        />

        <PasswordInput
          label={t('confirmPassword')}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={updateField('confirmPassword')}
          required
          error={errors.confirmPassword}
          placeholder={t('confirmPasswordPlaceholder')}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-medium transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t('createAccountButton')
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--jungle-600))]">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/auth/login" className="font-medium text-[hsl(var(--jungle-500))] hover:text-[hsl(var(--jungle-700))] transition-colors">
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}
