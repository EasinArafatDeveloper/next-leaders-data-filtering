import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';
import ShareLinkModel from '@/lib/models/ShareLink';
import ActivityLogModel from '@/lib/models/ActivityLog';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import {
  generateCryptoToken,
  getRandomShareDomain,
  getShareDomains,
  formatDomainLabel,
} from '@/lib/config/domains';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract session from NextRequest cookies or Cookie header
    const sessionToken =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.headers.get('cookie')?.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))?.[1];

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to create a secure share link.' },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired session.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      filters,
      selectedIds,
      maxViews = 1,
      isOneTime = true,
      expiryHours = 24,
      passcode,
      targetDomain,
    } = body || {};

    let matchingRecords: any[] = [];

    // 1. If specific record IDs were selected, query them directly
    if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
      matchingRecords = await RecordModel.find({ _id: { $in: selectedIds } })
        .select('-avatarBase64')
        .limit(1000)
        .lean();
    } else {
      // 2. Build query from active filter criteria
      const query: any = {};
      const {
        search,
        datasetId,
        tag,
        gender,
        minAge,
        maxAge,
        avatarType,
        numberStartsWith,
        maxActiveDays,
        lastOnlineFrom,
        lastOnlineTo,
        nameWise,
        numberWise,
        tagWise,
        genderWise,
        ageWise,
        lastOnlineWise,
        avatarTypeWise,
      } = filters || {};

      if (search && search.trim()) {
        const rawSearch = search.trim();
        const cleanPhoneSearch = rawSearch.replace(/[\s\+\-\(\)]/g, '');
        const escaped = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escaped, 'i');

        const isTargeted =
          (nameWise && (numberWise || genderWise || ageWise || lastOnlineWise || avatarTypeWise || tagWise)) ||
          numberWise ||
          genderWise ||
          ageWise ||
          lastOnlineWise ||
          avatarTypeWise ||
          tagWise;

        if (isTargeted) {
          const targetedConditions: any[] = [];
          if (nameWise) {
            targetedConditions.push({ name: searchRegex });
            targetedConditions.push({ 'customFields.nickname': searchRegex });
          }
          if (numberWise) targetedConditions.push({ phone: new RegExp(cleanPhoneSearch || escaped, 'i') });
          if (genderWise) targetedConditions.push({ gender: searchRegex });
          if (ageWise) {
            const numVal = parseInt(rawSearch, 10);
            if (!isNaN(numVal)) targetedConditions.push({ age: numVal });
          }
          if (avatarTypeWise) targetedConditions.push({ avatarType: searchRegex });
          if (tagWise) {
            targetedConditions.push({ tags: searchRegex });
            targetedConditions.push({ category: searchRegex });
            targetedConditions.push({ 'customFields.Tag / Label': searchRegex });
          }
          if (targetedConditions.length > 0) query.$or = targetedConditions;
        } else {
          const orConditions: any[] = [
            { name: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
            { location: searchRegex },
            { area: searchRegex },
            { tags: searchRegex },
            { category: searchRegex },
            { 'customFields.nickname': searchRegex },
            { 'customFields.Tag / Label': searchRegex },
          ];
          if (cleanPhoneSearch && /\d/.test(cleanPhoneSearch)) {
            orConditions.push({ phone: new RegExp(cleanPhoneSearch, 'i') });
          }
          query.$or = orConditions;
        }
      }

      if (datasetId && datasetId !== 'All') query.datasetId = datasetId;
      if (tag && tag !== 'All') {
        const tagRegex = new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        query.$and = query.$and || [];
        query.$and.push({
          $or: [{ tags: tagRegex }, { category: tagRegex }, { 'customFields.Tag / Label': tagRegex }],
        });
      }
      if (gender && gender !== 'All') query.gender = gender;
      if (avatarType && avatarType !== 'All') query.avatarType = avatarType;

      if (minAge || maxAge) {
        query.age = {};
        if (minAge) query.age.$gte = parseInt(minAge, 10);
        if (maxAge) query.age.$lte = parseInt(maxAge, 10);
      }

      if (numberStartsWith && numberStartsWith.trim()) {
        const prefixClean = numberStartsWith.trim().replace(/[+]/g, '');
        query.phone = { $regex: `^(\\+)?${prefixClean}` };
      }

      if (maxActiveDays && !isNaN(parseInt(maxActiveDays, 10))) {
        query.activeDays = { $lte: parseInt(maxActiveDays, 10) };
      }

      if (lastOnlineFrom || lastOnlineTo) {
        query.lastActive = {};
        if (lastOnlineFrom) {
          const fromDate = new Date(lastOnlineFrom);
          fromDate.setHours(0, 0, 0, 0);
          query.lastActive.$gte = fromDate;
        }
        if (lastOnlineTo) {
          const toDate = new Date(lastOnlineTo);
          toDate.setHours(23, 59, 59, 999);
          query.lastActive.$lte = toDate;
        }
      }

      matchingRecords = await RecordModel.find(query)
        .select('-avatarBase64')
        .limit(1000)
        .lean();
    }

    if (matchingRecords.length === 0) {
      return NextResponse.json(
        { error: 'No records found matching the current filter to share.' },
        { status: 400 }
      );
    }

    // 3. Create sanitized snapshot
    const recordsSnapshot = matchingRecords.map((r: any) => ({
      name: r.name || 'Unnamed',
      phone: r.phone || '',
      email: r.email || '',
      age: r.age || 0,
      gender: r.gender || 'Other',
      location: r.location || '',
      area: r.area || '',
      avatarUrl: r.avatarUrl || '',
      avatarType: r.avatarType || 'With Avatar',
      status: r.status || 'Active',
      activeDays: r.activeDays || 0,
      tags: r.tags || [],
      category: r.category || '',
      customFields: r.customFields || {},
    }));

    // 4. Generate ultra-hard 256-bit cryptographic hex token (64 chars)
    const token = generateCryptoToken();

    // 5. Expiry calculation
    const calculatedExpiryHours = Math.max(1, Math.min(Number(expiryHours) || 24, 720)); // between 1 hr and 30 days
    const expiresAt = new Date(Date.now() + calculatedExpiryHours * 60 * 60 * 1000);

    // 6. Optional passcode hashing
    let passcodeHash = '';
    const hasPasscode = Boolean(passcode && String(passcode).trim());
    if (hasPasscode) {
      passcodeHash = crypto
        .createHash('sha256')
        .update(String(passcode).trim())
        .digest('hex');
    }

    const viewsAllowed = isOneTime ? 1 : Math.max(1, Number(maxViews) || 1);

    // 7. Domain selection (Multi-Domain Dynamic Cycling)
    const availableDomains = getShareDomains();
    let chosenDomain = '';

    if (targetDomain && targetDomain !== 'auto') {
      const matched = availableDomains.find(
        (d) =>
          d.toLowerCase() === targetDomain.toLowerCase() ||
          formatDomainLabel(d) === formatDomainLabel(targetDomain)
      );
      chosenDomain = matched || targetDomain;
    } else {
      chosenDomain = getRandomShareDomain();
    }

    // Fallback if no domain available
    if (!chosenDomain) {
      const origin =
        request.headers.get('origin') ||
        request.headers.get('host') ||
        'http://localhost:3000';
      chosenDomain = origin.startsWith('http') ? origin : `https://${origin}`;
    }

    chosenDomain = chosenDomain.replace(/\/+$/, '');
    const shareUrl = `${chosenDomain}/v/${token}`;
    const domainLabel = formatDomainLabel(chosenDomain);

    // 8. Save to MongoDB
    const shareLink = await ShareLinkModel.create({
      token,
      title: title?.trim() || `Filtered Leads Snapshot (${recordsSnapshot.length} records)`,
      filterSummary: `Shared ${recordsSnapshot.length} filtered records`,
      recordCount: recordsSnapshot.length,
      recordsSnapshot,
      maxViews: viewsAllowed,
      viewCount: 0,
      isBurned: false,
      expiresAt,
      passcodeHash,
      hasPasscode,
      domainUsed: domainLabel,
      createdBy: session.name || session.username || 'Administrator',
    });

    // 9. Log activity
    await ActivityLogModel.create({
      action: 'Created One-Time Secure Share Link',
      description: `Generated 256-bit crypto link for ${recordsSnapshot.length} records on ${domainLabel} (Single-Use: ${isOneTime})`,
      user: session.name || session.username || 'Administrator',
      type: 'system',
    });

    return NextResponse.json({
      success: true,
      token,
      shareUrl,
      domainUsed: domainLabel,
      recordCount: recordsSnapshot.length,
      expiresAt: shareLink.expiresAt,
      maxViews: viewsAllowed,
      isOneTime,
      hasPasscode,
    });
  } catch (error: any) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to generate secure share link', message: error.message },
      { status: 500 }
    );
  }
}
