import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import UserModel from '@/lib/models/User';
import { getSessionUser, logAuthActivity } from '@/lib/auth';
import crypto from 'crypto';

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

    let devices = user.twoFactorDevices || [];

    // If 2FA is enabled but devices list is empty, initialize default friendly team phone labels
    if (user.twoFactorEnabled && devices.length === 0) {
      devices = [
        {
          id: 'dev_primary',
          name: `${user.name.split(' ')[0]}'s Phone (Primary Admin)`,
          deviceType: 'phone',
          addedAt: user.twoFactorCreatedAt || new Date(),
          status: 'active',
        },
        {
          id: 'dev_boss',
          name: "Boss's Phone (Executive Access)",
          deviceType: 'iphone',
          addedAt: new Date(),
          status: 'active',
        },
      ];
      user.twoFactorDevices = devices;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      devices,
    });
  } catch (error: any) {
    console.error('Fetch 2FA devices error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, deviceType } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Device name is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newDevice = {
      id: `dev_${crypto.randomBytes(4).toString('hex')}`,
      name: name.trim(),
      deviceType: deviceType || 'phone',
      addedAt: new Date(),
      status: 'active' as const,
    };

    user.twoFactorDevices = [...(user.twoFactorDevices || []), newDevice];
    await user.save();

    await logAuthActivity(
      '2FA Device Added',
      `User ${user.name} registered phone/device label "${newDevice.name}"`,
      user.name
    );

    return NextResponse.json({
      success: true,
      devices: user.twoFactorDevices,
      device: newDevice,
      message: 'New phone device connected and labeled successfully!',
    });
  } catch (error: any) {
    console.error('Add 2FA device error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add device' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, deviceType } = body;

    if (!id || !name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Device ID and new name are required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const devices = user.twoFactorDevices || [];
    const targetIdx = devices.findIndex((d) => d.id === id);

    if (targetIdx === -1) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    devices[targetIdx].name = name.trim();
    if (deviceType) devices[targetIdx].deviceType = deviceType;
    user.twoFactorDevices = devices;
    await user.save();

    return NextResponse.json({
      success: true,
      devices: user.twoFactorDevices,
      message: 'Device name updated successfully!',
    });
  } catch (error: any) {
    console.error('Update 2FA device error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update device' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const filtered = (user.twoFactorDevices || []).filter((d) => d.id !== id);
    user.twoFactorDevices = filtered;
    await user.save();

    await logAuthActivity(
      '2FA Device Removed',
      `User ${user.name} removed phone label (ID: ${id})`,
      user.name
    );

    return NextResponse.json({
      success: true,
      devices: user.twoFactorDevices,
      message: 'Device removed successfully.',
    });
  } catch (error: any) {
    console.error('Delete 2FA device error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete device' },
      { status: 500 }
    );
  }
}
