// 永続化イベントデータ

export const generateTestUsers = () => [];

export const generateTestEventMasters = () => [
  {
    id: 'event-master-osaka-championship-20250816',
    name: 'チャンピオンシップ決勝戦PublicView@大阪＆大阪定例交流会#003',
    event_date: '2025-08-16',
    start_time: '11:30:00',
    end_time: '18:00:00',
    organizer: '図解師★ウルフ',
    area: '近畿',
    prefecture: '大阪府',
    venue_name: 'TIME SHARING TSHG淀屋橋ビル 2F Room.2',
    address: '大阪市中央区今橋２丁目６−１４ 関西ペイントビル',
    url: 'https://time-sharing.jp/detail/666798',
    description: 'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
    announcement_url: 'https://example.com/event',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const generateTestEvents = () => [
  {
    id: 'event-osaka-championship-20250816',
    name: 'チャンピオンシップ決勝戦PublicView@大阪＆大阪定例交流会#003',
    event_date: '2025-08-16',
    start_time: '11:30:00',
    end_time: '18:00:00',
    organizer: '図解師★ウルフ',
    area: '近畿',
    prefecture: '大阪府',
    venue_name: 'TIME SHARING TSHG淀屋橋ビル 2F Room.2',
    address: '大阪市中央区今橋２丁目６−１４ 関西ペイントビル',
    url: 'https://time-sharing.jp/detail/666798',
    description: 'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
    announcement_url: 'https://example.com/event',
    created_at: new Date().toISOString()
  }
];

// イベントデータの初期化を有効化
export const initMockData = () => {
  // イベントデータを永続化テーブルに追加
  return {
    events: generateTestEvents(),
    event_masters: generateTestEventMasters(),
    users: generateTestUsers()
  };
};