import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import UserModel from '@/lib/models/User';
import { getSessionUser, logAuthActivity } from '@/lib/auth';
import { verifyTotpCode, generateBackupCodes } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string' || code.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit verification code from Google Authenticator.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tempSecret = user.twoFactorTempSecret;
    if (!tempSecret) {
      return NextResponse.json(
        { error: 'No active 2FA setup session found. Please click "Setup 2FA" again.' },
        { status: 400 }
      );
    }

    // Verify 6-digit code with ±30s clock drift window
    const isValid = verifyTotpCode(tempSecret, code.trim(), 1);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 6-digit code. Ensure your phone time is accurate and try again.' },
        { status: 400 }
      );
    }

    // Generate 8 emergency backup recovery codes
    const { plainCodes, hashedCodes } = generateBackupCodes(8);

    // Promote temp secret to active 2FA secret
    user.twoFactorSecret = tempSecret;
    user.twoFactorTempSecret = null;
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    user.twoFactorCreatedAt = new Date();
    await user.save();

    await logAuthActivity(
      '2FA Enabled',
      `User ${user.name} (@${user.username}) successfully enabled Two-Factor Authentication (Google Authenticator)`,
      user.name
    );

    return NextResponse.json({
      success: true,
      message: 'Two-Factor Authentication is now enabled for your account!',
      backupCodes: plainCodes,
    });
  } catch (error: any) {
    console.error('2FA confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm 2FA setup.' },
      { status: 500 }
    );
  }
}
