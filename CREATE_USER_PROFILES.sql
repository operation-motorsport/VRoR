-- ============================================================================
-- CREATE USER PROFILES - Veterans Race of Remembrance
-- ============================================================================
-- This script creates user profiles in the database for existing auth users
-- Run this AFTER the PRODUCTION_RLS_FIX.sql script
-- ============================================================================

-- Step 1: Create profiles for existing admin users
-- ============================================================================

INSERT INTO users (id, email, role, created_at, updated_at)
SELECT
    id,
    email,
    'admin'::text,
    created_at,
    NOW()
FROM auth.users
WHERE email IN (
    'nate.dowd@operationmotorsport.org',
    'tiffany.lodder@operationmotorsport.org',
    'jason.leach@operationmotorsport.org',
    'admin@operationmotorsport.org'
)
ON CONFLICT (id) DO UPDATE
SET
    role = 'admin',
    updated_at = NOW();

-- Step 2: Create profiles for any other existing auth users as staff
-- ============================================================================

INSERT INTO users (id, email, role, created_at, updated_at)
SELECT
    id,
    email,
    'staff'::text,
    created_at,
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify user profiles were created
-- ============================================================================

SELECT
    u.id,
    u.email,
    u.role,
    u.created_at,
    CASE
        WHEN au.id IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as has_auth_account
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.role DESC, u.email;

-- Step 4: Create a function to automatically create profiles for new signups
-- ============================================================================
-- This ensures that when admins create new users, profiles are auto-created

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user email is in admin list
    IF NEW.email IN (
        'nate.dowd@operationmotorsport.org',
        'tiffany.lodder@operationmotorsport.org',
        'jason.leach@operationmotorsport.org',
        'admin@operationmotorsport.org'
    ) THEN
        INSERT INTO public.users (id, email, role, created_at, updated_at)
        VALUES (NEW.id, NEW.email, 'admin', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin', updated_at = NOW();
    ELSE
        -- Default to staff role
        INSERT INTO public.users (id, email, role, created_at, updated_at)
        VALUES (NEW.id, NEW.email, 'staff', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICATION - Run these queries to confirm everything worked
-- ============================================================================

-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- Show all admin users
SELECT id, email, role, created_at
FROM users
WHERE role = 'admin'
ORDER BY email;

-- Show all staff users
SELECT id, email, role, created_at
FROM users
WHERE role = 'staff'
ORDER BY email;

-- Check for auth users without profiles (should be empty)
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- All existing users now have profiles
-- New users will automatically get profiles when created
-- Ready for production use!
-- ============================================================================
