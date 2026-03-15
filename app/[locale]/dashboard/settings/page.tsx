import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AccountSettings } from '@/components/settings/AccountSettings'

export const metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone, account_type')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-[hsl(var(--jungle-50))] pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        {/* Back link */}
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Manage your account preferences and security
        </p>

        <AccountSettings
          user={{
            id: user.id,
            email: user.email!,
            created_at: user.created_at,
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
          }}
          profile={profile}
        />
      </div>
    </main>
  )
}
