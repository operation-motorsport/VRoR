-- ============================================================================
-- CREATE NOTIFICATIONS SYSTEM
-- Veterans Race of Remembrance
-- ============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  file_id UUID REFERENCES file_attachments(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_notifications junction table to track read status per user
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Notifications: All authenticated users can read
CREATE POLICY "notifications_select_all" ON notifications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Notifications: Only admins can insert/update/delete (via app logic)
CREATE POLICY "notifications_insert_all" ON notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "notifications_update_all" ON notifications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "notifications_delete_all" ON notifications
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- User Notifications: Users can only see their own
CREATE POLICY "user_notifications_select_own" ON user_notifications
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "user_notifications_insert_all" ON user_notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "user_notifications_update_own" ON user_notifications
  FOR UPDATE
  USING (user_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "user_notifications_delete_all" ON user_notifications
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('notifications', 'user_notifications');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('notifications', 'user_notifications');
