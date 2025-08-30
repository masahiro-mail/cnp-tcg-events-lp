export interface Event {
  id: string;
  master_id?: string; // Optional for backward compatibility
  name: string;
  event_date: string;
  start_time: string;
  end_time: string; // Required field
  organizer: string;
  area: string;
  prefecture: string;
  venue_name: string;
  address: string;
  url?: string;
  description: string;
  announcement_url?: string; // Optional field
  created_by: string; // X user ID of the event creator
  created_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  user_x_id: string;
  user_x_name: string;
  user_x_icon_url: string;
  created_at: string;
}

export interface CreateEventData {
  name: string;
  event_date: string;
  start_time: string;
  end_time: string; // Required field
  organizer: string;
  area: string;
  prefecture: string;
  venue_name: string;
  address: string;
  url?: string;
  description: string;
  announcement_url?: string; // Optional field
  created_by: string; // X user ID of the event creator
}

export interface CreateParticipantData {
  event_id: string;
  user_x_id: string;
  user_x_name: string;
  user_x_icon_url: string;
}

export interface User {
  x_id: string;
  x_name: string;
  x_username: string;
  x_icon_url: string;
  first_login_at: string;
  last_login_at: string;
  is_active: boolean;
  updated_at: string;
}

export interface EventMaster {
  id: string;
  name: string;
  event_date: string;
  start_time: string;
  end_time: string; // Required field
  organizer: string;
  area: string;
  prefecture: string;
  venue_name: string;
  address: string;
  url?: string;
  description: string;
  announcement_url?: string; // Optional field
  created_by: string; // X user ID of the event creator
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participation {
  id: string;
  event_master_id: string;
  user_x_id: string;
  is_cancelled: boolean;
  created_at: string;
}

export interface CreateUserData {
  x_id: string;
  x_name: string;
  x_username: string;
  x_icon_url: string;
}

export interface DatabasePool {
  query: (sql: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number }>;
}