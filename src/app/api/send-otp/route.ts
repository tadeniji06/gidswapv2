import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await supabase.from('email_otps').insert({ email, code: otp });

    // Send Email
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SEND_OTP_ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
