import { Pool } from 'pg';
import { Event, Participant, CreateEventData, CreateParticipantData, User, EventMaster, Participation, CreateUserData, DatabasePool } from '@/types/database';
import fileStorage from './file-storage';

// 環境判定
const isLocalDev = process.env.DATABASE_URL?.startsWith('file:');
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

// PostgreSQL接続プールとフォールバック管理
let postgresConnectionFailed = false;

console.log('🔍 データベース環境判定:');
console.log('- DATABASE_URL:', databaseUrl);
console.log('- isLocalDev:', isLocalDev);
console.log('- isProduction:', isProduction);

// SQLiteファイルベースDB用の設定
const isSQLiteFile = databaseUrl?.startsWith('file:') && !databaseUrl.includes('memory');


// メモリ内データストア
let mockData = {
  users: [] as User[],
  events: [] as Event[],
  participants: [] as Participant[],
  event_masters: [] as EventMaster[],
  participations: [] as Participation[]
};

// 永続化データの初期化（全環境対応）
if (typeof window === 'undefined') {
  // サーバーサイドで永続化データを同期的に初期化
  try {
    // 本番環境でも強制的にファイルストレージからデータを読み込み
    console.log('📁 ファイルストレージからデータを読み込み中... (PostgreSQL fallback mode)');
    const persistentData = fileStorage.load();
    
    mockData.users = persistentData.users;
    mockData.event_masters = persistentData.event_masters;
    mockData.events = persistentData.events;
    mockData.participants = persistentData.participants;
    mockData.participations = persistentData.participations;
    
    // データが空の場合、初期データを作成
    if (mockData.events.length === 0) {
      const { generateTestUsers, generateTestEventMasters, generateTestEvents } = require('./mock-data');
      mockData.users = [...mockData.users, ...generateTestUsers()];
      mockData.event_masters = [...mockData.event_masters, ...generateTestEventMasters()];
      mockData.events = [...mockData.events, ...generateTestEvents()];
      
      // ファイルに保存
      fileStorage.save({
        users: mockData.users,
        events: mockData.events,
        participants: mockData.participants,
        event_masters: mockData.event_masters,
        participations: mockData.participations,
        lastUpdated: new Date().toISOString()
      });
    }
    
    const environment = isProduction ? '本番環境' : '開発環境';
    const storageType = databaseUrl?.includes('.json') ? 'ファイルストレージ' : 'メモリ/PostgreSQL';
    console.log(`🎯 ${environment} (${storageType}) - 永続化イベントデータを読み込みました`);
    console.log(`- ユーザー: ${mockData.users.length}人`);
    console.log(`- イベントマスター: ${mockData.event_masters.length}件`);
    console.log(`- 現在のイベント: ${mockData.events.length}件`);
    console.log(`- 参加者: ${mockData.participants.length}件`);
    console.log(`- 参加履歴: ${mockData.participations.length}件`);
  } catch (error) {
    console.log('永続化データの読み込みエラー:', error.message);
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
        
        // UPDATE operations
        if (sql.includes('UPDATE events') && sql.includes('WHERE id = $1')) {
          const [id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url] = params || [];
          console.log('🔧 モックSQL: イベント更新 - ID:', id);
          
          const eventIndex = mockData.events.findIndex(e => e.id === id);
          console.log('🔧 モックSQL: イベントインデックス:', eventIndex);
          
          if (eventIndex !== -1) {
            mockData.events[eventIndex] = {
              ...mockData.events[eventIndex],
              name: name,
              event_date: event_date,
              start_time: start_time,
              end_time: end_time,
              organizer: organizer,
              area: area,
              prefecture: prefecture,
              venue_name: venue_name,
              address: address,
              url: url,
              description: description,
              announcement_url: announcement_url
            };
            console.log('🔧 モックSQL: イベント更新完了:', mockData.events[eventIndex].name);
            return Promise.resolve({ rows: [mockData.events[eventIndex]] });
          } else {
            console.log('🔧 モックSQL: イベントが見つかりません');
            return Promise.resolve({ rows: [] });
          }
        }
        
        return Promise.resolve({ rows: [] });
      },
      release: () => Promise.resolve()
    })
  };
} else {
  // 本番環境PostgreSQL設定
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('⚠️ DATABASE_URL が設定されていません - フォールバックモードで動作します');
    // フォールバック: モックデータベースを使用
    pool = {
      connect: () => Promise.resolve({
        query: (sql: string, params?: any[]) => {
          console.log('フォールバックSQL:', sql.substring(0, 50) + '...');
          
          // SELECT operations for events
          if (sql.includes('SELECT * FROM events')) {
            return Promise.resolve({ rows: mockData.events });
          }
          
          // その他の操作は空の結果を返す
          return Promise.resolve({ rows: [] });
        },
        release: () => Promise.resolve()
      })
    };
    
    console.log('🔄 フォールバックデータベースモードで初期化完了');
  } else {
  
  console.log('🔗 PostgreSQL接続を初期化中...');
  console.log('- Connection String:', connectionString.replace(/:[^:/@]*@/, ':***@')); // パスワードを隠す
  
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // タイムアウトを延長
    allowExitOnIdle: false,
    application_name: 'cnp-tcg-events'
  });
  
  // 接続テスト
  pool.on('connect', (client) => {
    console.log('✅ PostgreSQL接続成功');
  });
  
  pool.on('error', (err) => {
    console.error('❌ PostgreSQL接続エラー:', err);
  });
  }
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
          cancelled_at TIMESTAMPTZ NULL,
          UNIQUE(event_master_id, user_x_id)
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
      
      // 永続化データをPostgreSQLに自動挿入
      try {
        const { generateTestEventMasters, generateTestEvents } = require('./mock-data');
        const eventMasters = generateTestEventMasters();
        const events = generateTestEvents();
        
        // event_mastersテーブルに永続化データを挿入
        for (const eventMaster of eventMasters) {
          await client.query(`
            INSERT INTO event_masters (id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              event_date = EXCLUDED.event_date,
              start_time = EXCLUDED.start_time,
              end_time = EXCLUDED.end_time,
              organizer = EXCLUDED.organizer,
              area = EXCLUDED.area,
              prefecture = EXCLUDED.prefecture,
              venue_name = EXCLUDED.venue_name,
              address = EXCLUDED.address,
              url = EXCLUDED.url,
              description = EXCLUDED.description,
              announcement_url = EXCLUDED.announcement_url,
              updated_at = NOW()
          `, [
            eventMaster.id, eventMaster.name, eventMaster.event_date, eventMaster.start_time,
            eventMaster.end_time, eventMaster.organizer, eventMaster.area, eventMaster.prefecture,
            eventMaster.venue_name, eventMaster.address, eventMaster.url, eventMaster.description,
            eventMaster.announcement_url, eventMaster.is_active
          ]);
        }
        
        // eventsテーブルに運用データを挿入
        for (const event of events) {
          await client.query(`
            INSERT INTO events (id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              event_date = EXCLUDED.event_date,
              start_time = EXCLUDED.start_time,
              end_time = EXCLUDED.end_time,
              organizer = EXCLUDED.organizer,
              area = EXCLUDED.area,
              prefecture = EXCLUDED.prefecture,
              venue_name = EXCLUDED.venue_name,
              address = EXCLUDED.address,
              url = EXCLUDED.url,
              description = EXCLUDED.description,
              announcement_url = EXCLUDED.announcement_url
          `, [
            event.id, event.name, event.event_date, event.start_time,
            event.end_time, event.organizer, event.area, event.prefecture,
            event.venue_name, event.address, event.url, event.description,
            event.announcement_url
          ]);
        }
        
        console.log(`✅ 永続化データをPostgreSQLに自動挿入: Events ${events.length}件, Masters ${eventMasters.length}件`);
      } catch (error) {
        console.log('永続化データの挿入をスキップ:', error.message);
      }
      
      // デバッグ用：現在のイベント数とparticipants数を確認
      const eventCountResult = await client.query('SELECT COUNT(*) FROM events');
      const participantCountResult = await client.query('SELECT COUNT(*) FROM participants');
      const eventMasterCountResult = await client.query('SELECT COUNT(*) FROM event_masters');
      console.log(`Database status - Events: ${eventCountResult.rows[0].count}, Participants: ${participantCountResult.rows[0].count}, Event Masters: ${eventMasterCountResult.rows[0].count}`);
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
      announcement_url: data.announcement_url || null,
      created_at: new Date().toISOString()
    };
    
    // 現在のイベントテーブルに追加
    mockData.events.push(newEvent);
    
    // 永続化テーブル（event_masters）にも追加
    const eventMaster = {
      id: newEvent.id,
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
      announcement_url: data.announcement_url || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockData.event_masters.push(eventMaster);
    
    console.log('Mock event added. Total events:', mockData.events.length, ', Event masters:', mockData.event_masters.length);
    return newEvent;
  }

  try {
    const client = await pool.connect();
    try {
      // 両方のテーブルに同時作成
      const result = await client.query(`
        INSERT INTO events (name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [data.name, data.event_date, data.start_time, data.end_time, data.organizer, data.area, data.prefecture, data.venue_name, data.address, data.url, data.description, data.announcement_url]);
      
      // event_mastersにも同時作成
      await client.query(`
        INSERT INTO event_masters (id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [result.rows[0].id, data.name, data.event_date, data.start_time, data.end_time, data.organizer, data.area, data.prefecture, data.venue_name, data.address, data.url, data.description, data.announcement_url]);
      
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
      announcement_url: data.announcement_url || null,
      created_at: new Date().toISOString()
    };
    mockData.events.push(newEvent);
    console.log('Mock event added after error. Total events:', mockData.events.length);
    return newEvent;
  }
};

