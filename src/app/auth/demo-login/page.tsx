'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Header from '@/components/Header'

export default function DemoLoginPage() {
  const [selectedUser, setSelectedUser] = useState('')

  const demoUsers = [
    {
      id: '12345678',
      name: '田中太郎',
      username: 'tanaka_taro',
      image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=田'
    },
    {
      id: '87654321',
      name: '鈴木花子',
      username: 'suzuki_hanako',
      image: 'https://via.placeholder.com/64x64/EC4899/FFFFFF?text=鈴'
    },
    {
      id: '11223344',
      name: '山田次郎',
      username: 'yamada_jiro',
      image: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=山'
    }
  ]

  const handleDemoLogin = async () => {
    if (!selectedUser) {
      alert('ユーザーを選択してください')
      return
    }

    const user = demoUsers.find(u => u.id === selectedUser)
    if (user) {
      // Next.jsではクライアント側で直接セッションを作成できないため、
      // 実際のX認証を促すメッセージを表示
      alert(`${user.name}としてログインするには、実際のX認証が必要です。`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="cnp-card p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              テスト用ログイン
            </h1>
            
            <p className="text-gray-600 mb-6 text-center">
              参加機能をテストするためのデモログインです
            </p>
            
            <div className="space-y-4">
              {demoUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="demoUser"
                    value={user.id}
                    checked={selectedUser === user.id}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="text-cnp-blue"
                  />
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={handleDemoLogin}
                disabled={!selectedUser}
                className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg disabled:opacity-50 cursor-not-allowed"
              >
                デモログイン（機能停止中）
              </button>
              
              <div className="text-center">
                <span className="text-gray-500">または</span>
              </div>
              
              <button
                onClick={() => signIn('twitter', { callbackUrl: '/' })}
                className="w-full bg-cnp-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                実際にXでログインする
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong> 参加機能をテストするには、実際のX認証が必要です。上のボタンからX認証を行ってください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}