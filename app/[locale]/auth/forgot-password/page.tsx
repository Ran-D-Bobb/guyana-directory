import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')
  return {
    title: t('forgotPasswordPageTitle'),
    description: 'Reset your Waypoint account password.',
  }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth')

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[hsl(var(--jungle-50))] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.04] border border-[hsl(var(--border))] p-6 sm:p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl text-[hsl(var(--jungle-700))]">Waypoint</span>
            </Link>
            <h2 className="font-display text-2xl text-[hsl(var(--jungle-800))]">{t('forgotTitle')}</h2>
            <p className="mt-2 text-[hsl(var(--jungle-600))] text-sm">{t('forgotSubtitle')}</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
