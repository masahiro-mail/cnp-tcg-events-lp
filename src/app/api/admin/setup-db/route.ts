import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// 本番環境PostgreSQL直接設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // タイムアウト延長
  allowExitOnIdle: false,
  application_name: 'cnp-tcg-setup'
});

export async function POST() {
  try {
    console.log('🚀 本番環境データベース初期化開始');
    
    const client = await pool.connect();
    
    try {
      // 1. Extensions作成
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      // 2. テーブル作成
      console.log('📋 テーブル作成中...');
      
      // Users table
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
      
      // Event Masters table
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_masters (
          id TEXT PRIMARY KEY,
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
      
      // Events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
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
      
      // Participants table
      await client.query(`
        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY,
          event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_x_id TEXT NOT NULL,
          user_x_name TEXT NOT NULL,
          user_x_icon_url TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(event_id, user_x_id)
        )
      `);
      
      console.log('✅ テーブル作成完了');
      
      // 3. 8/16イベントデータ挿入
      console.log('📅 8/16イベントデータ挿入中...');
      
      // Event Master挿入
      await client.query(`
        INSERT INTO event_masters (
          id, name, event_date, start_time, end_time, organizer, area, prefecture, 
          venue_name, address, url, description, announcement_url, is_active, 
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = NOW()
      `, [
        'event-master-osaka-championship-20250816',
        'チャンピオンシップ決勝戦PublicView@大阪＆大阪定例交流会#003',
        '2025-08-16',
        '11:30:00',
        '18:00:00',
        '図解師★ウルフ',
        '近畿',
        '大阪府',
        'TIME SHARING TSHG淀屋橋ビル 2F Room.2',
        '大阪市中央区今橋２丁目６−１４ 関西ペイントビル',
        'https://time-sharing.jp/detail/666798',
        'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
        'https://example.com/event',
        true
      ]);
      
      // Event挿入
      await client.query(`
        INSERT INTO events (
          id, name, event_date, start_time, end_time, organizer, area, prefecture,
          venue_name, address, url, description, announcement_url, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name
      `, [
        'event-osaka-championship-20250816',
        'チャンピオンシップ決勝戦PublicView@大阪＆大阪定例交流会#003',
        '2025-08-16',
        '11:30:00',
        '18:00:00',
        '図解師★ウルフ',
        '近畿',
        '大阪府',
        'TIME SHARING TSHG淀屋橋ビル 2F Room.2',
        '大阪市中央区今橋２丁目６−１４ 関西ペイントビル',
        'https://time-sharing.jp/detail/666798',
        'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
        'https://example.com/event'
      ]);
      
      // 4. 結果確認
      const eventCount = await client.query('SELECT COUNT(*) FROM events');
      const eventMasterCount = await client.query('SELECT COUNT(*) FROM event_masters');
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      const participantCount = await client.query('SELECT COUNT(*) FROM participants');
      
      console.log('🎉 データベース初期化完了！');
      console.log(`- Events: ${eventCount.rows[0].count}件`);
      console.log(`- Event Masters: ${eventMasterCount.rows[0].count}件`);
      console.log(`- Users: ${userCount.rows[0].count}人`);
      console.log(`- Participants: ${participantCount.rows[0].count}件`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully',
        data: {
          events: parseInt(eventCount.rows[0].count),
          event_masters: parseInt(eventMasterCount.rows[0].count),
          users: parseInt(userCount.rows[0].count),
          participants: parseInt(participantCount.rows[0].count)
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Database setup failed', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database setup endpoint. Use POST to initialize database.' 
  });
}