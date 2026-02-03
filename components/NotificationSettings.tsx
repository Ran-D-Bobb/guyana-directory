'use client';

import { useState, useEffect } from 'react';
import { usePush } from './providers/PushProvider';
import { Bell, BellOff, Loader2 } from 'lucide-react';

type NotificationPreferences = {
  new_review: boolean;
  review_reply: boolean;
  business_approved: boolean;
  new_follower: boolean;
  event_reminder: boolean;
  promotions: boolean;
};

export function NotificationSettings() {
  const { isSupported, isEnabled, permissionStatus, isLoading, enablePush, disablePush } = usePush();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [enabling, setEnabling] = useState(false);

  // Fetch preferences when enabled
  useEffect(() => {
    if (isEnabled) {
      fetchPreferences();
    }
  }, [isEnabled]);

  async function fetchPreferences() {
    try {
      const response = await fetch('/api/push/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  }

  async function updatePreference(key: keyof NotificationPreferences, value: boolean) {
    if (!preferences) return;

    setSaving(true);
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const response = await fetch('/api/push/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        // Revert on error
        setPreferences(preferences);
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  }

  async function handleEnablePush() {
    setEnabling(true);
    await enablePush();
    setEnabling(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading notification settings...</span>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <BellOff className="h-5 w-5" />
          <span className="font-medium">Notifications not supported</span>
        </div>
        <p className="mt-1 text-sm text-amber-700">
          Push notifications are not available on this device or browser.
          Try using the Waypoint mobile app for the best experience.
        </p>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="font-medium">Push Notifications</span>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={enabling || permissionStatus === 'denied'}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {enabling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : permissionStatus === 'denied' ? (
              'Blocked'
            ) : (
              'Enable'
            )}
          </button>
        </div>
        {permissionStatus === 'denied' && (
          <p className="mt-2 text-sm text-gray-600">
            Notifications are blocked. Please enable them in your browser or device settings.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <span className="font-medium">Push Notifications</span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Enabled
          </span>
        </div>
        <button
          onClick={disablePush}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Disable all
        </button>
      </div>

      {preferences && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <NotificationToggle
            label="New reviews"
            description="When someone reviews your business"
            checked={preferences.new_review}
            onChange={(v) => updatePreference('new_review', v)}
            disabled={saving}
          />
          <NotificationToggle
            label="Review replies"
            description="When a business owner replies to your review"
            checked={preferences.review_reply}
            onChange={(v) => updatePreference('review_reply', v)}
            disabled={saving}
          />
          <NotificationToggle
            label="Business approved"
            description="When your business listing is approved"
            checked={preferences.business_approved}
            onChange={(v) => updatePreference('business_approved', v)}
            disabled={saving}
          />
          <NotificationToggle
            label="New followers"
            description="When someone follows your business"
            checked={preferences.new_follower}
            onChange={(v) => updatePreference('new_follower', v)}
            disabled={saving}
          />
          <NotificationToggle
            label="Event reminders"
            description="Reminders for events you&apos;re interested in"
            checked={preferences.event_reminder}
            onChange={(v) => updatePreference('event_reminder', v)}
            disabled={saving}
          />
          <NotificationToggle
            label="Promotions"
            description="Special offers and marketing updates"
            checked={preferences.promotions}
            onChange={(v) => updatePreference('promotions', v)}
            disabled={saving}
          />
        </div>
      )}
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
          checked ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
