export type UserRole = 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Veteran {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  military_branch: string;
  service_years: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  race_team_name?: string;
  created_at: string;
  updated_at: string;
}

export interface RaceTeam {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  vehicle_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface VeteranTeamPairing {
  id: string;
  veteran_id: string;
  race_team_id: string;
  event_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  veteran?: Veteran;
  race_team?: RaceTeam;
  event?: Event;
}

export interface Activity {
  id: string;
  veteran_id: string;
  event_id: string;
  activity_type: 'practice' | 'race' | 'meeting' | 'other';
  scheduled_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TravelArrangement {
  id: string;
  veteran_id: string;
  event_id: string;
  departure_location?: string;
  departure_time?: string;
  arrival_location?: string;
  arrival_time?: string;
  transportation_type?: 'flight' | 'car' | 'bus' | 'other';
  accommodation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  related_type: 'veteran' | 'race_team' | 'event' | 'general';
  related_id?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface FileAttachment {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  related_type?: 'veteran' | 'race_team' | 'event' | 'note' | 'general';
  related_id?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  file_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  notification?: Notification;
}