import { Pool } from 'pg';
import { Event, Participant, CreateEventData, CreateParticipantData } from '@/types/database';

// ローカル開発用のモックデータベース
const isLocalDev = process.env.DATABASE_URL?.startsWith('file:');

// メモリ内データストア
let mockData = {
  users: [] as any[],
  events: [] as any[],
  participants: [] as any[],
  event_masters: [] as any[],
  participations: [] as any[]
};

// テストデータの初期化
if (isLocalDev && typeof window === 'undefined') {
  // サーバーサイドでテストデータを初期化
  setTimeout(() => {
    try {
      const { generateTestUsers, generateTestEventMasters, generateTestEvents } = require('./mock-data');
      
      mockData.users = generateTestUsers();
      mockData.event_masters = generateTestEventMasters();
      mockData.events = generateTestEvents();
      
      console.log('🎯 テストデータを読み込みました');
      console.log(`- ユーザー: ${mockData.users.length}人`);
      console.log(`- イベントマスター: ${mockData.event_masters.length}件`);
      console.log(`- 現在のイベント: ${mockData.events.length}件`);
    } catch (error) {
      console.log('テストデータの読み込みをスキップ:', error.message);
    }
  }, 100);
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

let pool: any;

if (isLocalDev) {
  // ローカル開発用のモックデータベース
  pool = {
    connect: () => Promise.resolve({
      query: (sql: string, params?: any[]) => {
        console.log('モックSQL:', sql, params);
        
        // CREATE TABLE statements - 無視
        if (sql.includes('CREATE TABLE') || sql.includes('CREATE EXTENSION')) {
          return Promise.resolve({ rows: [] });
        }
        
        // INSERT operations
        if (sql.includes('INSERT INTO users')) {
          const [x_id, x_name, x_username, x_icon_url] = params || [];
          const existing = mockData.users.find(u => u.x_id === x_id);
          if (existing) {
            existing.x_name = x_name;
            existing.x_username = x_username;
            existing.x_icon_url = x_icon_url;
            existing.last_login_at = new Date().toISOString();
            existing.updated_at = new Date().toISOString();
          } else {
            mockData.users.push({
              x_id, x_name, x_username, x_icon_url,
              first_login_at: new Date().toISOString(),
              last_login_at: new Date().toISOString(),
              is_active: true,
              updated_at: new Date().toISOString()
            });
          }
          return Promise.resolve({ rows: [] });
        }
        
        if (sql.includes('INSERT INTO events')) {
          const event = {
            id: generateId(),
            name: params?.[0],
            event_date: params?.[1],
            start_time: params?.[2],
            area: params?.[3],
            prefecture: params?.[4],
            venue_name: params?.[5],
            address: params?.[6],
            description: params?.[7],
            created_at: new Date().toISOString()
          };
          mockData.events.push(event);
          return Promise.resolve({ rows: [event] });
        }
        
        if (sql.includes('INSERT INTO event_masters')) {
          const event = {
            id: generateId(),
            name: params?.[0],
            event_date: params?.[1],
            start_time: params?.[2],
            area: params?.[3],
            prefecture: params?.[4],
            venue_name: params?.[5],
            address: params?.[6],
            description: params?.[7],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          mockData.event_masters.push(event);
          return Promise.resolve({ rows: [event] });
        }
        
        // SELECT operations
        if (sql.includes('SELECT * FROM users')) {
          return Promise.resolve({ rows: mockData.users });
        }
        
        if (sql.includes('SELECT * FROM events WHERE id = $1')) {
          const eventId = params?.[0];
          const event = mockData.events.find(e => e.id === eventId);
          return Promise.resolve({ rows: event ? [event] : [] });
        }
        
        if (sql.includes('SELECT * FROM events')) {
          return Promise.resolve({ rows: mockData.events });
        }
        
        if (sql.includes('SELECT * FROM participants WHERE event_id = $1')) {
          const eventId = params?.[0];
          const participants = mockData.participants.filter(p => p.event_id === eventId);
          return Promise.resolve({ rows: participants });
        }
        
        if (sql.includes('SELECT id FROM participants WHERE event_id = $1 AND user_x_id = $2')) {
          const [eventId, userId] = params || [];
          const participant = mockData.participants.find(p => p.event_id === eventId && p.user_x_id === userId);
          return Promise.resolve({ rows: participant ? [{ id: participant.id }] : [] });
        }
        
        if (sql.includes('INSERT INTO participants')) {
          const [eventId, userId, userName, userIcon] = params || [];
          const participant = {
            id: generateId(),
            event_id: eventId,
            user_x_id: userId,
            user_x_name: userName,
            user_x_icon_url: userIcon,
            created_at: new Date().toISOString()
          };
          mockData.participants.push(participant);
          return Promise.resolve({ rows: [participant] });
        }
        
        if (sql.includes('DELETE FROM participants WHERE event_id = $1 AND user_x_id = $2')) {
          const [eventId, userId] = params || [];
          const initialLength = mockData.participants.length;
          mockData.participants = mockData.participants.filter(p => !(p.event_id === eventId && p.user_x_id === userId));
          const rowCount = initialLength - mockData.participants.length;
          return Promise.resolve({ rowCount });
        }
        
        if (sql.includes('SELECT * FROM event_masters')) {
          return Promise.resolve({ rows: mockData.event_masters });
        }
        
        return Promise.resolve({ rows: [] });
      },
      release: () => Promise.resolve()
    })
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Create Users table (永続化されるユーザー情報)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        x_id TEXT PRIMARY KEY,
        x_name TEXT NOT NULL,
        x_username TEXT NOT NULL,
        x_icon_url TEXT NOT NULL,
        first_login_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Create Event Masters table (削除されないイベント情報)
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_masters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        event_date DATE NOT NULL,
        start_time TIME NOT NULL,
        area TEXT NOT NULL,
        prefecture TEXT NOT NULL,
        venue_name TEXT NOT NULL,
        address TEXT NOT NULL,
        description TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Create Events table (現在使用中のイベント)
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        master_id UUID REFERENCES event_masters(id),
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
    
    // Create Participations table (削除されない参加履歴)
    await client.query(`
      CREATE TABLE IF NOT EXISTS participations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_master_id UUID NOT NULL REFERENCES event_masters(id),
        user_x_id TEXT NOT NULL REFERENCES users(x_id),
        participated_at TIMESTAMPTZ DEFAULT NOW(),
        is_cancelled BOOLEAN DEFAULT FALSE,
        cancelled_at TIMESTAMPTZ NULL
      )
    `);
    
    // Create Participants table (backward compatibility)
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

// ユーザー管理関数
export const upsertUser = async (userData: {
  x_id: string;
  x_name: string;
  x_username: string;
  x_icon_url: string;
}): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO users (x_id, x_name, x_username, x_icon_url, first_login_at, last_login_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (x_id) 
      DO UPDATE SET 
        x_name = EXCLUDED.x_name,
        x_username = EXCLUDED.x_username,
        x_icon_url = EXCLUDED.x_icon_url,
        last_login_at = NOW(),
        updated_at = NOW()
    `, [userData.x_id, userData.x_name, userData.x_username, userData.x_icon_url]);
  } finally {
    client.release();
  }
};

// イベントマスター管理関数
export const createEventMaster = async (data: CreateEventData): Promise<{ id: string }> => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO event_masters (name, event_date, start_time, area, prefecture, venue_name, address, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [data.name, data.event_date, data.start_time, data.area, data.prefecture, data.venue_name, data.address, data.description]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

// 参加履歴の作成（永続化）
export const createParticipation = async (eventMasterId: string, userXId: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const existingResult = await client.query(
      'SELECT id FROM participations WHERE event_master_id = $1 AND user_x_id = $2 AND is_cancelled = FALSE',
      [eventMasterId, userXId]
    );
    
    if (existingResult.rows.length > 0) {
      return false; // 既に参加済み
    }
    
    await client.query(`
      INSERT INTO participations (event_master_id, user_x_id)
      VALUES ($1, $2)
    `, [eventMasterId, userXId]);
    
    return true;
  } finally {
    client.release();
  }
};

export const createParticipant = async (data: CreateParticipantData): Promise<Participant | null> => {
  const client = await pool.connect();
  try {
    // ユーザー情報を永続化
    await upsertUser({
      x_id: data.user_x_id,
      x_name: data.user_x_name,
      x_username: data.user_x_name, // usernameがない場合は名前を使用
      x_icon_url: data.user_x_icon_url
    });
    
    // 従来のparticipantsテーブルにも追加（後方互換性）
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

// イベント参加機能
export const joinEvent = async (eventId: string, userData: {
  user_x_id: string;
  user_x_name: string;
  user_x_icon_url: string;
}): Promise<boolean> => {
  const client = await pool.connect();
  try {
    // ユーザー情報を永続化
    await upsertUser({
      x_id: userData.user_x_id,
      x_name: userData.user_x_name,
      x_username: userData.user_x_name,
      x_icon_url: userData.user_x_icon_url
    });
    
    // 既存参加チェック
    const existingResult = await client.query(
      'SELECT id FROM participants WHERE event_id = $1 AND user_x_id = $2',
      [eventId, userData.user_x_id]
    );
    
    if (existingResult.rows.length > 0) {
      return false; // 既に参加済み
    }
    
    // 参加者を追加
    await client.query(`
      INSERT INTO participants (event_id, user_x_id, user_x_name, user_x_icon_url)
      VALUES ($1, $2, $3, $4)
    `, [eventId, userData.user_x_id, userData.user_x_name, userData.user_x_icon_url]);
    
    return true;
  } catch (error: any) {
    console.error('Error joining event:', error);
    return false;
  } finally {
    client.release();
  }
};

// イベント参加キャンセル機能
export const leaveEvent = async (eventId: string, userId: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM participants WHERE event_id = $1 AND user_x_id = $2',
      [eventId, userId]
    );
    
    return result.rowCount! > 0;
  } catch (error: any) {
    console.error('Error leaving event:', error);
    return false;
  } finally {
    client.release();
  }
};

// ユーザーの参加状態確認
export const isUserJoined = async (eventId: string, userId: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id FROM participants WHERE event_id = $1 AND user_x_id = $2',
      [eventId, userId]
    );
    
    return result.rows.length > 0;
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

// 永続化されたユーザー一覧の取得
export const getAllUsers = async (): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE is_active = TRUE ORDER BY last_login_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
};

// 永続化されたイベントマスター一覧の取得
export const getAllEventMasters = async (): Promise<any[]> => {
  if (isLocalDev) {
    return mockData.event_masters.slice();
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM event_masters WHERE is_active = TRUE ORDER BY event_date ASC, start_time ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

export const deleteEventMaster = async (eventId: string): Promise<boolean> => {
  if (isLocalDev) {
    const index = mockData.event_masters.findIndex(event => event.id === eventId);
    if (index === -1) return false;
    
    mockData.event_masters.splice(index, 1);
    console.log(`モックSQL: DELETE FROM event_masters WHERE id = $1`, [eventId]);
    return true;
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM event_masters WHERE id = $1', [eventId]);
    return result.rowCount > 0;
  } finally {
    client.release();
  }
};

// 参加履歴の取得
export const getParticipationHistory = async (userXId?: string, eventMasterId?: string): Promise<any[]> => {
  const client = await pool.connect();
  try {
    let query = `
      SELECT p.*, u.x_name, u.x_username, u.x_icon_url, e.name as event_name, e.event_date
      FROM participations p
      JOIN users u ON p.user_x_id = u.x_id
      JOIN event_masters e ON p.event_master_id = e.id
      WHERE p.is_cancelled = FALSE
    `;
    const params: string[] = [];
    
    if (userXId) {
      params.push(userXId);
      query += ` AND p.user_x_id = $${params.length}`;
    }
    
    if (eventMasterId) {
      params.push(eventMasterId);
      query += ` AND p.event_master_id = $${params.length}`;
    }
    
    query += ` ORDER BY p.participated_at DESC`;
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export default pool;