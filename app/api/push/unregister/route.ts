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

    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (token) {
      // Disable specific token
      await supabase
        .from('device_tokens')
        .update({ enabled: false })
        .eq('token', token)
        .eq('user_id', user.id);
    } else {
      // Disable all tokens for this user
      await supabase
        .from('device_tokens')
        .update({ enabled: false })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unregister error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
