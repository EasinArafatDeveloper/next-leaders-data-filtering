import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';
import DatasetModel from '@/lib/models/Dataset';
import ActivityLogModel from '@/lib/models/ActivityLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { filename, rows, fileSize } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data rows found in the uploaded file' },
        { status: 400 }
      );
    }

    let validRecords: any[] = [];
    let skippedCount = 0;

    rows.forEach((row, idx) => {
      const values = Object.values(row).filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
      if (values.length === 0) {
        skippedCount++;
        return;
      }

      const normalizedRow: any = {
        name: '',
        phone: '',
        email: '',
        age: 0,
        gender: 'Other',
        location: '',
        area: '',
        address: '',
        status: 'Active',
        activeDays: 0,
        avatarType: 'Without Avatar',
        avatarUrl: '',
        lastActive: new Date(),
        customFields: {},
      };

      Object.keys(row).forEach((key) => {
        const lowerKey = key.trim().toLowerCase().replace(/[\s_\.-]+/g, '');
        const val = row[key];

        if (
          lowerKey === 'name' ||
          lowerKey === 'fullname' ||
          lowerKey === 'username' ||
          lowerKey === 'nickname' ||
          lowerKey === 'nick' ||
          lowerKey === 'contactname' ||
          lowerKey === 'customername' ||
          lowerKey === 'person' ||
          lowerKey === 'title'
        ) {
          const nameStr = String(val || '').trim();
          if (nameStr && !normalizedRow.name) {
            normalizedRow.name = nameStr;
          }
        } else if (
          lowerKey === 'phone' ||
          lowerKey === 'mobile' ||
          lowerKey === 'number' ||
          lowerKey === 'contact' ||
          lowerKey === 'cell' ||
          lowerKey === 'phonenumber' ||
          lowerKey === 'tel' ||
          lowerKey === 'msisdn'
        ) {
          normalizedRow.phone = String(val || '').trim();
        } else if (
          lowerKey === 'email' ||
          lowerKey === 'mail' ||
          lowerKey === 'emailaddress'
        ) {
          normalizedRow.email = String(val || '').trim();
        } else if (
          lowerKey === 'age' ||
          lowerKey === 'years'
        ) {
          const numAge = parseInt(val, 10);
          if (!isNaN(numAge)) normalizedRow.age = numAge;
        } else if (
          lowerKey === 'gender' ||
          lowerKey === 'sex'
        ) {
          const gStr = String(val || '').trim().toLowerCase();
          if (gStr.startsWith('m')) normalizedRow.gender = 'Male';
          else if (gStr.startsWith('f')) normalizedRow.gender = 'Female';
          else normalizedRow.gender = 'Other';
        } else if (
          lowerKey === 'avatartype' ||
          lowerKey === 'avatar' ||
          lowerKey === 'avatarurl' ||
          lowerKey === 'photo' ||
          lowerKey === 'image' ||
          lowerKey === 'picture' ||
          lowerKey === 'userphoto'
        ) {
          const avatarVal = String(val || '').trim();
          if (avatarVal.startsWith('http://') || avatarVal.startsWith('https://')) {
            normalizedRow.avatarUrl = avatarVal;
            normalizedRow.avatarType = 'With Avatar';
          } else if (avatarVal) {
            normalizedRow.avatarType = avatarVal;
          }
        } else if (
          lowerKey === 'activedays' ||
          lowerKey === 'days' ||
          lowerKey === 'active' ||
          lowerKey === 'activeday'
        ) {
          const numDays = parseInt(val, 10);
          if (!isNaN(numDays)) normalizedRow.activeDays = numDays;
        } else if (
          lowerKey === 'lastonline' ||
          lowerKey === 'lastonlinetime' ||
          lowerKey === 'lastactive' ||
          lowerKey === 'online' ||
          lowerKey === 'date' ||
          lowerKey === 'timestamp'
        ) {
          const parsedDate = new Date(val);
          if (!isNaN(parsedDate.getTime())) normalizedRow.lastActive = parsedDate;
        } else if (
          lowerKey === 'location' ||
          lowerKey === 'district' ||
          lowerKey === 'city' ||
          lowerKey === 'division' ||
          lowerKey === 'state' ||
          lowerKey === 'country'
        ) {
          normalizedRow.location = String(val || '').trim();
        } else if (
          lowerKey === 'area' ||
          lowerKey === 'thana' ||
          lowerKey === 'zone'
        ) {
          normalizedRow.area = String(val || '').trim();
        } else if (
          lowerKey === 'address' ||
          lowerKey === 'fulladdress'
        ) {
          normalizedRow.address = String(val || '').trim();
        } else if (
          lowerKey === 'status' ||
          lowerKey === 'state'
        ) {
          const sVal = String(val || '').trim();
          normalizedRow.status = ['Active', 'Inactive', 'Pending', 'Suspended'].includes(sVal) ? sVal : 'Active';
        } else {
          normalizedRow.customFields[key] = val;
        }
      });

      // Name fallback
      if (!normalizedRow.name) {
        if (row.nickname || row.Nickname || row.NickName || row.nick) {
          normalizedRow.name = String(row.nickname || row.Nickname || row.NickName || row.nick).trim();
        } else if (normalizedRow.phone) {
          normalizedRow.name = `User (${normalizedRow.phone})`;
        } else if (values[0]) {
          normalizedRow.name = String(values[0]).trim();
        } else {
          normalizedRow.name = `Record #${idx + 1}`;
        }
      }

      // Check any other columns for image URLs
      if (!normalizedRow.avatarUrl) {
        Object.values(row).forEach((v) => {
          const str = String(v || '').trim();
          if (str.startsWith('http://') || str.startsWith('https://')) {
            normalizedRow.avatarUrl = str;
            normalizedRow.avatarType = 'With Avatar';
          }
        });
      }

      validRecords.push(normalizedRow);
    });

    if (validRecords.length === 0) {
      return NextResponse.json(
        { error: 'No valid data records found in uploaded file', skippedCount },
        { status: 400 }
      );
    }

    // --- SMART UPSERT & MERGE LOGIC ---
    // 1. Gather all phone numbers & emails to look up existing records in one fast batch
    const incomingPhones = validRecords.map((r) => r.phone).filter(Boolean);
    const incomingEmails = validRecords.map((r) => r.email).filter(Boolean);

    const lookupConditions: any[] = [];
    if (incomingPhones.length > 0) lookupConditions.push({ phone: { $in: incomingPhones } });
    if (incomingEmails.length > 0) lookupConditions.push({ email: { $in: incomingEmails } });

    let existingDocs: any[] = [];
    if (lookupConditions.length > 0) {
      existingDocs = await RecordModel.find({ $or: lookupConditions }).lean();
    }

    // Index existing docs by phone and by email for O(1) matching
    const phoneMap = new Map<string, any>();
    const emailMap = new Map<string, any>();

    existingDocs.forEach((doc) => {
      if (doc.phone) phoneMap.set(doc.phone, doc);
      if (doc.email) emailMap.set(doc.email, doc);
    });

    const newRecordsToInsert: any[] = [];
    const bulkUpdateOps: any[] = [];
    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    // Track processed IDs in this batch to prevent duplicate updates within the same file
    const matchedDocIds = new Set<string>();

    for (const incoming of validRecords) {
      // Find matching existing record: first by phone, then by email
      const matched = (incoming.phone ? phoneMap.get(incoming.phone) : null) ||
                      (incoming.email ? emailMap.get(incoming.email) : null);

      if (matched && !matchedDocIds.has(matched._id.toString())) {
        matchedDocIds.add(matched._id.toString());

        const updateFields: any = {};

        // Merge / Fill missing email
        if ((!matched.email || matched.email === '') && incoming.email) {
          updateFields.email = incoming.email;
        }

        // Merge / Improve Name if previous was empty or generic 'User (..)'
        if (incoming.name && (!matched.name || matched.name.startsWith('User (')) && !incoming.name.startsWith('User (')) {
          updateFields.name = incoming.name;
        }

        // Merge / Fill missing Phone
        if ((!matched.phone || matched.phone === '') && incoming.phone) {
          updateFields.phone = incoming.phone;
        }

        // Merge / Fill missing Age
        if ((!matched.age || matched.age === 0) && incoming.age > 0) {
          updateFields.age = incoming.age;
        }

        // Merge / Fill missing Gender
        if ((!matched.gender || matched.gender === 'Other') && incoming.gender && incoming.gender !== 'Other') {
          updateFields.gender = incoming.gender;
        }

        // Merge / Fill missing Avatar URL / Type
        if ((!matched.avatarUrl || matched.avatarUrl === '') && incoming.avatarUrl) {
          updateFields.avatarUrl = incoming.avatarUrl;
          updateFields.avatarType = 'With Avatar';
        }

        // Merge / Fill missing Location / Area / Address
        if ((!matched.location || matched.location === '') && incoming.location) {
          updateFields.location = incoming.location;
        }
        if ((!matched.area || matched.area === '') && incoming.area) {
          updateFields.area = incoming.area;
        }
        if ((!matched.address || matched.address === '') && incoming.address) {
          updateFields.address = incoming.address;
        }

        // Update Active Days if new has higher/newer count
        if (incoming.activeDays > 0 && (!matched.activeDays || incoming.activeDays > matched.activeDays)) {
          updateFields.activeDays = incoming.activeDays;
        }

        // Update Last Online if incoming has newer date
        if (incoming.lastActive) {
          const incomingDate = new Date(incoming.lastActive);
          const existingDate = matched.lastActive ? new Date(matched.lastActive) : new Date(0);
          if (incomingDate > existingDate) {
            updateFields.lastActive = incomingDate;
          }
        }

        // Merge Custom Fields without overwriting existing custom keys
        const mergedCustom = { ...(matched.customFields || {}), ...(incoming.customFields || {}) };
        if (Object.keys(incoming.customFields || {}).length > 0) {
          updateFields.customFields = mergedCustom;
        }

        if (Object.keys(updateFields).length > 0) {
          bulkUpdateOps.push({
            updateOne: {
              filter: { _id: matched._id },
              update: { $set: updateFields },
            },
          });
          updatedCount++;
        } else {
          unchangedCount++;
        }
      } else {
        // Brand new record
        newRecordsToInsert.push(incoming);
        newCount++;
      }
    }

    // Execute bulk insertions in chunks
    if (newRecordsToInsert.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < newRecordsToInsert.length; i += chunkSize) {
        const chunk = newRecordsToInsert.slice(i, i + chunkSize);
        await RecordModel.insertMany(chunk, { ordered: false });
      }
    }

    // Execute bulk updates
    if (bulkUpdateOps.length > 0) {
      await RecordModel.bulkWrite(bulkUpdateOps);
    }

    const totalRecordsInDb = await RecordModel.countDocuments({});
    const totalFieldsCount = Object.keys(rows[0] || {}).length || 18;

    // Update Dataset stats
    const dataset = await DatasetModel.create({
      filename: filename || 'merged-dataset.csv',
      totalRecords: totalRecordsInDb,
      totalFields: totalFieldsCount,
      fileSize: fileSize || `${(JSON.stringify(rows).length / 1024).toFixed(1)} KB`,
      status: 'Ready',
      uploadedAt: new Date(),
    });

    // Log Activity
    await ActivityLogModel.create({
      action: 'Smart Merge & Upload',
      description: `Added ${newCount.toLocaleString()} new records, updated ${updatedCount.toLocaleString()} existing records with missing data from ${filename || 'file'}${skippedCount > 0 ? ` (${skippedCount} empty rows skipped)` : ''}`,
      user: 'Easin Arafat',
      type: 'upload',
    });

    return NextResponse.json({
      success: true,
      newCount,
      updatedCount,
      unchangedCount,
      totalCount: totalRecordsInDb,
      skippedCount,
      dataset,
    });
  } catch (error: any) {
    console.error('Upload processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process dataset' },
      { status: 500 }
    );
  }
}
