# Files & Notifications Feature Deployment Guide

## ⚠️ CURRENT STATUS - DEBUGGING FILE UPLOAD ISSUE

**Problem:** File upload is failing with "row violates row level security policy" error

**What's been done:**
1. ✅ Created notifications tables (run `CREATE_NOTIFICATIONS_TABLE.sql`)
2. ✅ Created storage bucket named `files`
3. ✅ Fixed RLS policies (run `FIX_FILE_ATTACHMENTS_RLS.sql`)
4. ✅ Made `related_id` column nullable (run `FIX_FILE_ATTACHMENTS_SCHEMA.sql`)
5. ✅ Added detailed error logging to code

**Next Step - DEBUGGING:**

After the latest deployment completes:

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Open browser console** (F12 → Console tab)
3. **Navigate to Files page**
4. **Try to upload a file**
5. **Copy ALL console output** including:
   - "File uploaded to storage, creating database record..."
   - "User ID: ..."
   - "File details: ..."
   - "Attempting to insert: ..."
   - "❌ Database insert error:" (with all error details)
6. **Share the complete console output with Claude**

This will show the exact column/constraint causing the problem so it can be fixed.

---

## Prerequisites
Before deploying the code, you need to set up the database and storage.

---

## Step 1: Create Notifications Tables (5 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Open the file: `CREATE_NOTIFICATIONS_TABLE.sql`
3. Copy the ENTIRE contents
4. Paste into SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

**Expected Output:**
- Should see "Success" messages
- Verification queries should show:
  - `notifications` and `user_notifications` tables exist
  - RLS is enabled on both tables
  - Indexes are created

**If you see errors:** Share the error message

---

## Step 2: Create Storage Bucket (3 minutes)

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it exactly: `files`
4. Set it to **Public** (so users can download files)
5. Click "Create bucket"

**Set up storage policies:**

After creating the bucket, go to the bucket settings and add these policies:

### Policy 1: Allow authenticated users to read files
```sql
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files');
```

### Policy 2: Allow authenticated users to upload files
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');
```

### Policy 3: Allow authenticated users to delete files
```sql
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');
```

---

## Step 3: Deploy Code (5 minutes)

The code is ready to deploy. After the deployment:

1. **Hard refresh** the browser (Ctrl+Shift+R)
2. Log in as admin
3. You should see:
   - "Notifications" button in bottom navigation (with badge for unread notifications)
   - "Manage File Uploads" button working in Admin → Quick Actions

---

## Features Overview

### For Admins:

**Files Page:**
- Upload files (PDF, DOC, DOCX, TXT, JPG, PNG, GIF)
- After upload, prompted to notify all users
- Delete files
- Download files

**Admin Quick Actions:**
- "Manage File Uploads" → Opens Files page

### For All Users:

**Notifications Page:**
- See all notifications
- Unread notifications highlighted
- Mark individual notification as read
- Mark all as read button
- Badge on navigation showing unread count

**Files Page:**
- View all uploaded files
- Download files
- Cannot upload or delete (staff only)

---

## Testing Checklist

### As Admin:

1. ✅ Navigate to Files page (from Admin → Manage File Uploads)
2. ✅ Upload a test file (e.g., a PDF)
3. ✅ When prompted, click "Yes, Notify All"
4. ✅ Check that file appears in the list
5. ✅ Navigate to Notifications page
6. ✅ Should see notification badge with "1"
7. ✅ Click on notification to mark as read
8. ✅ Badge should disappear
9. ✅ Download the file
10. ✅ Delete the file

### As Staff User (create a test staff account):

1. ✅ Log in as staff
2. ✅ Navigate to Notifications page
3. ✅ Should see the notification from admin's file upload
4. ✅ Navigate to Files page
5. ✅ Should see the file
6. ✅ Download button should work
7. ✅ Upload button should NOT be visible
8. ✅ Delete button should NOT be visible

---

## Troubleshooting

### Problem: "Files" bucket not found error

**Solution:**
- Make sure the storage bucket is named exactly `files` (lowercase)
- Check that storage policies are created

### Problem: Can't upload files

**Solution:**
```sql
-- Check storage policies exist
SELECT *
FROM storage.policies
WHERE bucket_id = 'files';

-- Should see 3 policies (read, insert, delete)
```

### Problem: Notifications not appearing

**Solution:**
```sql
-- Check notifications tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('notifications', 'user_notifications');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('notifications', 'user_notifications');
```

### Problem: Badge not showing unread count

**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify user_notifications table has entries:

```sql
SELECT * FROM user_notifications
WHERE user_id = auth.uid();
```

---

## Database Schema

### notifications table:
- `id` - UUID primary key
- `title` - Text (notification title)
- `message` - Text (notification body)
- `file_id` - UUID (optional, links to file_attachments)
- `created_by` - UUID (admin who created it)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### user_notifications table:
- `id` - UUID primary key
- `notification_id` - UUID (links to notifications)
- `user_id` - UUID (links to users)
- `is_read` - Boolean (read status)
- `read_at` - Timestamp (when marked as read)
- `created_at` - Timestamp

---

## Success Criteria

You'll know it worked when:

1. ✅ Admin can upload files from Files page
2. ✅ Alert prompt appears after upload
3. ✅ All users receive notification when "Yes, Notify All" is clicked
4. ✅ Notification badge appears on bottom navigation
5. ✅ Clicking notification marks it as read and removes badge
6. ✅ Staff can view and download files but not upload/delete
7. ✅ Files persist in storage and database

---

**Total Setup Time:** ~15 minutes
**Risk Level:** Low (new feature, doesn't affect existing functionality)
**Impact:** High (enables file sharing and notification system)

Ready to deploy! 🚀
