import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import UserModel from '@/lib/models/User';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: !!user.twoFactorEnabled,
      createdAt: user.twoFactorCreatedAt || null,
      backupCodesCount: (user.twoFactorBackupCodes || []).length,
    });
  } catch (error: any) {
    console.error('2FA status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch 2FA status' },
      { status: 500 }
    );
  }
}
