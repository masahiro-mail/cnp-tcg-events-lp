'use client'

import { useState } from 'react'
import { Event, CreateEventData } from '@/types/database'

interface EventFormProps {
  event?: Event
  initialData?: Event
  onSubmit: (data: CreateEventData) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
}

const AREAS = [
  '-',
  'オンライン',
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄',
  'その他'
]

const AREA_PREFECTURES: { [key: string]: string[] } = {
  '-': ['-'],
  'オンライン': ['ー'],
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
  'その他': ['ー']
}

const getAllPrefectures = () => {
  return Object.values(AREA_PREFECTURES).flat()
}

export default function EventForm({ event, initialData, onSubmit, onCancel }: EventFormProps) {
  const eventData = initialData || event
  const [formData, setFormData] = useState<CreateEventData>({
    name: eventData?.name || '',
    event_date: eventData?.event_date || '',
    start_time: eventData?.start_time || '',
    end_time: eventData?.end_time || '',
    organizer: eventData?.organizer || '',
    area: eventData?.area || AREAS[0],
    prefecture: eventData?.prefecture || AREA_PREFECTURES[eventData?.area || AREAS[0]][0],
    venue_name: eventData?.venue_name || '',
    address: eventData?.address || '',
    url: eventData?.url || '',
    description: eventData?.description || '',
    announcement_url: eventData?.announcement_url || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 必須フィールドのバリデーション
    const requiredFields: { [key: string]: string } = {
      name: 'イベント名',
      event_date: '開催日',
      start_time: '開始時刻',
      organizer: '企画者',
      area: 'エリア',
      prefecture: '都道府県',
      venue_name: '会場名',
      address: '住所'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData[field as keyof CreateEventData] as string
      if (!value || value.trim() === '') {
        setError(`${label}は必須項目です`)
        setIsLoading(false)
        return
      }
    }

    // エリアのバリデーション
    if (formData.area === '-') {
      setError('エリアを選択してください')
      setIsLoading(false)
      return
    }

    const result = await onSubmit(formData)
    
    if (!result.success) {
      setError(result.error || '保存に失敗しました')
    }
    
    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'area') {
      // エリアが変更されたら都道府県を自動で最初のものに設定
      const newPrefecture = AREA_PREFECTURES[value][0]
      setFormData({
        ...formData,
        area: value,
        prefecture: newPrefecture,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  return (
    <div className="cnp-card max-w-2xl w-full max-h-screen overflow-y-auto p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {eventData ? 'イベントを編集' : '新しいイベントを作成'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              イベント名 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="第3回 CNPトレカ東京交流会"
              required
            />
          </div>

          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
              企画者 *
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="CNP運営事務局"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                開催日 *
              </label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                開始時刻 *
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                required
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                終了時刻 *
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="announcement_url" className="block text-sm font-medium text-gray-700 mb-1">
                告知URL（任意）
              </label>
              <input
                type="url"
                id="announcement_url"
                name="announcement_url"
                value={formData.announcement_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                placeholder="https://example.com/event"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                エリア *
              </label>
              <select
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                required
              >
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
                都道府県 *
              </label>
              <select
                id="prefecture"
                name="prefecture"
                value={formData.prefecture}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                required
              >
                {AREA_PREFECTURES[formData.area].map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
              会場名 *
            </label>
            <input
              type="text"
              id="venue_name"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="渋谷ヒカリエ ホールA"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              住所 *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="東京都渋谷区渋谷2-21-1"
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              会場URL（任意）
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="https://example.com/event"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              詳細説明（任意）
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="初心者歓迎！CNPトレーディングカードを持参してお越しください。交換やバトルを楽しみましょう。"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="cnp-button-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  保存中...
                </div>
              ) : (
                eventData ? '更新' : '作成'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cnp-button-secondary flex-1"
            >
              キャンセル
            </button>
          </div>
        </form>
    </div>
  )
}