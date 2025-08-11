'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cnp-card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月11日</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 個人情報の収集について</h2>
              <p className="text-gray-700 mb-4">
                当サービス「CNPトレカ交流会」では、X（旧Twitter）認証を通じて以下の個人情報を収集いたします：
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Xユーザー ID</li>
                <li>Xユーザー名</li>
                <li>Xプロフィール画像URL</li>
                <li>サービス利用履歴（イベント参加情報）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 個人情報の利用目的</h2>
              <p className="text-gray-700 mb-4">収集した個人情報は以下の目的で利用いたします：</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>ユーザー認証・識別</li>
                <li>イベント参加者管理</li>
                <li>サービス提供・改善</li>
                <li>不正利用防止</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 個人情報の第三者提供</h2>
              <p className="text-gray-700 mb-4">
                当サービスでは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 個人情報の保管・管理</h2>
              <p className="text-gray-700 mb-4">
                個人情報は適切なセキュリティ対策のもと、必要な期間のみ保管いたします。SSL暗号化通信により情報を保護しています。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie・ローカルストレージについて</h2>
              <p className="text-gray-700 mb-4">
                当サービスではユーザー認証のためにCookieを使用しています。これらは認証状態の維持のために必要です。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 個人情報の開示・削除</h2>
              <p className="text-gray-700 mb-4">
                ユーザーご本人から個人情報の開示・修正・削除をご希望の場合は、お問い合わせフォームよりご連絡ください。
                適切な本人確認後、法令に従い対応いたします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 mb-4">
                本プライバシーポリシーは法令の変更等により改定する場合があります。
                重要な変更がある場合は、サービス内で事前にお知らせいたします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. お問い合わせ</h2>
              <p className="text-gray-700">
                本プライバシーポリシーに関するお問い合わせは、サービス内のお問い合わせフォームまたは
                運営者までお寄せください。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}