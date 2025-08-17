import { NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 管理者用参加者データ確認API - PostgreSQL');
    
    if (!pool) {
      console.error('❌ PostgreSQL pool not configured');
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 500 });
    }

    // PostgreSQLからデータを読み込み
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM participants ORDER BY created_at DESC');
      const participants = result.rows;
      
      const participantsData = {
        total_participants: participants.length,
        participants: participants.map(p => ({
          id: p.id,
          event_id: p.event_id,
          user_x_id: p.user_x_id,
          user_x_name: p.user_x_name,
          created_at: p.created_at
        })),
        by_event: participants.reduce((acc, p) => {
          if (!acc[p.event_id]) {
            acc[p.event_id] = [];
          }
          acc[p.event_id].push({
            user_x_name: p.user_x_name,
            user_x_id: p.user_x_id,
            created_at: p.created_at
          });
          return acc;
        }, {} as Record<string, any[]>)
      };
      
      console.log(`📊 参加者データ確認完了 (PostgreSQL): ${participantsData.total_participants}件`);
      
      return NextResponse.json({
        success: true,
        data: participantsData,
        timestamp: new Date().toISOString(),
        storage_info: {
          database: 'PostgreSQL',
          total_records: participants.length
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ 参加者データ確認エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve participants data from PostgreSQL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}