export const updateEvent = async (id: string, data: CreateEventData): Promise<Event | null> => {
  if (!pool) {
    console.warn('Database not configured, updating mock data');
    console.log('🔧 イベント更新 - 検索ID:', id);
    console.log('🔧 現在のmockData.events:', mockData.events.map(e => ({ id: e.id, name: e.name })));
    
    const eventIndex = mockData.events.findIndex(event => event.id === id);
    console.log('🔧 見つかったイベントインデックス:', eventIndex);
    
    if (eventIndex !== -1) {
      // イベントデータを更新
      mockData.events[eventIndex] = {
        ...mockData.events[eventIndex],
        ...data,
        // announcement_url フィールドが欠けている場合のデフォルト値
        announcement_url: data.announcement_url || mockData.events[eventIndex].announcement_url || null
      };
      
      // 永続化テーブル（event_masters）も更新
      const masterIndex = mockData.event_masters.findIndex(em => em.id === id);
      if (masterIndex !== -1) {
        mockData.event_masters[masterIndex] = {
          ...mockData.event_masters[masterIndex],
          ...data,
          announcement_url: data.announcement_url || mockData.event_masters[masterIndex].announcement_url || null,
          updated_at: new Date().toISOString()
        };
        console.log('🔧 イベントマスターも更新完了:', mockData.event_masters[masterIndex].name);
      }
      
      console.log('🔧 イベント更新完了:', mockData.events[eventIndex].name);
      return mockData.events[eventIndex];
    }
    console.log('🔧 イベントが見つかりません');
    return null;
  }

  try {
    const client = await pool.connect();
    try {
      // eventsテーブルを更新
      const result = await client.query(`
        UPDATE events 
        SET name = $2, event_date = $3, start_time = $4, end_time = $5, organizer = $6, area = $7, prefecture = $8, venue_name = $9, address = $10, url = $11, description = $12, announcement_url = $13
        WHERE id = $1
        RETURNING *
      `, [id, data.name, data.event_date, data.start_time, data.end_time, data.organizer, data.area, data.prefecture, data.venue_name, data.address, data.url, data.description, data.announcement_url]);
      
      // 永続化テーブル（event_masters）も同時更新
      await client.query(`
        UPDATE event_masters 
        SET name = $2, event_date = $3, start_time = $4, end_time = $5, organizer = $6, area = $7, prefecture = $8, venue_name = $9, address = $10, url = $11, description = $12, announcement_url = $13, updated_at = NOW()
        WHERE id = $1
      `, [id, data.name, data.event_date, data.start_time, data.end_time, data.organizer, data.area, data.prefecture, data.venue_name, data.address, data.url, data.description, data.announcement_url]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    // エラー時もmockData.eventsを使用
    const eventIndex = mockData.events.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      mockData.events[eventIndex] = {
        ...mockData.events[eventIndex],
        ...data
      };
      return mockData.events[eventIndex];
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
  // PostgreSQL優先、失敗時のみフォールバック
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM participants WHERE event_id = $1 ORDER BY created_at ASC', [eventId]);
        console.log(`✅ PostgreSQL参加者取得成功: ${result.rows.length}件`);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ PostgreSQL参加者取得エラー、フォールバックに切り替え:', error);
    }
  }
  
  // PostgreSQL失敗時のフォールバック
  console.warn(`🚨 Using mock data for participants retrieval (PostgreSQL fallback) - Event: ${eventId}`);
  
  const participants = mockData.participants.filter(p => p.event_id === eventId).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  console.log(`📊 Found ${participants.length} participants for event ${eventId}`);
  participants.forEach(p => {
    console.log(`  - ${p.user_x_name} (${p.user_x_id}) joined at ${p.created_at}`);
  });
  
  return participants;
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
    
    // ファイルストレージに保存（永続化）
    if (databaseUrl?.includes('.json')) {
      fileStorage.save({
        users: mockData.users,
        events: mockData.events,
        participants: mockData.participants,
        event_masters: mockData.event_masters,
        participations: mockData.participations,
        lastUpdated: new Date().toISOString()
      });
      console.log('💾 ユーザーデータをファイルストレージに永続化しました');
    }
    
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
  console.log('🔍 [DEBUG] createParticipant called with:', data);
  console.log('🔍 [DEBUG] pool状態:', pool ? 'プール存在' : 'プールなし');
  console.log('🔍 [DEBUG] DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
  
  // 新しい参加者オブジェクトを作成（共通処理）
  const newParticipant: Participant = {
    id: 'persistent-participant-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    event_id: data.event_id,
    user_x_id: data.user_x_id,
    user_x_name: data.user_x_name,
    user_x_icon_url: data.user_x_icon_url,
    created_at: new Date().toISOString()
  };
  
  // PostgreSQL処理（本番環境）
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          INSERT INTO participants (event_id, user_x_id, user_x_name, user_x_icon_url)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [data.event_id, data.user_x_id, data.user_x_name, data.user_x_icon_url]);
        
        console.log('✅ PostgreSQL参加者保存成功:', result.rows[0]);
        
        // PostgreSQL成功時でも、必ずフォールバック保存を実行
        console.log('🔥 [DEBUG] PostgreSQL成功 - フォールバック保存も実行');
        mockData.participants.push(newParticipant);
        
        // 強制的にファイルストレージに保存（サーバーサイドでのみ）
        if (typeof window === 'undefined') {
          try {
            fileStorage.save({
              users: mockData.users,
              events: mockData.events,
              participants: mockData.participants,
              event_masters: mockData.event_masters,
              participations: mockData.participations,
              lastUpdated: new Date().toISOString()
            });
            console.log('✅ PostgreSQL + File storage backup saved successfully');
          } catch (error) {
            console.error('❌ Failed to save file storage backup:', error);
          }
        }
        
        return result.rows[0];
      } catch (dbError: any) {
        if (dbError.code === '23505') {
          console.log('❌ PostgreSQL: 既に参加済み');
          return null;
        }
        throw dbError;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ PostgreSQL接続エラー、フォールバックに切り替え:', error);
      // PostgreSQL失敗時はフォールバック処理を継続
    }
  }
  
  // フォールバック処理（開発環境 OR PostgreSQL失敗時）
  console.warn('🚨 Using file storage for participant creation (fallback mode)');
  
  // 重複チェック
  const existingParticipant = mockData.participants.find(
    p => p.event_id === data.event_id && p.user_x_id === data.user_x_id
  );
  if (existingParticipant) {
    console.log('❌ Participant already exists in mock data');
    return null;
  }
  
  mockData.participants.push(newParticipant);
  
  // 強制的にファイルストレージに保存（サーバーサイドでのみ）
  if (typeof window === 'undefined') {
    try {
      fileStorage.save({
        users: mockData.users,
        events: mockData.events,
        participants: mockData.participants,
        event_masters: mockData.event_masters,
        participations: mockData.participations,
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ Fallback participant saved to file storage successfully');
    } catch (error) {
      console.error('❌ Failed to save to file storage:', error);
    }
  }
  
  console.log(`✅ Fallback participant added: ${data.user_x_name}. Total: ${mockData.participants.length}`);
  return newParticipant;
};

// イベント参加機能
export const joinEvent = async (eventId: string, userData: {
  user_x_id: string;
  user_x_name: string;
  user_x_icon_url: string;
}): Promise<boolean> => {
  console.log('🔥 [joinEvent] Called with:', { eventId, userData });
  console.log('🔥 [joinEvent] pool状態:', pool ? 'プール存在' : 'プールなし');
  
  // 必ず createParticipant を呼び出す（すべての環境で統一）
  try {
    console.log('🔥 [joinEvent] createParticipant 処理を開始');
    const participant = await createParticipant({
      event_id: eventId,
      user_x_id: userData.user_x_id,
      user_x_name: userData.user_x_name,
      user_x_icon_url: userData.user_x_icon_url
    });
    
    if (participant) {
      console.log('✅ [joinEvent] 参加登録成功:', participant.id);
      return true;
    } else {
      console.log('❌ [joinEvent] 既に参加済みまたは処理失敗');
      return false;
    }
  } catch (error) {
    console.error('❌ [joinEvent] createParticipant処理エラー:', error);
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