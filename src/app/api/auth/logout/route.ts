import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, logAuthActivity, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (session) {
      await logAuthActivity(
        'User Logout',
        `User ${session.name} (@${session.username}) logged out of the dashboard`,
        session.name
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Delete session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
