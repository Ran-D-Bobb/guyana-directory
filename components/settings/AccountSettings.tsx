'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Monitor,
  Shield,
  Calendar,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  profileUpdateSchema,
  emailChangeSchema,
  passwordChangeSchema,
} from '@/lib/validations/settings'
import { getPasswordRequirements } from '@/lib/validations/auth'

interface AccountSettingsProps {
  user: {
    id: string
    email: string
    created_at: string
    app_metadata: { provider?: string; providers?: string[] }
    user_metadata: { full_name?: string; avatar_url?: string }
  }
  profile: {
    name: string | null
    phone: string | null
    account_type: string | null
  } | null
}

export function AccountSettings({ user, profile }: AccountSettingsProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  const isGoogleUser =
    user.app_metadata?.provider === 'google' ||
    (user.app_metadata?.providers?.includes('google') && !user.app_metadata?.providers?.includes('email'))

  // Profile form state
  const [name, setName] = useState(profile?.name || user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Email form state
  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const passwordReqs = getPasswordRequirements(newPassword)

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    const result = profileUpdateSchema.safeParse({ name, phone })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setSavingProfile(true)
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: result.data.name, phone: result.data.phone || null })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: result.data.name },
      })

      if (authError) throw authError

      toast.success('Profile updated successfully')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    const result = emailChangeSchema.safeParse({ email: newEmail })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    if (result.data.email === user.email) {
      toast.error('New email is the same as current email')
      return
    }

    setSavingEmail(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: result.data.email })
      if (error) throw error

      toast.success('Confirmation email sent. Please check both your old and new email.')
      setNewEmail('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update email'
      toast.error(message)
    } finally {
      setSavingEmail(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    const result = passwordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setSavingPassword(true)
    try {
      // Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: result.data.currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setSavingPassword(false)
        return
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: result.data.newPassword,
      })

      if (error) throw error

      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password'
      toast.error(message)
    } finally {
      setSavingPassword(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const inputClassName = "w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm min-h-[48px] md:min-h-[44px]"

  return (
    <div className="space-y-6">
      {/* Account Info - Read Only */}
      <div className="bg-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--jungle-100))] to-[hsl(var(--jungle-200))] flex items-center justify-center">
            <Shield className="h-5 w-5 text-[hsl(var(--jungle-600))]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Account Information</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Your account details</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Email</label>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{user.email}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Member Since</label>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
              <Calendar className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              {new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Account Type</label>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] capitalize">
              {profile?.account_type || 'Personal'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Auth Provider</label>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] capitalize">
              {isGoogleUser ? 'Google' : 'Email & Password'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile - Editable */}
      <div className="bg-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Profile</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Update your display name and phone number</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClassName}
              placeholder="+592 000 0000"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--jungle-500))] hover:bg-[hsl(var(--jungle-600))] text-white font-medium text-sm transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Email Change */}
      <div className="bg-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center">
            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Change Email</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              A confirmation link will be sent to both your current and new email
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label htmlFor="currentEmail" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              Current Email
            </label>
            <input
              id="currentEmail"
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm cursor-not-allowed min-h-[48px] md:min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              New Email
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputClassName}
              placeholder="newemail@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={savingEmail || !newEmail}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--jungle-500))] hover:bg-[hsl(var(--jungle-600))] text-white font-medium text-sm transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {savingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Confirmation
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Change Password</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Update your account password</p>
          </div>
        </div>

        {isGoogleUser ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Google Account</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                Your account is managed through Google. To change your password, visit your Google Account settings.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm min-h-[48px] md:min-h-[44px]"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm min-h-[48px] md:min-h-[44px]"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2 space-y-1">
                  {[
                    { key: 'minLength' as const, label: '8+ characters' },
                    { key: 'hasUppercase' as const, label: 'One uppercase letter' },
                    { key: 'hasLowercase' as const, label: 'One lowercase letter' },
                    { key: 'hasNumber' as const, label: 'One number' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          passwordReqs[key] ? 'bg-emerald-500' : 'bg-[hsl(var(--border))]'
                        }`}
                      />
                      <span className={passwordReqs[key] ? 'text-emerald-600' : 'text-[hsl(var(--muted-foreground))]'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClassName}
                placeholder="Confirm new password"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--jungle-500))] hover:bg-[hsl(var(--jungle-600))] text-white font-medium text-sm transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Theme Preference */}
      <div className="bg-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center">
            <Sun className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Appearance</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Choose your preferred theme</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[48px] ${
                  isActive
                    ? 'border-[hsl(var(--jungle-500))] bg-[hsl(var(--jungle-50))]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]'
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? 'text-[hsl(var(--jungle-600))]' : 'text-[hsl(var(--muted-foreground))]'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-[hsl(var(--jungle-700))]' : 'text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {option.label}
                </span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--jungle-500))]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
