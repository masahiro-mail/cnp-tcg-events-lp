// ローカル開発用のテストデータ生成

export const generateTestUsers = () => [
  {
    x_id: "12345678",
    x_name: "田中太郎",
    x_username: "tanaka_taro",
    x_icon_url: "https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=田",
    first_login_at: "2025-01-01T10:00:00.000Z",
    last_login_at: "2025-01-08T15:30:00.000Z",
    is_active: true,
    updated_at: "2025-01-08T15:30:00.000Z"
  },
  {
    x_id: "87654321",
    x_name: "鈴木花子",
    x_username: "suzuki_hanako",
    x_icon_url: "https://via.placeholder.com/64x64/EC4899/FFFFFF?text=鈴",
    first_login_at: "2025-01-02T14:20:00.000Z",
    last_login_at: "2025-01-07T20:15:00.000Z",
    is_active: true,
    updated_at: "2025-01-07T20:15:00.000Z"
  },
  {
    x_id: "11223344",
    x_name: "山田次郎",
    x_username: "yamada_jiro",
    x_icon_url: "https://via.placeholder.com/64x64/10B981/FFFFFF?text=山",
    first_login_at: "2024-12-15T09:45:00.000Z",
    last_login_at: "2025-01-05T11:00:00.000Z",
    is_active: true,
    updated_at: "2025-01-05T11:00:00.000Z"
  }
];

export const generateTestEventMasters = () => [
  {
    id: "event_master_1",
    name: "新年CNPトレカ交流会 東京会場",
    event_date: "2025-01-15",
    start_time: "14:00",
    area: "関東",
    prefecture: "東京都",
    venue_name: "秋葉原コミュニティホール",
    address: "東京都千代田区外神田1-1-1",
    description: "新年最初の大規模CNPトレカ交流会です。初心者から上級者まで大歓迎！",
    is_active: true,
    created_at: "2025-01-01T10:00:00.000Z",
    updated_at: "2025-01-01T10:00:00.000Z"
  },
  {
    id: "event_master_2", 
    name: "CNP冬季トーナメント 大阪会場",
    event_date: "2025-01-20",
    start_time: "13:30",
    area: "関西",
    prefecture: "大阪府",
    venue_name: "梅田スカイビル会議室",
    address: "大阪府大阪市北区大淀中1-1-88",
    description: "関西地区最大規模のCNPトーナメント開催！豪華賞品を用意しています。",
    is_active: true,
    created_at: "2025-01-02T11:30:00.000Z",
    updated_at: "2025-01-02T11:30:00.000Z"
  },
  {
    id: "event_master_3",
    name: "CNP体験会 福岡会場",
    event_date: "2025-01-25",
    start_time: "15:00",
    area: "九州",
    prefecture: "福岡県",
    venue_name: "博多駅前会議室",
    address: "福岡県福岡市博多区博多駅前2-1-1",
    description: "CNPトレカ初心者向けの体験会です。ルール説明から実践まで丁寧にサポート！",
    is_active: true,
    created_at: "2025-01-03T09:15:00.000Z",
    updated_at: "2025-01-03T09:15:00.000Z"
  },
  {
    id: "event_master_4",
    name: "【終了】CNP年末大会",
    event_date: "2024-12-30",
    start_time: "16:00",
    area: "関東",
    prefecture: "東京都", 
    venue_name: "渋谷コミュニティホール",
    address: "東京都渋谷区渋谷1-1-1",
    description: "2024年を締めくくる大規模CNPイベントでした。",
    is_active: false,
    created_at: "2024-12-01T12:00:00.000Z",
    updated_at: "2024-12-30T18:00:00.000Z"
  }
];

export const generateTestEvents = () => [
  {
    id: "current_event_1",
    name: "CNPトレカ交流会 池袋会場",
    event_date: "2025-01-12",
    start_time: "14:00",
    area: "関東",
    prefecture: "東京都",
    venue_name: "池袋サンシャインシティ",
    address: "東京都豊島区東池袋3-1-1",
    description: "週末のCNPトレカ交流会です。カードの交換や対戦を楽しみましょう！参加費無料、デッキレンタルもあります。",
    created_at: "2025-01-05T10:00:00.000Z"
  },
  {
    id: "current_event_2",
    name: "初心者歓迎CNP体験会",
    event_date: "2025-01-18",
    start_time: "13:00",
    area: "関西",
    prefecture: "大阪府",
    venue_name: "なんばパークス",
    address: "大阪府大阪市浪速区難波中2-10-70",
    description: "CNPトレカを初めて触る方向けの体験イベントです。ルール説明から実践まで丁寧にサポートします！",
    created_at: "2025-01-06T14:30:00.000Z"
  },
  {
    id: "current_event_3",
    name: "CNP新春トーナメント 2025",
    event_date: "2025-01-20",
    start_time: "10:00",
    area: "関東",
    prefecture: "東京都",
    venue_name: "東京ビッグサイト",
    address: "東京都江東区有明3-11-1",
    description: "新春特別企画！優勝者には限定NFTカードをプレゼント。エントリー受付中です。",
    created_at: "2025-01-07T09:00:00.000Z"
  },
  {
    id: "current_event_4",
    name: "CNPカード交換会 横浜会場",
    event_date: "2025-01-25",
    start_time: "15:30",
    area: "関東",
    prefecture: "神奈川県",
    venue_name: "パシフィコ横浜",
    address: "神奈川県横浜市西区みなとみらい1-1-1",
    description: "レアカードの交換がメインのイベントです。トレード希望リストを持参してください！",
    created_at: "2025-01-08T11:15:00.000Z"
  },
  {
    id: "current_event_5",
    name: "CNPコミュニティデー 名古屋",
    event_date: "2025-02-02",
    start_time: "12:00",
    area: "中部",
    prefecture: "愛知県",
    venue_name: "ナゴヤドーム前イオン",
    address: "愛知県名古屋市東区矢田南4-102-3",
    description: "中部地区初開催！コミュニティメンバー同士の親睦を深めるイベントです。",
    created_at: "2025-01-09T08:30:00.000Z"
  }
];

// モックデータを初期化する関数
export const initMockData = () => {
  if (typeof window !== 'undefined') {
    return; // クライアントサイドでは実行しない
  }
  
  const { initDatabase } = require('./database');
  
  // データベース初期化後にテストデータを追加
  setTimeout(async () => {
    try {
      console.log('🚀 テストデータを初期化中...');
      
      // テストユーザーをモックDBに追加
      const users = generateTestUsers();
      const eventMasters = generateTestEventMasters();
      const events = generateTestEvents();
      
      // グローバルなmockDataを更新（database.tsからアクセス可能にする）
      const mockData = (global as any).mockData || {
        users: [],
        events: [],
        participants: [],
        event_masters: [],
        participations: []
      };
      
      mockData.users.push(...users);
      mockData.event_masters.push(...eventMasters);
      mockData.events.push(...events);
      
      (global as any).mockData = mockData;
      
      console.log('✅ テストデータの初期化完了');
      console.log(`- ユーザー: ${users.length}人`);
      console.log(`- イベントマスター: ${eventMasters.length}件`);
      console.log(`- 現在のイベント: ${events.length}件`);
      
    } catch (error) {
      console.error('❌ テストデータ初期化エラー:', error);
    }
  }, 1000);
};