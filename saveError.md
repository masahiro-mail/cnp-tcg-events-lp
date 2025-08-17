● 現在のデータ保存方法について詳しく説明します。

  現在のデータ保存システム

  1. デュアルストレージ構成

  // 本番環境での保存フロー
  PostgreSQL (Railway) + File Storage
  (./data/persistent_data.json)

  2. 保存場所とファイル構造

  ファイルストレージ: ./data/persistent_data.json
  {
    "users": [],
    "events": [],
    "participants": [
      {
        "id": "persistent-participant-1692345...",
        "event_id": "event-osaka-championship-20250816",
        "user_x_id": "1068505245720829952",
        "user_x_name": "図解師★ウルフ🐺/DiagramMaster_Wolf",
        "user_x_icon_url": "https://...",
        "created_at": "2025-08-17T07:36:47.465Z"
      }
    ],
    "event_masters": [],
    "participations": [],
    "lastUpdated": "2025-08-17T07:36:47.465Z"
  }

  3. 具体的な保存フロー

  参加登録時の処理順序：

  // 1. API呼び出し
  /api/events/[id]/participate (POST)
    ↓
  // 2. joinEvent関数が呼ばれる
  joinEvent(eventId, userData)
    ↓
  // 3. createParticipant関数が呼ばれる
  createParticipant(data)
    ↓
  // 4. PostgreSQL処理（本番環境）
  if (pool) {
    // a. 重複チェック
    SELECT id FROM participants WHERE event_id = ? AND user_x_id =     
   ?

    // b. データ挿入
    INSERT INTO participants (event_id, user_x_id, user_x_name,        
  user_x_icon_url)

    // c. ファイルストレージにもバックアップ保存
    mockData.participants.push(newParticipant)
    fileStorage.save(mockData)  // ./data/persistent_data.json
  に保存
  }
    ↓
  // 5. フォールバック処理（PostgreSQL失敗時）
  else {
    // ファイルストレージのみに保存
    mockData.participants.push(newParticipant)
    fileStorage.save(mockData)
  }

  4. ファイルストレージの実装詳細

  src/lib/file-storage.ts から：
  // 保存場所
  const DATA_FILE = './data/persistent_data.json'

  // 保存メソッド
  save(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  }

  // 読み込みメソッド
  load() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  }

  5. 本番環境（Railway）での保存

  - PostgreSQL: メインデータベース（Railway PostgreSQL）
  - File Storage: Docker コンテナ内の ./data/persistent_data.json      
  - 問題: ファイルはデプロイ時にリセットされる可能性がある

  6. 現在の課題

  1. ファイルの永続性: Dockerコンテナ再起動でファイルが消える
  2. デプロイ時リセット: 新しいデプロイでファイルが初期化される        
  3. PostgreSQL接続問題: 接続エラー時のフォールバック依存

  7. データ確認方法

  # 管理者API経由での確認
  GET https://event.cnp-tradingcard.com/api/admin/participants

  # レスポンス例
  {
    "success": true,
    "data": {
      "total_participants": 0,
      "participants": [],
      "by_event": {}
    },
    "storage_info": {
      "data_file": "./data/persistent_data.json",
      "last_updated": "2025-08-17T00:10:08.429Z"
    }
  }

  現在の問題: total_participants: 0
  となっており、データが保存されていない状態です。

  PostgreSQL接続が成功しているか、ファイルストレージが正しく動作し     
  ているかを詳しく調査する必要があります。