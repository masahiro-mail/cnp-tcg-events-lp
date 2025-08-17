import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// 本番環境PostgreSQL接続
const pool = new Pool({
  connectionString: 'postgresql://postgres:fJhmXsQEtIhHHHWqSrJvhCjYLEbqMFLD@junction.proxy.rlwy.net:25061/railway',
  ssl: { rejectUnauthorized: true },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ローカルの永続化データを読み込み
const dataFile = path.join(process.cwd(), 'data', 'persistent_data.json');

async function migrateData() {
  try {
    console.log('🚀 本番環境データ移行を開始します...');
    
    // ローカルデータの読み込み
    if (!fs.existsSync(dataFile)) {
      console.error('❌ ローカルデータファイルが見つかりません:', dataFile);
      return;
    }
    
    const fileContent = fs.readFileSync(dataFile, 'utf8');
    const localData = JSON.parse(fileContent);
    console.log('📁 ローカルデータを読み込みました');
    console.log(`- イベント: ${localData.events.length}件`);
    console.log(`- イベントマスター: ${localData.event_masters.length}件`);
    console.log(`- ユーザー: ${localData.users.length}人`);
    console.log(`- 参加者: ${localData.participants.length}件`);
    console.log(`- 参加履歴: ${localData.participations.length}件`);
    
    const client = await pool.connect();
    
    try {
      // テーブル作成
      console.log('🔨 PostgreSQLテーブルを作成中...');
      
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
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
      
      // Participations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS participations (
          id TEXT PRIMARY KEY,
          event_master_id TEXT NOT NULL REFERENCES event_masters(id),
          user_x_id TEXT NOT NULL REFERENCES users(x_id),
          participated_at TIMESTAMPTZ DEFAULT NOW(),
          is_cancelled BOOLEAN DEFAULT FALSE,
          cancelled_at TIMESTAMPTZ NULL,
          UNIQUE(event_master_id, user_x_id)
        )
      `);
      
      console.log('✅ テーブル作成完了');
      
      // ユーザーデータ移行
      console.log('👥 ユーザーデータを移行中...');
      for (const user of localData.users) {
        await client.query(`
          INSERT INTO users (x_id, x_name, x_username, x_icon_url, first_login_at, last_login_at, is_active, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (x_id) DO UPDATE SET
            x_name = EXCLUDED.x_name,
            x_username = EXCLUDED.x_username,
            x_icon_url = EXCLUDED.x_icon_url,
            last_login_at = EXCLUDED.last_login_at,
            updated_at = NOW()
        `, [user.x_id, user.x_name, user.x_username, user.x_icon_url, 
            user.first_login_at, user.last_login_at, user.is_active, user.updated_at]);
      }
      
      // イベントマスターデータ移行
      console.log('🎯 イベントマスターデータを移行中...');
      for (const eventMaster of localData.event_masters) {
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
        `, [eventMaster.id, eventMaster.name, eventMaster.event_date, eventMaster.start_time,
            eventMaster.end_time, eventMaster.organizer, eventMaster.area, eventMaster.prefecture,
            eventMaster.venue_name, eventMaster.address, eventMaster.url, eventMaster.description,
            eventMaster.announcement_url, eventMaster.is_active, eventMaster.created_at, eventMaster.updated_at]);
      }
      
      // イベントデータ移行
      console.log('📅 イベントデータを移行中...');
      for (const event of localData.events) {
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
        `, [event.id, event.name, event.event_date, event.start_time,
            event.end_time, event.organizer, event.area, event.prefecture,
            event.venue_name, event.address, event.url, event.description,
            event.announcement_url, event.created_at]);
      }
      
      // 参加者データ移行
      console.log('🙋‍♂️ 参加者データを移行中...');
      for (const participant of localData.participants) {
        await client.query(`
          INSERT INTO participants (id, event_id, user_x_id, user_x_name, user_x_icon_url, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (event_id, user_x_id) DO NOTHING
        `, [participant.id, participant.event_id, participant.user_x_id, 
            participant.user_x_name, participant.user_x_icon_url, participant.created_at]);
      }
      
      // 参加履歴データ移行
      console.log('📋 参加履歴データを移行中...');
      for (const participation of localData.participations) {
        await client.query(`
          INSERT INTO participations (id, event_master_id, user_x_id, participated_at, is_cancelled, cancelled_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (event_master_id, user_x_id) DO NOTHING
        `, [participation.id, participation.event_master_id, participation.user_x_id,
            participation.participated_at, participation.is_cancelled, participation.cancelled_at]);
      }
      
      // 移行結果確認
      const eventCount = await client.query('SELECT COUNT(*) FROM events');
      const participantCount = await client.query('SELECT COUNT(*) FROM participants');
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      
      console.log('🎉 データ移行完了！');
      console.log(`✅ イベント: ${eventCount.rows[0].count}件`);
      console.log(`✅ 参加者: ${participantCount.rows[0].count}件`);
      console.log(`✅ ユーザー: ${userCount.rows[0].count}人`);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ データ移行エラー:', error);
  } finally {
    await pool.end();
  }
}

// スクリプト実行
if (require.main === module) {
  migrateData();
}

export { migrateData };