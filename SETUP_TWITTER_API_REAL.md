# X（Twitter）認証の実際の設定ガイド

## 🎯 目的
実際に動作するX認証システムをローカル環境で構築する

## 📝 手順

### 1. Twitter Developer Portal でアプリを作成

#### ステップ1: アカウント申請
1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. Xアカウントでログイン
3. "Sign up for API access" をクリック
4. 利用目的を記入（例：「CNPトレカイベントの参加者認証システム開発」）
5. 承認まで数日かかる場合があります

#### ステップ2: プロジェクト作成
1. Developer Portal で "Create Project" をクリック
2. プロジェクト名: `CNPトレカ交流会`
3. 用途: `Making a bot` を選択
4. 説明: `CNPトレカイベントの参加者認証とスタンプ機能`

#### ステップ3: アプリ作成
1. "Create an App" をクリック
2. アプリ名: `cnp-tcg-events-local`
3. 環境: `Development`

### 2. OAuth 2.0 設定

#### ステップ1: App permissions
1. アプリの Settings タブに移動
2. "User authentication settings" の "Edit" をクリック
3. 以下を設定:
   ```
   App permissions: Read
   Type of App: Web App, Automated App or Bot
   ```

#### ステップ2: Callback URLs
```
App info:
Callback URI: http://localhost:3001/api/auth/callback/twitter  
Website URL: http://localhost:3001
```

#### ステップ3: OAuth 2.0 Client ID and Secret を取得
1. "Keys and tokens" タブに移動
2. "OAuth 2.0 Client ID and Client Secret" セクション
3. "Generate" をクリックして以下を取得:
   - **Client ID**: `例: VGhpc0lzQW5FeGFtcGxl...`
   - **Client Secret**: `例: VGhpc0lzQW5FeGFtcGxlU2VjcmV0...`

⚠️ **重要**: Client Secret は一度しか表示されないので必ずコピーして保存

### 3. ローカル環境変数の設定

`.env.local` ファイルを以下のように更新:

```env
# Database (SQLite使用)
DATABASE_URL=file:./dev.db

# NextAuth.js
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=cnp-tcg-secret-key-2024-development-12345678901234567890

# Twitter OAuth - 実際の値を設定
TWITTER_CLIENT_ID=取得したClient IDをここに貼り付け
TWITTER_CLIENT_SECRET=取得したClient Secretをここに貼り付け

# Admin Authentication (パスワード: admin123)
ADMIN_PASSWORD_HASH=$2a$10$K7cVqrKzMOyU1.1FvM8Ui.Xb5qA1iVr6HJ2FGp5gE6.3L0R4D4XF2
```

### 4. 動作テスト

#### ステップ1: サーバー再起動
```bash
cd C:\Users\yokoo\Documents\500_WorkSpace\20250804_CNPTCGMtgLP
npm run dev
```

#### ステップ2: 認証テスト
1. http://localhost:3001/auth/signin にアクセス
2. 「Xでログイン」ボタンをクリック
3. Twitter の認証画面に遷移することを確認
4. 認証後、ホームページにリダイレクトされることを確認

#### ステップ3: 機能確認
1. 右上にユーザー情報が表示される
2. `/mypage` にアクセスしてマイページが表示される
3. `/admin/users` でユーザーがデータベースに保存されていることを確認

## 🔧 トラブルシューティング

### よくあるエラー

#### "Invalid redirect URI"
- Twitter Developer Portal の Callback URI が正確に設定されているか確認
- `http://localhost:3000/api/auth/callback/twitter` （正確にコピー）

#### "Invalid client"  
- `.env.local` の TWITTER_CLIENT_ID が正しく設定されているか確認
- 環境変数にスペースが入っていないか確認

#### "Client authentication failed"
- TWITTER_CLIENT_SECRET が正しく設定されているか確認
- Secret が期限切れしていないか確認

### デバッグ方法
```bash
# 環境変数が読み込まれているか確認
echo "Client ID設定済み" # .env.localで確認

# サーバーログでエラーを確認
npm run dev
# ブラウザの開発者ツール > Console でエラー確認
```

## ✅ 確認チェックリスト

設定完了後、以下を確認:

- [ ] Twitter Developer Portal でアプリ作成済み
- [ ] OAuth 2.0 Client ID と Secret を取得済み
- [ ] Callback URI が正しく設定済み
- [ ] `.env.local` に実際の値を設定済み
- [ ] 開発サーバーが正常起動
- [ ] ログインページでエラーが発生しない
- [ ] X認証画面に遷移する
- [ ] 認証後にホームページに戻る
- [ ] ユーザー情報がデータベースに保存される

## 🚀 完了後の状態

**すべて正常に設定されると:**
- 完全に機能するX認証システム
- ユーザー情報の自動永続化  
- スタンプ獲得機能の利用
- 管理画面でのユーザー管理

**注意**: 本番環境デプロイ時は環境変数とCallback URIを本番用に更新する必要があります。