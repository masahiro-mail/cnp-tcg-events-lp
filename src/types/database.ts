export interface Event {
  id: string;
  name: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  area: string;
  prefecture: string;
  venue_name: string;
  address: string;
  description: string;
  announcement_url?: string;
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
  end_time?: string;
  area: string;
  prefecture: string;
  venue_name: string;
  address: string;
  description: string;
  announcement_url?: string;
}

export interface CreateParticipantData {
  event_id: string;
  user_x_id: string;
  user_x_name: string;
  user_x_icon_url: string;
}