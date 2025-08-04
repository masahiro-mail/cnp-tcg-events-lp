import { Pool } from 'pg';
import { Event, Participant, CreateEventData, CreateParticipantData } from '@/types/database';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Railway環境での接続設定
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const initDatabase = async () => {
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
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getEvents = async (): Promise<Event[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM events ORDER BY event_date ASC, start_time ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
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
};

export const updateEvent = async (id: string, data: CreateEventData): Promise<Event | null> => {
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
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM events WHERE id = $1', [id]);
    return result.rowCount! > 0;
  } finally {
    client.release();
  }
};

export const getParticipantsByEventId = async (eventId: string): Promise<Participant[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM participants WHERE event_id = $1 ORDER BY created_at ASC', [eventId]);
    return result.rows;
  } finally {
    client.release();
  }
};

export const getParticipantsByUserId = async (userId: string): Promise<Participant[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM participants WHERE user_x_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  } finally {
    client.release();
  }
};

export const createParticipant = async (data: CreateParticipantData): Promise<Participant | null> => {
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
};

export const getEventsByArea = async (area: string): Promise<Event[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM events WHERE area = $1 ORDER BY event_date ASC, start_time ASC', [area]);
    return result.rows;
  } finally {
    client.release();
  }
};

export const getEventsByDate = async (date: string): Promise<Event[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM events WHERE event_date = $1 ORDER BY start_time ASC', [date]);
    return result.rows;
  } finally {
    client.release();
  }
};

export default pool;