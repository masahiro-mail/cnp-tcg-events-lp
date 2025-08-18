import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    console.log('🔍 イベントデバッグAPI開始');
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not configured'
      }, { status: 500 });
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 5
    });

    const client = await pool.connect();
    
    try {
      // 1. テーブル存在確認
      const tablesResult = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'events'
      `);
      
      // 2. イベント件数確認
      const countResult = await client.query('SELECT COUNT(*) as count FROM events');
      
      // 3. 実際のイベントデータ取得
      const eventsResult = await client.query('SELECT * FROM events ORDER BY event_date ASC, start_time ASC');
      
      // 4. Event Masters件数確認
      const masterCountResult = await client.query('SELECT COUNT(*) as count FROM event_masters');
      
      return NextResponse.json({
        success: true,
        database_url_configured: !!databaseUrl,
        tables_exist: tablesResult.rows.length > 0,
        events_count: parseInt(countResult.rows[0].count),
        event_masters_count: parseInt(masterCountResult.rows[0].count),
        events: eventsResult.rows,
        message: 'PostgreSQL connection and data retrieval successful'
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error: any) {
    console.error('❌ デバッグエラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug events',
      message: error.message
    }, { status: 500 });
  }
}