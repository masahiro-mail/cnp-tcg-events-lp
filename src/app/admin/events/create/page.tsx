'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EventForm from '@/components/EventForm'
import { CreateEventData } from '@/types/database'

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateEventData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: error || 'イベントの作成に失敗しました' }
      }

      const result = await response.json()
      
      // 作成成功時は管理画面に戻る
      router.push('/admin?success=event-created')
      return { success: true }
    } catch (error) {
      console.error('Event creation error:', error)
      return { success: false, error: 'ネットワークエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="cnp-card p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">新しいイベントを作成</h1>
              <p className="text-gray-600">
                CNPトレカ交流会の情報を入力して、新しいイベントを作成しましょう。
              </p>
            </div>

            <EventForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}