import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token, platform } = body;

    if (!token || !platform) {
      return NextResponse.json(
        { error: 'Token and platform are required' },
        { status: 400 }
      );
    }

    if (!['android', 'ios', 'web'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Upsert the device token
    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: user.id,
          token,
          platform,
          enabled: true,
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: 'token',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('Failed to register device token:', error);
      return NextResponse.json(
        { error: 'Failed to register device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
