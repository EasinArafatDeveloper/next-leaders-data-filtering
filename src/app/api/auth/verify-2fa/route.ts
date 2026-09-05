import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import UserModel from '@/lib/models/User';
import {
  createSessionToken,
  logAuthActivity,
  SESSION_COOKIE_NAME,
  verify2FAPendingToken,
} from '@/lib/auth';
import { verifyTotpCode, verifyBackupCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { twoFactorPendingToken, code, isBackupCode } = body;

    if (!twoFactorPendingToken) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again with your credentials.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Please enter your verification code.' },
        { status: 400 }
      );
    }

    // Verify the temporary 5-minute pending token
    const pendingSession = await verify2FAPendingToken(twoFactorPendingToken);
    if (!pendingSession) {
      return NextResponse.json(
        { error: '2FA verification window expired. Please sign in again.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(pendingSession.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Brute-force lockout check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`,
        },
        { status: 423 }
      );
    }

    let isValid = false;
    let usedBackup = false;

    if (isBackupCode) {
      // Verify single-use emergency backup code
      const backupResult = verifyBackupCode(code.trim(), user.twoFactorBackupCodes || []);
      if (backupResult.isValid) {
        isValid = true;
        usedBackup = true;
        user.twoFactorBackupCodes = backupResult.updatedHashedCodes;
      }
    } else {
      // Standard 6-digit Google Authenticator code
      if (user.twoFactorSecret) {
        isValid = verifyTotpCode(user.twoFactorSecret, code.trim(), 1);
      }
    }

    if (!isValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = attempts;

      let lockMessage = isBackupCode
        ? 'Invalid or previously used emergency backup code.'
        : 'Invalid 6-digit code. Check your Google Authenticator app and try again.';

      if (attempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginAttempts = 0;
        lockMessage = 'Too many failed 2FA attempts. Account locked for 15 minutes.';
      }

      await user.save();
      await logAuthActivity(
        'Failed 2FA Challenge',
        `Failed 2FA code verification for user: ${user.username}. Attempts: ${attempts}`,
        user.username
      );

      return NextResponse.json({ error: lockMessage }, { status: 401 });
    }

    // 2FA Verification Success!
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const sessionPayload = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const sessionToken = await createSessionToken(sessionPayload);

    await logAuthActivity(
      '2FA Login Success',
      `User ${user.name} (@${user.username}) completed ${
        usedBackup ? 'Backup Code' : 'Google Authenticator 2FA'
      } authentication`,
      user.name
    );

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Two-factor authentication verified successfully!',
    });

    // Set secure HttpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Verify 2FA error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during 2FA verification.' },
      { status: 500 }
    );
  }
}
