import { NextResponse } from 'next/server';
import fileStorage from '@/lib/file-storage';

export async function GET() {
  try {
    console.log('🔍 管理者用参加者データ確認API');
    
    // ファイルストレージからデータを読み込み
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
    
    console.log(`📊 参加者データ確認完了: ${participantsData.total_participants}件`);
    
    return NextResponse.json({
      success: true,
      data: participantsData,
      timestamp: new Date().toISOString(),
      storage_info: {
        data_file: './data/persistent_data.json',
        last_updated: persistentData.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('❌ 参加者データ確認エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve participants data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}