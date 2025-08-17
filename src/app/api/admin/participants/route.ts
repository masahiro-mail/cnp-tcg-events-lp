import { NextResponse } from 'next/server';
import pool from '@/lib/database';
import fileStorage from '@/lib/file-storage';

export async function GET() {
  try {
    console.log('🔍 管理者用参加者データ確認API');
    
    // PostgreSQL優先、失敗時はフォールバック
    if (pool) {
      try {
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
        
      } catch (pgError) {
        console.error('❌ PostgreSQL接続エラー、フォールバックモードに切り替え:', pgError);
        // PostgreSQL失敗時はフォールバックに続行
      }
    }
    
    // フォールバック: ファイルストレージから読み込み
    console.log('🚨 フォールバックモード: ファイルストレージから読み込み');
    
    try {
      const persistentData = fileStorage.load();
      
      const participantsData = {
        total_participants: persistentData.participants.length,
        participants: persistentData.participants.map(p => ({
          id: p.id,
          event_id: p.event_id,
          user_x_id: p.user_x_id,
          user_x_name: p.user_x_name,
          created_at: p.created_at
        })),
        by_event: persistentData.participants.reduce((acc, p) => {
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
      
      console.log(`📊 参加者データ確認完了 (フォールバック): ${participantsData.total_participants}件`);
      
      return NextResponse.json({
        success: true,
        data: participantsData,
        timestamp: new Date().toISOString(),
        storage_info: {
          database: 'File Storage (Fallback)',
          data_file: './data/persistent_data.json',
          last_updated: persistentData.lastUpdated,
          total_records: persistentData.participants.length
        }
      });
      
    } catch (fileError) {
      console.error('❌ ファイルストレージ読み込みエラー:', fileError);
      return NextResponse.json({
        success: false,
        error: 'Both PostgreSQL and file storage failed',
        details: {
          postgresql_error: 'Connection failed',
          file_storage_error: fileError instanceof Error ? fileError.message : 'Unknown error'
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ 管理者API全体エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Admin API error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}