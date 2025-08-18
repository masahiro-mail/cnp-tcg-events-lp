import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import fileStorage from '@/lib/file-storage';

export async function POST() {
  try {
    console.log('🔄 イベントデータPostgreSQL移行開始');
    
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
      // 1. ファイルストレージからイベントデータを読み込み
      let eventsToImport = [];
      let eventMastersToImport = [];
      
      try {
        console.log('📁 ファイルストレージからデータ読み込み...');
        const persistentData = fileStorage.load();
        eventsToImport = persistentData.events || [];
        eventMastersToImport = persistentData.event_masters || [];
        console.log(`📊 読み込み完了: Events ${eventsToImport.length}件, Masters ${eventMastersToImport.length}件`);
      } catch (fileError) {
        console.log('📁 ファイルストレージが空 - モックデータを使用');
        // ファイルストレージが空の場合、モックデータを使用
        const { generateTestEvents, generateTestEventMasters } = require('@/lib/mock-data');
        eventsToImport = generateTestEvents();
        eventMastersToImport = generateTestEventMasters();
        console.log(`📊 モックデータ生成: Events ${eventsToImport.length}件, Masters ${eventMastersToImport.length}件`);
      }

      const results = [];

      // 2. Event Mastersをインポート
      console.log('🔧 Event Masters インポート中...');
      let importedMasters = 0;
      for (const eventMaster of eventMastersToImport) {
        try {
          await client.query(`
            INSERT INTO event_masters (id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
            eventMaster.id,
            eventMaster.name,
            eventMaster.event_date,
            eventMaster.start_time,
            eventMaster.end_time || null,
            eventMaster.organizer,
            eventMaster.area,
            eventMaster.prefecture,
            eventMaster.venue_name,
            eventMaster.address,
            eventMaster.url || null,
            eventMaster.description,
            eventMaster.announcement_url || null,
            eventMaster.is_active !== undefined ? eventMaster.is_active : true,
            eventMaster.created_at || new Date().toISOString(),
            eventMaster.updated_at || new Date().toISOString()
          ]);
          importedMasters++;
        } catch (error) {
          console.error('Event Master インポートエラー:', eventMaster.id, error.message);
        }
      }
      results.push(`Event Masters imported: ${importedMasters}/${eventMastersToImport.length}`);

      // 3. Eventsをインポート
      console.log('🔧 Events インポート中...');
      let importedEvents = 0;
      for (const event of eventsToImport) {
        try {
          await client.query(`
            INSERT INTO events (id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url, created_at)
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
              announcement_url = EXCLUDED.announcement_url
          `, [
            event.id,
            event.name,
            event.event_date,
            event.start_time,
            event.end_time || null,
            event.organizer,
            event.area,
            event.prefecture,
            event.venue_name,
            event.address,
            event.url || null,
            event.description,
            event.announcement_url || null,
            event.created_at || new Date().toISOString()
          ]);
          importedEvents++;
        } catch (error) {
          console.error('Event インポートエラー:', event.id, error.message);
        }
      }
      results.push(`Events imported: ${importedEvents}/${eventsToImport.length}`);

      // 4. インポート後の件数確認
      const eventCountResult = await client.query('SELECT COUNT(*) as count FROM events');
      const eventMasterCountResult = await client.query('SELECT COUNT(*) as count FROM event_masters');
      
      const finalCounts = {
        events: parseInt(eventCountResult.rows[0].count),
        event_masters: parseInt(eventMasterCountResult.rows[0].count)
      };

      console.log('✅ イベントデータ移行完了');
      
      return NextResponse.json({
        success: true,
        message: 'Event data migration completed',
        results,
        final_counts: finalCounts,
        imported: {
          events: importedEvents,
          event_masters: importedMasters
        }
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error: any) {
    console.error('❌ イベントデータ移行エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate event data',
      message: error.message
    }, { status: 500 });
  }
}