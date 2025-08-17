import fs from 'fs';
import path from 'path';
import { Event, Participant, User, EventMaster, Participation } from '@/types/database';

// ファイルベース永続化ストレージ
interface PersistentData {
  users: User[];
  events: Event[];
  participants: Participant[];
  event_masters: EventMaster[];
  participations: Participation[];
  lastUpdated: string;
}

const DATA_DIR = './data';
const DATA_FILE = path.join(DATA_DIR, 'persistent_data.json');

// データディレクトリの作成
if (typeof window === 'undefined' && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初期データの読み込み
let persistentData: PersistentData = {
  users: [],
  events: [],
  participants: [],
  event_masters: [],
  participations: [],
  lastUpdated: new Date().toISOString()
};

// データファイルの読み込み
export function loadPersistentData(): PersistentData {
  if (typeof window !== 'undefined') return persistentData; // クライアントサイドでは実行しない

  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      const loadedData = JSON.parse(fileContent);
      persistentData = { ...persistentData, ...loadedData };
      console.log('✅ 永続化データを読み込みました:', DATA_FILE);
      console.log(`- ユーザー: ${persistentData.users.length}人`);
      console.log(`- イベント: ${persistentData.events.length}件`);
      console.log(`- イベントマスター: ${persistentData.event_masters.length}件`);
      console.log(`- 参加者: ${persistentData.participants.length}件`);
      console.log(`- 参加履歴: ${persistentData.participations.length}件`);
    } else {
      console.log('📁 永続化データファイルが存在しません。新規作成します。');
      savePersistentData(persistentData);
    }
  } catch (error) {
    console.error('❌ 永続化データの読み込みに失敗:', error);
  }

  return persistentData;
}

// データファイルの保存
export function savePersistentData(data: PersistentData): void {
  if (typeof window !== 'undefined') return; // クライアントサイドでは実行しない

  try {
    data.lastUpdated = new Date().toISOString();
    const fileContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(DATA_FILE, fileContent, 'utf8');
    console.log('💾 永続化データを保存しました:', DATA_FILE);
  } catch (error) {
    console.error('❌ 永続化データの保存に失敗:', error);
  }
}

// 個別データ更新関数
export function updateUsers(users: User[]): void {
  persistentData.users = users;
  savePersistentData(persistentData);
}

export function updateEvents(events: Event[]): void {
  persistentData.events = events;
  savePersistentData(persistentData);
}

export function updateParticipants(participants: Participant[]): void {
  persistentData.participants = participants;
  savePersistentData(persistentData);
}

export function updateEventMasters(eventMasters: EventMaster[]): void {
  persistentData.event_masters = eventMasters;
  savePersistentData(persistentData);
}

export function updateParticipations(participations: Participation[]): void {
  persistentData.participations = participations;
  savePersistentData(persistentData);
}

// データ取得関数
export function getPersistentData(): PersistentData {
  return loadPersistentData();
}

export default {
  load: loadPersistentData,
  save: savePersistentData,
  updateUsers,
  updateEvents,
  updateParticipants,
  updateEventMasters,
  updateParticipations,
  getData: getPersistentData
};