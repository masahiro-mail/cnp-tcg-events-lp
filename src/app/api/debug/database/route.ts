import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(request: NextRequest) {
  console.log('🔍 Database debug endpoint called');
  
  const databaseUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL configured:', !!databaseUrl);
  console.log('DATABASE_URL type:', databaseUrl?.substring(0, 20) + '...');
  
  if (!databaseUrl) {
    return NextResponse.json({
      error: 'DATABASE_URL not configured',
      configured: false
    }, { status: 500 });
  }

  let pool: Pool | null = null;
  
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    });

    const client = await pool.connect();
    
    try {
      // 接続テスト
      const connectTest = await client.query('SELECT NOW()');
      console.log('✅ PostgreSQL connection successful');
      
      // テーブル存在確認
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      console.log('📊 Tables found:', tables);
      
      // 各テーブルのデータ件数確認
      const tableStats: Record<string, number> = {};
      for (const tableName of tables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
          tableStats[tableName] = parseInt(countResult.rows[0].count);
        } catch (error) {
          console.error(`Error counting ${tableName}:`, error);
          tableStats[tableName] = -1;
        }
      }
      
      // participantsテーブルの詳細データ
      let participantsData = [];
      if (tables.includes('participants')) {
        try {
          const participantsResult = await client.query(`
            SELECT event_id, user_x_id, user_x_name, created_at 
            FROM participants 
            ORDER BY created_at DESC
          `);
          participantsData = participantsResult.rows;
        } catch (error) {
          console.error('Error fetching participants:', error);
        }
      }
      
      return NextResponse.json({
        status: 'connected',
        timestamp: connectTest.rows[0].now,
        database_url_configured: true,
        tables: tables,
        table_stats: tableStats,
        participants_data: participantsData,
        total_participants: tableStats.participants || 0
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      database_url_configured: !!databaseUrl
    }, { status: 500 });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}