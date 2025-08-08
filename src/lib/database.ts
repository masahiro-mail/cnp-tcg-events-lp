import { Pool } from 'pg';
import { Event, Participant, CreateEventData, CreateParticipantData } from '@/types/database';

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Railway環境での接続設定
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}) : null;

// メモリ内モックデータストア
let mockEvents: Event[] = [
  {
    id: 'demo-1',
    name: 'CNPトレカ交流会 東京',
    event_date: '2025-01-15',
    start_time: '14:00',
    area: '関東',
    prefecture: '東京都',
    venue_name: 'サンプル会場',
    address: '東京都渋谷区',
    description: 'サンプルイベントです',
    created_at: new Date().toISOString()
  }
];

let mockParticipants: Participant[] = [];

export const initDatabase = async () => {
  if (!pool) {
    console.warn('Database not configured, skipping initialization');
    return;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Enable UUID extension
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      // Create Events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          event_date DATE NOT NULL,
          start_time TIME NOT NULL,
          area TEXT NOT NULL,
          prefecture TEXT NOT NULL,
          venue_name TEXT NOT NULL,
          address TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      
      // Create Participants table
      await client.query(`
        CREATE TABLE IF NOT EXISTS participants (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_x_id TEXT NOT NULL,
          user_x_name TEXT NOT NULL,
          user_x_icon_url TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(event_id, user_x_id)
        )
      `);
      
      console.log('Database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const getEvents = async (): Promise<Event[]> => {
  if (!pool) {
    console.warn('Database not configured, returning mock data');
    return [...mockEvents].sort((a, b) => {
      const dateA = new Date(`${a.event_date} ${a.start_time}`);
      const dateB = new Date(`${b.event_date} ${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events ORDER BY event_date ASC, start_time ASC');
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return [...mockEvents].sort((a, b) => {
      const dateA = new Date(`${a.event_date} ${a.start_time}`);
      const dateB = new Date(`${b.event_date} ${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  if (!pool) {
    console.warn('Database not configured, searching mock data');
    return mockEvents.find(event => event.id === id) || null;
  }
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return mockEvents.find(event => event.id === id) || null;
  }
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
  if (!pool) {
    console.warn('Database not configured, creating mock event');
    const newEvent: Event = {
      id: 'mock-' + Date.now(),
      name: data.name,
      event_date: data.event_date,
      start_time: data.start_time,
      area: data.area,
      prefecture: data.prefecture,
      venue_name: data.venue_name,
      address: data.address,
      description: data.description,
      created_at: new Date().toISOString()
    };
    mockEvents.push(newEvent);
    console.log('Mock event added. Total mock events:', mockEvents.length);
    return newEvent;
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO events (name, event_date, start_time, area, prefecture, venue_name, address, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [data.name, data.event_date, data.start_time, data.area, data.prefecture, data.venue_name, data.address, data.description]);
      return result.rows[0];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    // エラー時もモックデータを返して例外をスローしない
    const newEvent: Event = {
      id: 'mock-error-' + Date.now(),
      name: data.name,
      event_date: data.event_date,
      start_time: data.start_time,
      area: data.area,
      prefecture: data.prefecture,
      venue_name: data.venue_name,
      address: data.address,
      description: data.description,
      created_at: new Date().toISOString()
    };
    mockEvents.push(newEvent);
    console.log('Mock event added after error. Total mock events:', mockEvents.length);
    return newEvent;
  }
};

export const updateEvent = async (id: string, data: CreateEventData): Promise<Event | null> => {
  if (!pool) {
    console.warn('Database not configured, updating mock data');
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      mockEvents[eventIndex] = {
        ...mockEvents[eventIndex],
        ...data
      };
      return mockEvents[eventIndex];
    }
    return null;
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE events 
        SET name = $2, event_date = $3, start_time = $4, area = $5, prefecture = $6, venue_name = $7, address = $8, description = $9
        WHERE id = $1
        RETURNING *
      `, [id, data.name, data.event_date, data.start_time, data.area, data.prefecture, data.venue_name, data.address, data.description]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      mockEvents[eventIndex] = {
        ...mockEvents[eventIndex],
        ...data
      };
      return mockEvents[eventIndex];
    }
    return null;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  if (!pool) {
    console.warn('Database not configured, deleting from mock data');
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      mockEvents.splice(eventIndex, 1);
      console.log('Mock event deleted. Remaining events:', mockEvents.length);
      return true;
    }
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM events WHERE id = $1', [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      mockEvents.splice(eventIndex, 1);
      console.log('Mock event deleted after error. Remaining events:', mockEvents.length);
      return true;
    }
    return false;
  }
};

export const getParticipantsByEventId = async (eventId: string): Promise<Participant[]> => {
  if (!pool) {
    console.warn('Database not configured, returning mock participants');
    return mockParticipants.filter(p => p.event_id === eventId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM participants WHERE event_id = $1 ORDER BY created_at ASC', [eventId]);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return mockParticipants.filter(p => p.event_id === eventId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
};

export const getParticipantsByUserId = async (userId: string): Promise<Participant[]> => {
  if (!pool) {
    console.warn('Database not configured, returning mock participants');
    return mockParticipants.filter(p => p.user_x_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM participants WHERE user_x_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return mockParticipants.filter(p => p.user_x_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
};

export const createParticipant = async (data: CreateParticipantData): Promise<Participant | null> => {
  if (!pool) {
    console.warn('Database not configured, creating mock participant');
    // 重複チェック
    const existingParticipant = mockParticipants.find(
      p => p.event_id === data.event_id && p.user_x_id === data.user_x_id
    );
    if (existingParticipant) {
      console.log('Participant already exists in mock data');
      return null;
    }
    
    const newParticipant: Participant = {
      id: 'mock-participant-' + Date.now(),
      event_id: data.event_id,
      user_x_id: data.user_x_id,
      user_x_name: data.user_x_name,
      user_x_icon_url: data.user_x_icon_url,
      created_at: new Date().toISOString()
    };
    
    mockParticipants.push(newParticipant);
    console.log('Mock participant added. Total participants:', mockParticipants.length);
    return newParticipant;
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO participants (event_id, user_x_id, user_x_name, user_x_icon_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [data.event_id, data.user_x_id, data.user_x_name, data.user_x_icon_url]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        return null;
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    // エラー時もモックデータで処理
    const existingParticipant = mockParticipants.find(
      p => p.event_id === data.event_id && p.user_x_id === data.user_x_id
    );
    if (existingParticipant) {
      return null;
    }
    
    const newParticipant: Participant = {
      id: 'mock-participant-error-' + Date.now(),
      event_id: data.event_id,
      user_x_id: data.user_x_id,
      user_x_name: data.user_x_name,
      user_x_icon_url: data.user_x_icon_url,
      created_at: new Date().toISOString()
    };
    
    mockParticipants.push(newParticipant);
    console.log('Mock participant added after error. Total participants:', mockParticipants.length);
    return newParticipant;
  }
};

export const getEventsByArea = async (area: string): Promise<Event[]> => {
  if (!pool) {
    console.warn('Database not configured');
    return [];
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE area = $1 ORDER BY event_date ASC, start_time ASC', [area]);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
};

export const getEventsByDate = async (date: string): Promise<Event[]> => {
  if (!pool) {
    console.warn('Database not configured');
    return [];
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE event_date = $1 ORDER BY start_time ASC', [date]);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
};

export default pool;