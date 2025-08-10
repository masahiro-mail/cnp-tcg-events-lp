# X（Twitter）認証とデータベース永続化セットアップガイド

## 概要

このプロジェクトにX認証機能とイベントデータの永続化機能を実装しました。

## 主要な改修内容

### 1. データベース構造の改善
- **users テーブル**: X認証ユーザーの永続化（削除されない）
- **event_masters テーブル**: イベント情報のマスターデータ（削除されない）
- **participations テーブル**: 参加履歴のログ（削除されない）
- **events, participants テーブル**: 従来通り（後方互換性）

### 2. X認証の強化
- NextAuth.jsのコールバックでユーザー情報を自動保存
- ログイン履歴の管理
- プロフィール情報の自動更新

### 3. 管理画面の追加
- `/admin/users` - 登録ユーザー一覧
- `/admin/events/masters` - イベントマスター一覧

## セットアップ手順

### 1. 環境変数の設定
`.env.local` ファイルに以下を追加：

```env
# X (Twitter) API 設定
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# NextAuth.js 設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# データベース設定
DATABASE_URL=your_database_connection_string
```

### 2. X（Twitter） API の設定

1. [Twitter Developer Portal](https://developer.twitter.com/) でアプリを作成
2. OAuth 2.0 を有効化
3. Callback URL に `http://localhost:3000/api/auth/callback/twitter` を設定
4. Client ID と Client Secret を取得

### 3. データベースの初期化

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 初期アクセスでデータベースが自動初期化されます
# または手動で初期化: http://localhost:3000/api/init
```

### 4. 動作確認

1. `http://localhost:3000` にアクセス
2. X認証でログイン
3. `/admin` で管理画面にアクセス（管理者認証が必要）
4. `/admin/users` でユーザー一覧を確認

## 新しい機能

### ユーザー永続化
- Xでログインすると自動的に `users` テーブルに保存
- プロフィール情報が変更されても履歴が保持
- 最終ログイン時刻の自動更新

### イベントマスター管理
- イベント作成時に `event_masters` テーブルに永続保存
- コード改修で既存の `events` テーブルが変更されてもデータは保持
- 管理画面から履歴確認可能

### 参加履歴の永続化
- 参加登録は `participations` テーブルに記録
- 削除機能なし（ソフトデリートでキャンセル対応）
- 完全な参加履歴を保持

## 管理画面の使い方

### ダッシュボード (`/admin`)
- 現在のイベント一覧表示
- 各種管理画面へのナビゲーション
- イベント作成・編集・削除

### ユーザー管理 (`/admin/users`)
- 登録済みユーザーの一覧表示
- アイコン、名前、ユーザー名、ログイン履歴を確認
- アクティブ/非アクティブの状態表示

### イベントマスター管理 (`/admin/events/masters`)
- 永続化されたイベントの一覧表示
- 作成・更新履歴の確認
- アクティブ/非アクティブの状態表示

## 注意事項

### 後方互換性
- 既存の `events` と `participants` テーブルはそのまま利用可能
- 新しい機能は追加のテーブルで実装
- 既存コードへの影響を最小限に抑制

### セキュリティ
- 管理画面は既存の管理者認証を使用
- X APIの認証情報は環境変数で管理
- データベース接続はSSL対応

### パフォーマンス
- ユーザー情報は認証時にのみ更新
- データベースインデックスの適切な設定
- 不要なデータの自動削除は行わない（履歴保持優先）

## トラブルシューティング

### X認証が失敗する場合
1. `TWITTER_CLIENT_ID` と `TWITTER_CLIENT_SECRET` の確認
2. Twitter Developer Portal のCallback URL設定を確認
3. OAuth 2.0 が有効になっているか確認

### データベースエラーの場合
1. `DATABASE_URL` の接続文字列を確認
2. データベースサーバーの起動状態を確認
3. SSL設定が適切か確認（本番環境では必須）

### ビルドエラーの場合
```bash
# キャッシュクリアして再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```