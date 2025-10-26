# RLS Fix Deployment Guide
## Veterans Race of Remembrance - Production Ready

---

## 🎯 Objective
Fix the Row Level Security (RLS) circular dependency issue that causes authentication timeouts, and prepare the system for 40-50 users with proper role-based access control.

## 📋 Prerequisites
- Access to Supabase dashboard
- Admin credentials for the database
- ~30 minutes of time
- This should be done BEFORE launching to 40-50 users

---

## ⚠️ IMPORTANT: Execute in Order

### Step 1: Backup Current Database (5 minutes)

1. Go to Supabase Dashboard → Database → Backups
2. Click "Create Manual Backup"
3. Name it: `pre-rls-fix-backup-[TODAY'S DATE]`
4. Wait for confirmation

**Why:** Safety net in case something goes wrong

---

### Step 2: Apply RLS Policy Fixes (10 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Open the file: `PRODUCTION_RLS_FIX.sql`
3. Copy the ENTIRE contents
4. Paste into SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

**Expected Output:**
- Should see "Success" messages
- No errors should appear
- Verification queries at the end should show:
  - All tables have `rowsecurity = true`
  - Multiple policies listed for each table

**If you see errors:** STOP and share the error message

---

### Step 3: Create User Profiles (5 minutes)

1. Still in SQL Editor, create a new query
2. Open the file: `CREATE_USER_PROFILES.sql`
3. Copy the ENTIRE contents
4. Paste into SQL Editor
5. Click "Run"

**Expected Output:**
- Shows count of admin users (should be 4)
- Shows count of staff users (may be 0 if no other users exist)
- Verification queries show your user profiles

**Verify:**
Run this query to confirm your profile exists:
```sql
SELECT * FROM users WHERE email = 'nate.dowd@operationmotorsport.org';
```

Should return:
- `id`: Your user ID
- `email`: nate.dowd@operationmotorsport.org
- `role`: admin
- `created_at` and `updated_at` timestamps

---

### Step 4: Test Authentication Flow (5 minutes)

1. **Log out** of the application if logged in
2. **Clear browser cache** (Ctrl+Shift+Del → Clear all cache)
3. Go to production site: `https://vror.netlify.app`
4. Open browser console (F12)
5. **Log in** with your credentials

**What to look for in console:**
- ✅ `"🔍 Attempting to fetch user profile from database..."`
- ✅ `"✅ User profile found in database:"` (should show within 1-2 seconds, NOT timeout!)
- ✅ `"✅ User state set from database profile"`
- ✅ Should redirect to `/veterans` page immediately

**If you see:**
- ❌ `"Database query timeout"` → RLS policies didn't apply correctly
- ❌ `"❌ Database query failed"` → Share the error with me

---

### Step 5: Test Admin Functionality (5 minutes)

Once logged in:

1. **Navigate to Admin page** (bottom navigation)
2. Verify you can see:
   - User count, admin count, staff count
   - Beneficiaries count (should be correct now!)
   - Race teams count
   - Events count

3. **Test adding a beneficiary:**
   - Go to Beneficiaries page
   - Click "+ Add Beneficiary"
   - Fill out form
   - Submit

**Expected:** Should save without RLS errors

4. **Check the console** - should NOT see:
   - ❌ "row violates row-level security policy"
   - ❌ Any permission denied errors

---

### Step 6: Create Additional Admin Users (If Needed)

If you need to add Tiffany or Jason as admins NOW:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email (e.g., `tiffany.lodder@operationmotorsport.org`)
4. Enter password (share securely with them)
5. Click "Add User"

**The trigger will automatically:**
- Create their profile in the `users` table
- Assign them `admin` role (because their email is in the list)

**Verify:**
```sql
SELECT * FROM users WHERE email = 'tiffany.lodder@operationmotorsport.org';
```

Should show `role = 'admin'`

---

## 🚀 Ready for 40-50 Users

