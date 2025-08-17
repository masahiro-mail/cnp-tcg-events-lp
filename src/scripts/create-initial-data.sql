-- 8/16イベントデータを本番環境PostgreSQLに直接挿入

-- 1. テーブル作成
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  x_id TEXT PRIMARY KEY,
  x_name TEXT NOT NULL,
  x_username TEXT NOT NULL,
  x_icon_url TEXT NOT NULL,
  first_login_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
);

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
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_x_id TEXT NOT NULL,
  user_x_name TEXT NOT NULL,
  user_x_icon_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_x_id)
);

CREATE TABLE IF NOT EXISTS participations (
  id TEXT PRIMARY KEY,
  event_master_id TEXT NOT NULL REFERENCES event_masters(id),
  user_x_id TEXT NOT NULL REFERENCES users(x_id),
  participated_at TIMESTAMPTZ DEFAULT NOW(),
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ NULL,
  UNIQUE(event_master_id, user_x_id)
);

-- 2. 8/16イベントマスターデータ挿入
INSERT INTO event_masters (
  id, name, event_date, start_time, end_time, organizer, area, prefecture, 
  venue_name, address, url, description, announcement_url, is_active, 
  created_at, updated_at
) VALUES (
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
  E'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
  'https://example.com/event',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
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
  updated_at = NOW();

-- 3. 8/16イベントデータ挿入
INSERT INTO events (
  id, name, event_date, start_time, end_time, organizer, area, prefecture,
  venue_name, address, url, description, announcement_url, created_at
) VALUES (
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
  E'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
  'https://example.com/event',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
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
  announcement_url = EXCLUDED.announcement_url;

-- 4. 結果確認
SELECT 'Event Masters' as table_name, COUNT(*) as count FROM event_masters
UNION ALL
SELECT 'Events' as table_name, COUNT(*) as count FROM events
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Participants' as table_name, COUNT(*) as count FROM participants;