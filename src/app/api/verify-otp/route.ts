import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    const { data } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const createdAt = new Date(data[0].created_at);
    const isValid = Date.now() - createdAt.getTime() < 5 * 60 * 1000;

    return NextResponse.json({ valid: isValid });
  } catch (err) {
    console.error('[VERIFY_OTP_ERROR]', err);
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