### Adding Staff Users

When you're ready to add the 40-50 users:

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User" for each person
3. Enter their email
4. Set password
5. They'll automatically get `staff` role

**Option B: Via Admin Panel (Recommended)**
- Already works in your app!
- Go to Admin Page
- Click "+" button
- Create user with email, password, and role
- More user-friendly for non-technical admins

**Option C: Invite Links (Best for Many Users)**
1. Enable email confirmations in Supabase
2. Users sign up themselves
3. You upgrade their role to admin if needed

---

## 🧪 Test Scenarios

Before launch, test these scenarios:

### ✅ Scenario 1: Admin User
- Can view all pages
- Can add/edit/delete beneficiaries
- Can view admin dashboard
- Can create new users

### ✅ Scenario 2: Staff User
- Can view all pages
- Can view beneficiaries (but not edit)
- **Cannot** access admin functions
- **Cannot** add/delete data

### ✅ Scenario 3: Session Persistence
- Log in
- Refresh page (should stay logged in)
- Close browser
- Reopen and go to site (should remember login)

### ✅ Scenario 4: Multiple Concurrent Users
- Have someone else log in while you're logged in
- Both should work independently
- No session conflicts

---

## 🐛 Troubleshooting

### Problem: "Database query timeout" still appears

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Should show rowsecurity = true for all tables
-- If false, run: ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### Problem: "Row violates row-level security policy"

**Solution:**
```sql
-- Check your user's role
SELECT role FROM users WHERE id = auth.uid();

-- Should return 'admin' for you
-- If it returns nothing, you don't have a profile - run CREATE_USER_PROFILES.sql again
```

### Problem: Can't see admin dashboard

**Solution:**
```sql
-- Verify you're marked as admin
SELECT * FROM users WHERE email = 'nate.dowd@operationmotorsport.org';

-- If role is not 'admin', fix it:
UPDATE users SET role = 'admin' WHERE email = 'nate.dowd@operationmotorsport.org';
```

### Problem: New users can't log in

**Solution:**
- Check that the trigger is active:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

- Manually create their profile:
```sql
INSERT INTO users (id, email, role)
SELECT id, email, 'staff'
FROM auth.users
WHERE email = 'their-email@example.com';
```

---

## 📊 Post-Deployment Verification Queries

Run these to ensure everything is working:

```sql
-- 1. Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- 2. Check for auth users without profiles (should be empty!)
SELECT au.email
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 3. List all admin users
SELECT email, created_at FROM users WHERE role = 'admin' ORDER BY created_at;

-- 4. Test your own access
SELECT
    auth.uid() as my_id,
    (SELECT email FROM users WHERE id = auth.uid()) as my_email,
    (SELECT role FROM users WHERE id = auth.uid()) as my_role;
```

---

## ✅ Success Criteria

You'll know it worked when:

1. ✅ Login takes < 3 seconds (no timeouts)
2. ✅ Console shows "User profile found in database" (not "Database query timeout")
3. ✅ Admin dashboard shows correct counts
4. ✅ Can add beneficiaries without RLS errors
5. ✅ Can create new staff users
6. ✅ Staff users can log in and view data
7. ✅ Session persists across page refreshes

---

## 📞 Support

If you encounter any issues:

1. **Check the console logs** - Copy any errors
2. **Run the verification queries** above
3. **Share the output** with me

**DO NOT:**
- Disable RLS entirely (security risk)
- Delete policies manually (will break access)
- Modify the trigger function (auto-creation will break)

---

## 🎉 Next Steps After Successful Deployment

1. Update the code to use database roles (coming next)
2. Document user onboarding process
3. Train Tiffany/Jason on user management
4. Plan rollout to 40-50 users

---

**Estimated Total Time:** 30 minutes
**Risk Level:** Low (we have backup)
**Impact:** High (fixes all auth issues)

Ready to execute? Let's do this! 🚀
