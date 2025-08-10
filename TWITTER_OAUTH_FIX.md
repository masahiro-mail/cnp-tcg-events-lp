# X認証エラー修正ガイド

## 🚨 発生しているエラー
```
アプリにアクセスを許可できません。前に戻ってもう一度ログインしてください。
Failed to load resource: the server responded with a status of 400 ()
```

## 🔍 原因
1. **Callback URLの不一致**: ポート3000 → 3001変更に伴う設定ずれ
2. **OAuth 2.0設定不備**: Twitter Developer Portal側の設定問題

## 🛠️ 修正手順

### ステップ1: Twitter Developer Portalにアクセス
1. [Twitter Developer Portal](https://developer.twitter.com/) にログイン
2. 作成済みのアプリを選択
3. "Settings" タブに移動

### ステップ2: User authentication settings を更新
1. "User authentication settings" の "Edit" をクリック
2. 以下の設定を **正確に** 確認・修正:

```
App permissions: Read ✅
Type of App: Web App, Automated App or Bot ✅

App info:
  Callback URI: http://localhost:3001/api/auth/callback/twitter
  Website URL: http://localhost:3001
  Terms of service: http://localhost:3001 (任意)
  Privacy policy: http://localhost:3001 (任意)
```

⚠️ **重要**: 
- "OAuth 1.0a" は無効にして、"OAuth 2.0" のみ有効にする
- Callback URIは完全一致が必要（スラッシュの有無、https/httpも正確に）

### ステップ3: OAuth 2.0設定の確認
1. "Keys and tokens" タブに移動
2. "OAuth 2.0 Client ID and Client Secret" セクションで確認
3. Client ID が一致しているか確認: `SExhb1ZFUU5IOTRkamlVS3RKMzA6MTpjaQ`

### ステップ4: App permissionsの詳細設定
OAuth 2.0で正しく動作するための権限設定:
```
Read: ✅ (必須)
Write: ❌ (不要)
Direct Messages: ❌ (不要)
```

### ステップ5: 設定保存後の確認
1. すべての変更を "Save" で保存
2. 数分待機（設定反映のため）
3. 開発サーバーを再起動

## 🔄 ローカル環境での再起動
```bash
# 開発サーバーを停止 (Ctrl+C)
# 再起動
npm run dev
```

## 🧪 テスト手順
1. http://localhost:3001/auth/signin にアクセス
2. 「Xでログイン」をクリック
3. Twitter認証画面に正常に遷移することを確認
4. 認証後、ホームページにリダイレクトされることを確認

## 🔍 トラブルシューティング

### エラー: "Invalid redirect URI"
➜ Callback URIが正確に設定されているか確認
```
正しい設定: http://localhost:3001/api/auth/callback/twitter
```

### エラー: "Client authentication failed"
➜ Client IDとSecretが正しく設定されているか確認
```
TWITTER_CLIENT_ID=SExhb1ZFUU5IOTRkamlVS3RKMzA6MTpjaQ
TWITTER_CLIENT_SECRET=ShjOxxL-UYflby4xlMwKNVmQYiNu3ohlY82i30kx-r03BtqnJI
```

### エラー: "App suspended"
➜ Twitter Developer Portalでアプリのステータスを確認

## 📋 設定確認チェックリスト
- [ ] Callback URI: `http://localhost:3001/api/auth/callback/twitter`
- [ ] Website URL: `http://localhost:3001`
- [ ] App permissions: Read のみ有効
- [ ] Type of App: Web App 選択済み
- [ ] Client ID: 環境変数と一致
- [ ] 設定保存済み
- [ ] 開発サーバー再起動済み

## 💡 重要なポイント
1. **正確なURL**: `http://` から始まり、ポート番号も正確に
2. **設定反映時間**: Twitter側で数分かかる場合があります
3. **キャッシュクリア**: ブラウザのキャッシュクリアも試してください

設定修正後、X認証が正常に動作するはずです。