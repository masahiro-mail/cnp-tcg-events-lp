import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST() {
  try {
    console.log('🌱 イベントデータのシード実行開始');
    
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
      // 直接定義したイベントデータ（UUIDs自動生成）
      const seedEvents = [
        {
          name: '東京CNPトレカチャンピオンシップ',
          event_date: '2025-01-25',
          start_time: '10:00',
          end_time: '18:00',
          organizer: '東京CNPトレカ同好会',
          area: '関東',
          prefecture: '東京都',
          venue_name: '東京ビッグサイト 東展示棟',
          address: '東京都江東区有明3-11-1',
          url: 'https://tokyo-cnp-tcg.jp',
          description: '東京で開催される最大規模のCNPトレカ大会です。初心者から上級者まで楽しめるトーナメント形式で開催。優勝者にはレアカードのプレゼントもあります！',
          announcement_url: 'https://twitter.com/tokyo_cnp_tcg/status/123456789'
        },
        {
          name: '大阪CNPトレカバトル大会',
          event_date: '2025-02-16',
          start_time: '13:00',
          end_time: '19:00',
          organizer: '関西CNPトレカ愛好会',
          area: '関西',
          prefecture: '大阪府',
          venue_name: 'インテックス大阪 1号館',
          address: '大阪府大阪市住之江区南港北1-5-102',
          url: 'https://osaka-cnp-tcg.jp',
          description: '関西最大級のCNPトレカイベント！トーナメント戦に加え、カード交換会も同時開催。関西のCNPファンが一堂に会する貴重な機会です。',
          announcement_url: 'https://twitter.com/osaka_cnp_tcg/status/123456790'
        },
        {
          name: '名古屋CNPトレカ交流会',
          event_date: '2025-03-08',
          start_time: '14:00',
          end_time: '17:00',
          organizer: '中部CNPコミュニティ',
          area: '中部',
          prefecture: '愛知県',
          venue_name: 'ポートメッセなごや 第1展示館',
          address: '愛知県名古屋市港区金城ふ頭2-2',
          url: 'https://nagoya-cnp-tcg.jp',
          description: 'アットホームな雰囲気の中部地区交流会。デッキ構築講座やレアカード展示もあり、初心者歓迎のイベントです。',
          announcement_url: 'https://twitter.com/nagoya_cnp_tcg/status/123456791'
        },
        {
          name: '福岡CNPトレカトーナメント',
          event_date: '2025-03-22',
          start_time: '11:00',
          end_time: '16:00',
          organizer: '九州CNPトレカ連盟',
          area: '九州',
          prefecture: '福岡県',
          venue_name: 'マリンメッセ福岡 A館',
          address: '福岡県福岡市博多区沖浜町7-1',
          url: 'https://fukuoka-cnp-tcg.jp',
          description: '九州地区の腕自慢が集まる本格トーナメント。賞品も豪華で、白熱したバトルが期待できます！',
          announcement_url: 'https://twitter.com/fukuoka_cnp_tcg/status/123456792'
        },
        {
          name: '札幌CNPトレカ春祭り',
          event_date: '2025-04-05',
          start_time: '12:00',
          end_time: '18:00',
          organizer: '北海道CNPトレカ愛好会',
          area: '北海道',
          prefecture: '北海道',
          venue_name: 'アクセスサッポロ 大展示場',
          address: '北海道札幌市白石区流通センター4-3-55',
          url: 'https://sapporo-cnp-tcg.jp',
          description: '春の訪れを祝う北海道最大のCNPトレカイベント。トーナメントの他、北海道限定グッズの販売も！',
          announcement_url: 'https://twitter.com/sapporo_cnp_tcg/status/123456793'
        },
        {
          name: 'CNPトレカ オンライン交流戦',
          event_date: '2025-04-20',
          start_time: '20:00',
          end_time: '22:00',
          organizer: 'CNPトレカ オンライン委員会',
          area: 'オンライン',
          prefecture: 'ー',
          venue_name: 'Discord ボイスチャンネル',
          address: 'オンライン開催',
          url: 'https://discord.gg/cnp-tcg',
          description: '全国のCNPトレカプレイヤーと気軽に対戦できるオンラインイベント。初心者歓迎！デッキ構築のアドバイスもあります。',
          announcement_url: 'https://twitter.com/cnp_online_tcg/status/123456794'
        }
      ];

      const results = [];
      let importedEvents = 0;
      let importedMasters = 0;

      // Event Masters と Events の両方に挿入
      for (const event of seedEvents) {
        try {
          // Event Master として挿入（UUID自動生成）
          const masterResult = await client.query(`
            INSERT INTO event_masters (name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), NOW())
            RETURNING id
          `, [
            event.name, event.event_date, event.start_time, event.end_time,
            event.organizer, event.area, event.prefecture, event.venue_name,
            event.address, event.url, event.description, event.announcement_url
          ]);
          const masterId = masterResult.rows[0].id;
          importedMasters++;

          // Event として挿入（master_idも含む）
          await client.query(`
            INSERT INTO events (master_id, name, event_date, start_time, end_time, organizer, area, prefecture, venue_name, address, url, description, announcement_url, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          `, [
            masterId, event.name, event.event_date, event.start_time, event.end_time,
            event.organizer, event.area, event.prefecture, event.venue_name,
            event.address, event.url, event.description, event.announcement_url
          ]);
          importedEvents++;

        } catch (error) {
          console.error('Event seed error:', event.name, error.message);
          results.push(`Error seeding ${event.name}: ${error.message}`);
        }
      }

      results.push(`Event Masters seeded: ${importedMasters}/${seedEvents.length}`);
      results.push(`Events seeded: ${importedEvents}/${seedEvents.length}`);

      // 最終件数確認
      const eventCountResult = await client.query('SELECT COUNT(*) as count FROM events');
      const eventMasterCountResult = await client.query('SELECT COUNT(*) as count FROM event_masters');
      
      const finalCounts = {
        events: parseInt(eventCountResult.rows[0].count),
        event_masters: parseInt(eventMasterCountResult.rows[0].count)
      };

      console.log('✅ イベントシード完了');
      
      return NextResponse.json({
        success: true,
        message: 'Event seed data inserted successfully',
        results,
        final_counts: finalCounts,
        seeded: {
          events: importedEvents,
          event_masters: importedMasters
        }
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error: any) {
    console.error('❌ イベントシードエラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed event data',
      message: error.message
    }, { status: 500 });
  }
}