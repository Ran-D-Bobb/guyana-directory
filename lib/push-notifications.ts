/**
 * Push Notifications - Unified handler for native (FCM) and web push
 */

import { isNativePlatform, getPlatform } from './capacitor';

type PushSubscriptionData = {
  token: string;
  platform: 'ios' | 'android' | 'web';
  userId?: string;
};

type NotificationData = {
  type?: string;
  businessId?: string;
  eventId?: string;
  url?: string;
  [key: string]: string | undefined;
};

/**
 * Initialize push notifications based on platform
 */
export async function initializePushNotifications(userId?: string): Promise<boolean> {
  try {
    const native = await isNativePlatform();

    if (native) {
      return initializeNativePush(userId);
    } else {
      return initializeWebPush(userId);
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return false;
  }
}

/**
 * Native push (iOS/Android via Capacitor + FCM)
 */
async function initializeNativePush(userId?: string): Promise<boolean> {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Check current permission status
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permission denied');
      return false;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Handle successful registration
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value);

      const platform = await getPlatform();
      await registerDeviceToken({
        token: token.value,
        platform,
        userId,
      });
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Handle notifications received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received in foreground:', notification);
      // Could show an in-app notification here using toast
    });

    // Handle notification tap (app opened from notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed:', action);
      handleNotificationTap(action.notification.data as NotificationData);
    });

    return true;
  } catch (error) {
    console.error('Native push initialization failed:', error);
    return false;
  }
}

/**
 * Web Push API (for PWA users)
 */
async function initializeWebPush(userId?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web Push not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Web push permission denied');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend
    await registerDeviceToken({
      token: JSON.stringify(subscription),
      platform: 'web',
      userId,
    });

    return true;
  } catch (error) {
    console.error('Web push initialization failed:', error);
    return false;
  }
}

/**
 * Register device token with backend
 */
async function registerDeviceToken(data: PushSubscriptionData): Promise<void> {
  try {
    const response = await fetch('/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }

    console.log('Device token registered successfully');
  } catch (error) {
    console.error('Failed to register device token:', error);
  }
}

/**
 * Handle notification tap - navigate to appropriate screen
 */
function handleNotificationTap(data: NotificationData): void {
  if (!data) return;

  let targetUrl: string | null = null;

  if (data.url) {
    targetUrl = data.url;
  } else if (data.businessId) {
    targetUrl = `/businesses/${data.businessId}`;
  } else if (data.eventId) {
    targetUrl = `/events/${data.eventId}`;
  }

  if (targetUrl && typeof window !== 'undefined') {
    window.location.href = targetUrl;
  }
}

/**
 * Check if push notifications are supported
 */
export async function isPushSupported(): Promise<boolean> {
  const native = await isNativePlatform();

  if (native) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      return !!PushNotifications;
    } catch {
      return false;
    }
  }

  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;
}

/**
 * Check current permission status
 */
export async function getPushPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  const native = await isNativePlatform();

  if (native) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const status = await PushNotifications.checkPermissions();
      return status.receive as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'unsupported';
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission as 'granted' | 'denied' | 'prompt';
}

/**
 * Unregister from push notifications
 */
export async function unregisterPushNotifications(): Promise<void> {
  const native = await isNativePlatform();

  if (native) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.removeAllListeners();
    } catch (error) {
      console.error('Failed to unregister native push:', error);
    }
  }

  // Also notify backend to disable notifications
  try {
    await fetch('/api/push/unregister', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to unregister from backend:', error);
  }
}

/**
 * Convert VAPID key to Uint8Array for web push
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
