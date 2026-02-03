import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

// Firebase Admin SDK types - will be initialized dynamically
type Message = {
  token: string;
  notification?: {
    title: string;
    body?: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
  android?: {
    priority: 'high' | 'normal';
    notification?: {
      channelId: string;
      icon?: string;
      color?: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        sound: string;
        badge?: number;
      };
    };
  };
};

/**
 * Send push notification to specific users
 * Admin-only endpoint
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const adminStatus = await isAdmin(user.email || '');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds, notification, data } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    if (!notification?.title) {
      return NextResponse.json(
        { error: 'notification.title is required' },
        { status: 400 }
      );
    }

    // Get device tokens for the specified users
    const { data: tokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('id, token, platform, user_id')
      .in('user_id', userIds)
      .eq('enabled', true);

    if (tokensError) {
      console.error('Failed to fetch device tokens:', tokensError);
      return NextResponse.json(
        { error: 'Failed to fetch device tokens' },
        { status: 500 }
      );
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No active device tokens found',
      });
    }

    // Send notifications using Firebase Admin SDK
    const results = await sendFirebaseNotifications(tokens, notification, data);

    // Log notifications
    const logEntries = tokens.map((token, index) => ({
      user_id: token.user_id,
      device_token_id: token.id,
      notification_type: data?.type || 'general',
      title: notification.title,
      body: notification.body,
      data,
      status: results[index].success ? 'sent' : 'failed',
      error_message: results[index].error || null,
    }));

    await supabase.from('notification_log').insert(logEntries);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: tokens.length,
    });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendFirebaseNotifications(
  tokens: Array<{ id: string; token: string; platform: string; user_id: string }>,
  notification: { title: string; body?: string; image?: string },
  data?: Record<string, string>
): Promise<Array<{ success: boolean; error?: string }>> {
  // Check if Firebase is configured
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase not configured, skipping push notifications');
    return tokens.map(() => ({
      success: false,
      error: 'Firebase not configured',
    }));
  }

  try {
    // Dynamic import to avoid issues when Firebase isn't installed
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');

    // Initialize Firebase Admin SDK if not already done
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }

    const messaging = getMessaging();

    // Send to each token individually to handle errors per-device
    const results = await Promise.all(
      tokens.map(async (tokenData) => {
        try {
          const message: Message = {
            token: tokenData.token,
            notification: {
              title: notification.title,
              body: notification.body,
              imageUrl: notification.image,
            },
            data: data ? Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, String(v)])
            ) : undefined,
          };

          // Platform-specific configuration
          if (tokenData.platform === 'android') {
            message.android = {
              priority: 'high',
              notification: {
                channelId: 'default',
                icon: 'ic_notification',
                color: '#0d5c4b',
              },
            };
          } else if (tokenData.platform === 'ios') {
            message.apns = {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            };
          }

          await messaging.send(message as Parameters<typeof messaging.send>[0]);
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to send to token ${tokenData.id}:`, errorMessage);
          return { success: false, error: errorMessage };
        }
      })
    );

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Firebase initialization failed';
    console.error('Firebase initialization error:', errorMessage);
    return tokens.map(() => ({
      success: false,
      error: errorMessage,
    }));
  }
}
