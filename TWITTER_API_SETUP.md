# Twitter API設定ガイド

## 1. Twitter Developer Portalでアプリを作成

### ステップ1: Developer Portalにアクセス
1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. Xアカウントでログイン
3. "Sign up for the API"をクリック（初回の場合）

### ステップ2: アプリケーションを作成
1. "Create an App"をクリック
2. アプリ名を入力: `CNPトレカ交流会`
3. アプリの説明を入力: `CNPトレカイベントの参加者認証用`

### ステップ3: OAuth 2.0設定
1. アプリの設定画面で"Settings"タブに移動
2. "User authentication settings"をクリック
3. 以下の設定を行う:

```
App permissions: Read
Type of App: Web App
Callback URLs: http://localhost:3000/api/auth/callback/twitter
Website URL: http://localhost:3000
```

### ステップ4: APIキーを取得
1. "Keys and tokens"タブに移動
2. "OAuth 2.0 Client ID and Client Secret"セクションを確認
3. 以下の情報をコピー:
   - Client ID
   - Client Secret

## 2. 環境変数の設定

`.env.local`ファイルを以下のように更新:

```env
# Twitter OAuth - 取得した実際の値に置き換え
TWITTER_CLIENT_ID=your-actual-client-id-here
TWITTER_CLIENT_SECRET=your-actual-client-secret-here

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-key-here-make-it-long-and-random
```

### NEXTAUTH_SECRETの生成
安全なランダムキーを生成:

```bash
# オンラインツールを使用
# https://generate-secret.vercel.app/32

# または手動で32文字以上のランダム文字列を作成
```

## 3. 本番環境での設定

### Railway/Vercel等での環境変数
```env
TWITTER_CLIENT_ID=your-actual-client-id
TWITTER_CLIENT_SECRET=your-actual-client-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key
```

### 本番用Callback URL
Twitter Developer Portalで追加のCallback URLを設定:
```
https://your-domain.com/api/auth/callback/twitter
```

## 4. セキュリティ設定

### Client Secretの保護
- 絶対にGitにコミットしない
- 本番環境では環境変数で管理
- 定期的にローテーション

### App permissions
- **Read**: ユーザーの基本情報のみ
- **Write**: 投稿権限（不要）
- **Direct Messages**: DM権限（不要）

## 5. トラブルシューティング

### よくあるエラー

**1. "Invalid redirect URI"**
- Callback URLが正確に設定されているか確認
- http://localhost:3000/api/auth/callback/twitter

**2. "Invalid client"**
- Client IDが正しく設定されているか確認
- .env.localファイルが正しく読み込まれているか

**3. "Authorization denied"**
- アプリのpermissions設定を確認
- Xアカウントでアプリの利用を許可しているか

### デバッグ方法
```bash
# 環境変数の確認
echo $TWITTER_CLIENT_ID
echo $NEXTAUTH_URL

# Next.jsサーバーのログを確認
npm run dev
```

## 6. テスト手順

1. `.env.local`に正しいAPIキーを設定
2. Next.jsサーバーを再起動: `npm run dev`
3. http://localhost:3000/auth/signin にアクセス
4. "Xでログイン"をクリック
5. Twitter認証画面に遷移することを確認
6. 認証後、ホームページにリダイレクトされることを確認

## 7. 完了確認

✅ Twitter Developer Portalでアプリ作成完了
✅ OAuth 2.0設定完了
✅ APIキーを`.env.local`に設定
✅ Callback URL設定完了
✅ NextAuth.jsでX認証が動作

これで完全なX認証が機能します！