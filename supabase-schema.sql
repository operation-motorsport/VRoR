-- Operation Motorsport Database Schema
-- Copy and paste this entire file into your Supabase SQL Editor

-- Create custom user profiles table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update users
CREATE POLICY "Admins can update users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Veterans table
CREATE TABLE IF NOT EXISTS veterans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  military_branch TEXT NOT NULL,
  service_years TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on veterans
ALTER TABLE veterans ENABLE ROW LEVEL SECURITY;

-- Staff can view, admins can do everything
CREATE POLICY "Staff can view veterans" ON veterans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage veterans" ON veterans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Race teams table
CREATE TABLE IF NOT EXISTS race_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  vehicle_info TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on race_teams
ALTER TABLE race_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view race teams" ON race_teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage race teams" ON race_teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view events" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Veteran-Team pairings table
CREATE TABLE IF NOT EXISTS veteran_team_pairings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  veteran_id UUID REFERENCES veterans(id) ON DELETE CASCADE,
  race_team_id UUID REFERENCES race_teams(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(veteran_id, event_id)
);

-- Enable RLS on veteran_team_pairings
ALTER TABLE veteran_team_pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view pairings" ON veteran_team_pairings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage pairings" ON veteran_team_pairings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  veteran_id UUID REFERENCES veterans(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('practice', 'race', 'meeting', 'other')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Travel arrangements table
CREATE TABLE IF NOT EXISTS travel_arrangements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  veteran_id UUID REFERENCES veterans(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  departure_location TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_location TEXT,
  arrival_time TIMESTAMP WITH TIME ZONE,
  transportation_type TEXT CHECK (transportation_type IN ('flight', 'car', 'bus', 'other')),
  accommodation TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on travel_arrangements
ALTER TABLE travel_arrangements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view travel arrangements" ON travel_arrangements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage travel arrangements" ON travel_arrangements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_type TEXT NOT NULL CHECK (related_type IN ('veteran', 'race_team', 'event', 'general')),
  related_id UUID,
  author_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view notes" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage notes" ON notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- File attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  related_type TEXT NOT NULL CHECK (related_type IN ('veteran', 'race_team', 'event', 'note')),
  related_id UUID NOT NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on file_attachments
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view file attachments" ON file_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage file attachments" ON file_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_veterans_name ON veterans(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_race_teams_name ON race_teams(name);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_pairings_veteran ON veteran_team_pairings(veteran_id);
CREATE INDEX IF NOT EXISTS idx_pairings_event ON veteran_team_pairings(event_id);
CREATE INDEX IF NOT EXISTS idx_activities_veteran ON activities(veteran_id);
CREATE INDEX IF NOT EXISTS idx_activities_time ON activities(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_travel_veteran ON travel_arrangements(veteran_id);
CREATE INDEX IF NOT EXISTS idx_notes_related ON notes(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_files_related ON file_attachments(related_type, related_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_veterans_updated_at BEFORE UPDATE ON veterans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_race_teams_updated_at BEFORE UPDATE ON race_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_veteran_team_pairings_updated_at BEFORE UPDATE ON veteran_team_pairings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_arrangements_updated_at BEFORE UPDATE ON travel_arrangements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_attachments_updated_at BEFORE UPDATE ON file_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'staff');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data for testing
INSERT INTO events (name, date, location, description) VALUES
('Veterans Race of Remembrance 2024', '2024-11-11', 'Daytona International Speedway', 'Annual flagship event honoring our veterans'),
('Spring Training Event', '2024-04-15', 'Road Atlanta', 'Pre-season training and preparation event');

INSERT INTO race_teams (name, contact_name, contact_email, contact_phone, vehicle_info) VALUES
('Thunder Racing', 'Mike Johnson', 'mike@thunderracing.com', '555-0101', 'NASCAR Cup Series Car #42'),
('Speed Demons', 'Sarah Williams', 'sarah@speeddemons.com', '555-0102', 'IMSA GT3 Porsche'),
('Victory Lane Racing', 'Tom Davis', 'tom@victorylane.com', '555-0103', 'IndyCar Dallara DW12');

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE veterans;
ALTER PUBLICATION supabase_realtime ADD TABLE race_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE veteran_team_pairings;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE travel_arrangements;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE file_attachments;