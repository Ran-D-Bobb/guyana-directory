'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  initializePushNotifications,
  isPushSupported,
  getPushPermissionStatus,
  unregisterPushNotifications,
} from '@/lib/push-notifications';
import { createClient } from '@/lib/supabase/client';

type PushContextType = {
  isSupported: boolean;
  isEnabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported';
  isLoading: boolean;
  enablePush: () => Promise<boolean>;
  disablePush: () => Promise<void>;
};

const PushContext = createContext<PushContextType>({
  isSupported: false,
  isEnabled: false,
  permissionStatus: 'unsupported',
  isLoading: true,
  enablePush: async () => false,
  disablePush: async () => {},
});

export function usePush() {
  return useContext(PushContext);
}

export function PushProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('unsupported');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  // Check support and permission on mount
  useEffect(() => {
    async function checkPushStatus() {
      const supported = await isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const status = await getPushPermissionStatus();
        setPermissionStatus(status);
        setIsEnabled(status === 'granted');
      }

      setIsLoading(false);
    }

    checkPushStatus();
  }, []);

  // Get user ID for registration
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);

      // Auto-initialize if already granted permission
      if (user && permissionStatus === 'granted') {
        initializePushNotifications(user.id);
      }
    }

    if (!isLoading) {
      getUser();
    }
  }, [isLoading, permissionStatus]);

  // Listen for auth changes
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserId(session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user && permissionStatus === 'granted') {
          // Re-register device token with new user
          await initializePushNotifications(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // Optionally unregister on sign out
          // await unregisterPushNotifications();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [permissionStatus]);

  const enablePush = async (): Promise<boolean> => {
    if (!isSupported) return false;

    const success = await initializePushNotifications(userId);

    if (success) {
      setIsEnabled(true);
      setPermissionStatus('granted');
    } else {
      const status = await getPushPermissionStatus();
      setPermissionStatus(status);
    }

    return success;
  };

  const disablePush = async (): Promise<void> => {
    await unregisterPushNotifications();
    setIsEnabled(false);
  };

  return (
    <PushContext.Provider
      value={{
        isSupported,
        isEnabled,
        permissionStatus,
        isLoading,
        enablePush,
        disablePush,
      }}
    >
      {children}
    </PushContext.Provider>
  );
}
