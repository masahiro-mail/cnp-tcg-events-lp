# VS Code Tunnel セットアップ手順

## スマートフォンからのアクセス設定

### 1. GitHubアカウントでの認証
1. ブラウザで以下のURLにアクセス：
   ```
   https://github.com/login/device
   ```

2. デバイスコードを入力：
   ```
   8EBC-7727
   ```

3. GitHubアカウントでログインし、VS Code Tunnelのアクセスを許可

### 2. トンネル開始
認証完了後、以下のコマンドでトンネルを開始：

```bash
cd "H:\マイドライブ\20250731_ClaudeCode\20250804_CNPTCGMtgLP"
code tunnel --name cnp-tcg-dev
```

### 3. スマートフォンアクセス ✅ 修正完了
以下のリンクをスマートフォンのブラウザで開いてください：
```
https://vscode.dev/tunnel/cnp-tcg-workspace/H:/%E3%83%9E%E3%82%A4%E3%83%89%E3%83%A9%E3%82%A4%E3%83%96/20250731_ClaudeCode/20250804_CNPTCGMtgLP
```

🔧 **ワークスペース問題を修正:**
- トンネル名を `cnp-tcg-workspace` に変更
- プロジェクトフォルダが正しく認識される構成に修正

このリンクから以下が可能です：
- 📱 スマートフォンのブラウザで完全なVS Code環境
- 📝 ファイルの編集・作成・削除
- 💻 ターミナルでのコマンド実行
- 🔧 VS Code拡張機能の利用

### 4. 代替方法：VS Code Web
GitHubに認証済みの場合：
```
https://github.dev/[your-username]/[repository-name]
```

## 注意事項
- GitHubアカウントでの認証が必要
- インターネット接続が必要
- VS Code Tunnelは継続的にバックグラウンドで実行される