'use client'

import { useState } from 'react'

export default function AdminSetupPage() {
  const [password, setPassword] = useState('')
  const [hash, setHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateHash = async () => {
    if (!password.trim()) {
      alert('パスワードを入力してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/hash-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const data = await response.json()
        setHash(data.hash)
      } else {
        alert('ハッシュ生成に失敗しました')
      }
    } catch (error) {
      console.error('Hash generation error:', error)
      alert('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash).then(() => {
      alert('ハッシュをクリップボードにコピーしました！')
    }).catch(() => {
      alert('コピーに失敗しました')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="cnp-card max-w-2xl w-full p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者パスワード設定</h1>
          <p className="text-gray-600">
            管理者パスワードのハッシュを生成して、Railway環境変数に設定します
          </p>
        </div>

        <div className="space-y-6">
          {/* パスワード入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              管理者パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cnp-blue focus:border-cnp-blue"
              placeholder="secure-password-123"
            />
          </div>

          {/* ハッシュ生成ボタン */}
          <button
            onClick={generateHash}
            disabled={isLoading}
            className="w-full cnp-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>生成中...</span>
              </div>
            ) : (
              'ハッシュを生成'
            )}
          </button>

          {/* 生成されたハッシュ */}
          {hash && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成されたハッシュ
                </label>
                <div className="relative">
                  <textarea
                    value={hash}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                  >
                    コピー
                  </button>
                </div>
              </div>

              {/* 設定手順 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Railway設定手順:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Railwayプロジェクトの設定画面を開く</li>
                  <li>2. Variables タブに移動</li>
                  <li>3. 新しい環境変数を追加:</li>
                  <li className="ml-4">
                    <strong>Name:</strong> ADMIN_PASSWORD_HASH<br/>
                    <strong>Value:</strong> (上記のハッシュをペースト)
                  </li>
                  <li>4. Save を押してデプロイを待つ</li>
                </ol>
              </div>

              {/* テストリンク */}
              <div className="text-center">
                <a
                  href="/admin"
                  className="cnp-button-secondary"
                >
                  管理画面でテスト
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}