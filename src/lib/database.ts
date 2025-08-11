import { Pool } from 'pg';
import { Event, Participant, CreateEventData, CreateParticipantData, User, EventMaster, Participation, CreateUserData, DatabasePool } from '@/types/database';

// 環境判定
const isLocalDev = process.env.DATABASE_URL?.startsWith('file:');
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;


// メモリ内データストア
let mockData = {
  users: [] as User[],
  events: [] as Event[],
  participants: [] as Participant[],
  event_masters: [] as EventMaster[],
  participations: [] as Participation[]
};

// テストデータの初期化
if (isLocalDev && typeof window === 'undefined') {
  // サーバーサイドでテストデータを同期的に初期化
  try {
    const { generateTestUsers, generateTestEventMasters, generateTestEvents } = require('./mock-data');
    
    mockData.users = generateTestUsers();
    mockData.event_masters = generateTestEventMasters();
    mockData.events = generateTestEvents();
    
    // 参加者データを空で初期化
    mockData.participants = [];
    
    console.log('🎯 テストデータを読み込みました');
    console.log(`- ユーザー: ${mockData.users.length}人`);
    console.log(`- イベントマスター: ${mockData.event_masters.length}件`);
    console.log(`- 現在のイベント: ${mockData.events.length}件`);
    console.log(`- 参加者: ${mockData.participants.length}件`);
  } catch (error) {
    console.log('テストデータの読み込みをスキップ:', error.message);
  }
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

let pool: DatabasePool | null = null;

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
            end_time: params?.[3],
            organizer: params?.[4],
            area: params?.[5],
            prefecture: params?.[6],
            venue_name: params?.[7],
            address: params?.[8],
            url: params?.[9],
            description: params?.[10],
            announcement_url: params?.[11],
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
            end_time: params?.[3],
            organizer: params?.[4],
            area: params?.[5],
            prefecture: params?.[6],
            venue_name: params?.[7],
            address: params?.[8],
            url: params?.[9],
            description: params?.[10],
            announcement_url: params?.[11],
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
        
        if (sql.includes('SELECT id FROM events WHERE id = $1')) {
          const eventId = params?.[0];
          console.log('🔍 イベント存在チェック - 検索ID:', eventId);
          console.log('🔍 現在のmockData.events:', mockData.events.map(e => ({ id: e.id, name: e.name })));
          const event = mockData.events.find(e => e.id === eventId);
          console.log('🔍 検索結果:', event ? '見つかった' : '見つからない');
          return Promise.resolve({ rows: event ? [{ id: event.id }] : [] });
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
        
        if (sql.includes('SELECT * FROM participants WHERE user_x_id = $1')) {
          const userId = params?.[0];
          const participants = mockData.participants.filter(p => p.user_x_id === userId);
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
        
        if (sql.includes('DELETE FROM event_masters WHERE id = $1')) {
          const [eventId] = params || [];
          const initialLength = mockData.event_masters.length;
          mockData.event_masters = mockData.event_masters.filter(e => e.id !== eventId);
          const rowCount = initialLength - mockData.event_masters.length;
          return Promise.resolve({ rowCount });
        }
        
        return Promise.resolve({ rows: [] });
      },
      release: () => Promise.resolve()
    })
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// フォールバック用のメモリ内モックデータストア
let mockEvents: Event[] = [];

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
          end_time TIME,
          organizer TEXT NOT NULL,
          area TEXT NOT NULL,
          prefecture TEXT NOT NULL,
          venue_name TEXT NOT NULL,
          address TEXT NOT NULL,
          url TEXT,
          description TEXT NOT NULL,
          announcement_url TEXT,
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
          end_time TIME,
          organizer TEXT NOT NULL,
          area TEXT NOT NULL,
          prefecture TEXT NOT NULL,
          venue_name TEXT NOT NULL,
          address TEXT NOT NULL,
          url TEXT,
          description TEXT NOT NULL,
          announcement_url TEXT,
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
      
      // 本番環境または初回起動時にイベントデータが空の場合、サンプルデータを追加
      const eventCount = await client.query('SELECT COUNT(*) FROM events');
      const currentEventCount = parseInt(eventCount.rows[0].count);
      console.log(`現在のイベント数: ${currentEventCount}`);
      
      if (currentEventCount === 0) {
        const { generateTestEvents } = require('./mock-data');
        const sampleEvents = generateTestEvents();
        
        console.log(`サンプルイベントデータを追加中: ${sampleEvents.length}件`);
        for (const event of sampleEvents) {
          try {
            await client.query(`
              INSERT INTO events (id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
              ON CONFLICT (id) DO NOTHING
            `, [event.id, event.name, event.event_date, event.start_time, event.end_time || null, event.organizer || 'CNPトレカ交流会', event.area, event.prefecture, event.venue_name, event.address, event.url || null, event.description]);
            console.log(`✓ イベント追加: ${event.id} - ${event.name}`);
          } catch (error) {
            console.error(`✗ イベント追加失敗: ${event.id}`, error);
          }
        }
        
        console.log(`サンプルイベントデータ追加完了: ${sampleEvents.length}件`);
      }
      
      // デバッグ用：現在のイベント数とparticipants数を確認
      const eventCountResult = await client.query('SELECT COUNT(*) FROM events');
      const participantCountResult = await client.query('SELECT COUNT(*) FROM participants');
      console.log(`Database status - Events: ${eventCountResult.rows[0].count}, Participants: ${participantCountResult.rows[0].count}`);
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
      end_time: data.end_time,
      organizer: data.organizer,
      area: data.area,
      prefecture: data.prefecture,
      venue_name: data.venue_name,
      address: data.address,
      url: data.url,
      description: data.description,
      created_at: new Date().toISOString()
    };
    mockData.events.push(newEvent);
    console.log('Mock event added. Total mock events:', mockData.events.length);
    return newEvent;
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO events (name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [data.name, data.event_date, data.start_time, data.end_time, data.organizer, data.area, data.prefecture, data.venue_name, data.address, data.url, data.description]);
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
      end_time: data.end_time,
      organizer: data.organizer,
      area: data.area,
      prefecture: data.prefecture,
      venue_name: data.venue_name,
      address: data.address,
      url: data.url,
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
        SET name = $2, event_date = $3, start_time = $4, end_time = $5, organizer = $6, area = $7, prefecture = $8, venue_name = $9, address = $10, url = $11, description = $12
        WHERE id = $1
        RETURNING *
      `, [id, data.name, data.event_date, data.start_time, data.end_time, data.organizer, data.area, data.prefecture, data.venue_name, data.address, data.url, data.description]);
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
    return mockData.participants.filter(p => p.event_id === eventId).sort((a, b) => 
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
    return mockData.participants.filter(p => p.event_id === eventId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
};

export const getParticipantsByUserId = async (userId: string): Promise<Participant[]> => {
  
  if (!pool) {
    console.warn('Database not configured, returning mock participants');
    // 統合されたmockData.participantsを使用
    const filtered = mockData.participants.filter(p => p.user_x_id === userId);
    console.log('Mock filtered participants:', filtered.length);
    console.log('Mock participants data:', filtered);
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  try {
    const client = await pool.connect();
    try {
      console.log('PostgreSQL: Connected for getParticipantsByUserId');
      const result = await client.query('SELECT * FROM participants WHERE user_x_id = $1 ORDER BY created_at DESC', [userId]);
      console.log('PostgreSQL: Found participants:', result.rows.length);
      console.log('PostgreSQL: Participant data:', result.rows);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return mockData.participants.filter(p => p.user_x_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
};

// ユーザー管理関数
export const upsertUser = async (userData: {
  x_id: string;
  x_name: string;
  x_username: string;
  x_icon_url: string;
}): Promise<void> => {
  if (!pool) {
    console.warn('Database not configured, storing user in mock data');
    // モックデータ用の実装
    const existing = mockData.users.find(u => u.x_id === userData.x_id);
    if (existing) {
      existing.x_name = userData.x_name;
      existing.x_username = userData.x_username;
      existing.x_icon_url = userData.x_icon_url;
      existing.last_login_at = new Date().toISOString();
      existing.updated_at = new Date().toISOString();
    } else {
      mockData.users.push({
        x_id: userData.x_id,
        x_name: userData.x_name,
        x_username: userData.x_username,
        x_icon_url: userData.x_icon_url,
        first_login_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      });
    }
    console.log('User upserted in mock data:', userData.x_id);
    return;
  }

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
  if (!pool) {
    console.warn('Database not configured, creating mock participant');
    // 重複チェック
    const existingParticipant = mockData.participants.find(
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
    
    mockData.participants.push(newParticipant);
    console.log('Mock participant added. Total participants:', mockData.participants.length);
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
    } catch (error: unknown) {
      const dbError = error as { code?: string };
      if (dbError.code === '23505') {
        return null;
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    // エラー時もモックデータで処理
    const existingParticipant = mockData.participants.find(
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
    
    mockData.participants.push(newParticipant);
    console.log('Mock participant added after error. Total participants:', mockData.participants.length);
    return newParticipant;
  }
};

// イベント参加機能
export const joinEvent = async (eventId: string, userData: {
  user_x_id: string;
  user_x_name: string;
  user_x_icon_url: string;
}): Promise<boolean> => {
  
  if (!pool) {
    console.warn('Database not configured, using mock data for joinEvent');
    // ユーザー情報を永続化
    await upsertUser({
      x_id: userData.user_x_id,
      x_name: userData.user_x_name,
      x_username: userData.user_x_name,
      x_icon_url: userData.user_x_icon_url
    });
    
    // 既存参加チェック
    const existingParticipant = mockData.participants.find(
      p => p.event_id === eventId && p.user_x_id === userData.user_x_id
    );
    
    if (existingParticipant) {
      console.log('Mock: Already participating');
      return false; // 既に参加済み
    }
    
    // 参加者を追加
    const participant = {
      id: generateId(),
      event_id: eventId,
      user_x_id: userData.user_x_id,
      user_x_name: userData.user_x_name,
      user_x_icon_url: userData.user_x_icon_url,
      created_at: new Date().toISOString()
    };
    mockData.participants.push(participant);
    console.log('Mock participant added:', participant.id);
    console.log('Total mock participants:', mockData.participants.length);
    return true;
  }

  try {
    const client = await pool.connect();
    
    try {
      console.log('PostgreSQL: Connected to database');
      
      // イベント存在チェック（モックシステム経由）
      const eventCheck = await client.query('SELECT id FROM events WHERE id = $1', [eventId]);
      console.log('Event exists:', eventCheck.rows.length > 0);
      if (eventCheck.rows.length === 0) {
        console.error('Event not found:', eventId);
        return false;
      }
      
      // ユーザー情報を永続化
      await upsertUser({
        x_id: userData.user_x_id,
        x_name: userData.user_x_name,
        x_username: userData.user_x_name,
        x_icon_url: userData.user_x_icon_url
      });
      console.log('User upserted successfully');
      
      // 既存参加チェック（モックシステム経由）
      const existingResult = await client.query(
        'SELECT id FROM participants WHERE event_id = $1 AND user_x_id = $2',
        [eventId, userData.user_x_id]
      );
      console.log('Existing participants found:', existingResult.rows.length);
      
      if (existingResult.rows.length > 0) {
        console.log('PostgreSQL: Already participating');
        return false; // 既に参加済み
      }
      
      // 参加者を追加（モックシステム経由）
      const insertResult = await client.query(`
        INSERT INTO participants (event_id, user_x_id, user_x_name, user_x_icon_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [eventId, userData.user_x_id, userData.user_x_name, userData.user_x_icon_url]);
      
      console.log('PostgreSQL: Participant added with ID:', insertResult.rows[0].id);
      return true;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Error joining event:', error);
    return false;
  }
};

