import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST() {
  try {
    console.log('🔧 PostgreSQLテーブル作成API開始');
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not configured'
      }, { status: 500 });
    }

    console.log('🔗 DATABASE_URL found, creating connection...');
    
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 5
    });

    const client = await pool.connect();
    
    try {
      console.log('✅ PostgreSQL接続成功');
      
      // 接続テスト
      const connectionTest = await client.query('SELECT NOW() as current_time');
      console.log('🕐 Server time:', connectionTest.rows[0].current_time);

      const results = [];

      // 1. UUID拡張を有効化
      console.log('🔧 Enabling UUID extension...');
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      results.push('UUID extension enabled');

      // 2. Usersテーブル作成
      console.log('🔧 Creating users table...');
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
      results.push('Users table created');

      // 3. Event Masters テーブル作成
      console.log('🔧 Creating event_masters table...');
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
      results.push('Event Masters table created');

      // 4. Events テーブル作成
      console.log('🔧 Creating events table...');
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
      results.push('Events table created');

      // 5. Participants テーブル作成（最重要）
      console.log('🔧 Creating participants table...');
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
      results.push('Participants table created');

      // 6. Participations テーブル作成
      console.log('🔧 Creating participations table...');
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
      results.push('Participations table created');

      // 7. テーブル一覧と件数確認
      console.log('📊 Checking created tables...');
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      
      // 各テーブルの件数確認
      const tableCounts = {};
      for (const table of tables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
          tableCounts[table] = parseInt(countResult.rows[0].count);
        } catch (error) {
          tableCounts[table] = 'Error counting';
        }
      }

      console.log('✅ テーブル作成完了');
      
      return NextResponse.json({
        success: true,
        message: 'All tables created successfully',
        results,
        tables_created: tables,
        table_counts: tableCounts,
        server_time: connectionTest.rows[0].current_time
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error: any) {
    console.error('❌ テーブル作成エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create tables',
      message: error.message,
      details: error.detail || 'No additional details'
    }, { status: 500 });
  }
}