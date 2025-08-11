'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cnp-card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月11日</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. サービス概要</h2>
              <p className="text-gray-700 mb-4">
                「CNPトレカ交流会」（以下「本サービス」）は、CNPトレーディングカードに関するイベント情報を提供し、
                参加者同士の交流を促進することを目的としたサービスです。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 利用規約の同意</h2>
              <p className="text-gray-700 mb-4">
                本サービスをご利用いただく前に、本利用規約および別途定めるプライバシーポリシーに同意いただく必要があります。
                同意いただけない場合は、本サービスをご利用いただけません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. アカウント登録</h2>
              <p className="text-gray-700 mb-4">
                本サービスの利用には、X（旧Twitter）アカウントによる認証が必要です。
                以下に該当する場合、サービスの利用をお断りする場合があります：
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>虚偽の情報によるアカウント登録</li>
                <li>過去に利用停止処分を受けた履歴がある場合</li>
                <li>その他、運営者が不適切と判断した場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 禁止行為</h2>
              <p className="text-gray-700 mb-4">本サービスの利用において、以下の行為を禁止します：</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>法令に違反する行為</li>
                <li>他のユーザーや第三者の権利を侵害する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>虚偽の情報を提供する行為</li>
                <li>営利目的での無断使用</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. イベント参加について</h2>
              <p className="text-gray-700 mb-4">
                本サービスで表示されるイベント情報は、各イベント主催者により提供されています。
                参加申し込みや実際の参加については、各イベントのルールに従ってください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibond text-gray-900 mb-4">6. 免責事項</h2>
              <p className="text-gray-700 mb-4">
                本サービスは現状のまま提供されており、システムの不具合やサービス中断について、
                運営者は一切の責任を負いません。また、本サービスを通じて得られた情報の正確性についても保証いたしません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. サービスの変更・終了</h2>
              <p className="text-gray-700 mb-4">
                運営者は、ユーザーへの事前通知なしに本サービスの内容変更、一時停止、または終了することがあります。
                これにより生じた損害について、運営者は責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 利用規約の変更</h2>
              <p className="text-gray-700 mb-4">
                本利用規約は予告なく変更される場合があります。重要な変更については、
                サービス内またはメール等でお知らせいたします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 準拠法・管轄裁判所</h2>
              <p className="text-gray-700">
                本利用規約は日本法に準拠し、本サービスに関する紛争については、
                東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}