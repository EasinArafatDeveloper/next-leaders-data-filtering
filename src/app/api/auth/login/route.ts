import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import UserModel from '@/lib/models/User';
import {
  createSessionToken,
  ensureDefaultAdmin,
  hashPassword,
  logAuthActivity,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Please provide both username and password' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ensureDefaultAdmin();

    const normalizedUsername = username.trim().toLowerCase();

    // Look for user by username or email
    const user = await UserModel.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedUsername }],
    });

    if (!user) {
      await logAuthActivity(
        'Failed Login',
        `Failed login attempt for non-existent username: "${username}"`,
        username
      );
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check account lockout from brute-force protection
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to multiple failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = attempts;

      let lockMessage = 'Invalid username or password';
      if (attempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        user.failedLoginAttempts = 0;
        lockMessage = 'Too many failed login attempts. Account locked for 15 minutes.';
      } else {
        const remainingAttempts = 5 - attempts;
        lockMessage = `Invalid username or password. (${remainingAttempts} attempt(s) remaining before lockout)`;
      }

      await user.save();
      await logAuthActivity(
        'Failed Login',
        `Failed password attempt for user: ${user.username}. Attempts: ${attempts}`,
        user.username
      );

      return NextResponse.json({ error: lockMessage }, { status: 401 });
    }

    // Login successful - Reset locks & update last login
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

    const token = await createSessionToken(sessionPayload);

    await logAuthActivity(
      'User Login',
      `User ${user.name} (@${user.username}) successfully authenticated into dashboard`,
      user.name
    );

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Login successful',
    });

    // Set secure HttpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