// イベント参加キャンセル機能
export const leaveEvent = async (eventId: string, userId: string): Promise<boolean> => {
  if (!pool) {
    console.warn('Database not configured, using mock data for leaveEvent');
    const initialLength = mockData.participants.length;
    mockData.participants = mockData.participants.filter(
      p => !(p.event_id === eventId && p.user_x_id === userId)
    );
    const success = mockData.participants.length < initialLength;
    console.log('Mock participant removed:', success);
    return success;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM participants WHERE event_id = $1 AND user_x_id = $2',
      [eventId, userId]
    );
    
    return result.rowCount! > 0;
  } catch (error: unknown) {
    console.error('Error leaving event:', error);
    return false;
  } finally {
    client.release();
  }
};

// ユーザーの参加状態確認
export const isUserJoined = async (eventId: string, userId: string): Promise<boolean> => {
  if (!pool) {
    console.warn('Database not configured, checking mock data for isUserJoined');
    const participant = mockData.participants.find(
      p => p.event_id === eventId && p.user_x_id === userId
    );
    return !!participant;
  }

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

// 永続化されたユーザー一覧の取得
export const getAllUsers = async (): Promise<User[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE is_active = TRUE ORDER BY last_login_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
};

// 永続化されたイベントマスター一覧の取得
export const getAllEventMasters = async (): Promise<EventMaster[]> => {
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
export const getParticipationHistory = async (userXId?: string, eventMasterId?: string): Promise<Participation[]> => {
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