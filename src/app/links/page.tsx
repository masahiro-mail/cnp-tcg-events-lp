import Header from '@/components/Header'
import Link from 'next/link'

export default function LinksPage() {
  const links = [
    {
      title: '公式情報',
      url: 'https://cnptcg.monolithos.co.jp',
      description: 'CNPトレーディングカードの公式情報サイト',
      icon: '🎴'
    },
    {
      title: '公式Notion',
      url: 'https://subsequent-coconut-9a4.notion.site/1466e8d5d57b806190e0f236c7a8776f?v=1466e8d5d57b8103abce000cbb65bb8e',
      description: '公式NotionページでCNPトレカの詳細情報をご確認いただけます',
      icon: '📖'
    },
    {
      title: '公式メルマガ',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdSNzLJE8QixJ8I6xWixWF7IPhD6LxOyXP7Tl5OTZnmC2NcGg/viewform',
      description: '最新情報をメールで受け取れる公式メルマガの登録',
      icon: '📧'
    },
    {
      title: 'PRタイムズ',
      url: 'https://prtimes.jp/main/action.php?run=html&page=searchkey&search_word=CNP',
      description: 'CNPに関する最新のプレスリリース情報',
      icon: '📰'
    },
    {
      title: 'FAQ（よくある質問）',
      url: 'https://cnptcg.monolithos.co.jp/questions',
      description: 'CNPトレカについてのよくある質問と回答',
      icon: '❓'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              CNPトレカ関連リンク
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              CNPトレーディングカードに関する公式情報やサービスへのリンク集
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cnp-card p-6 hover:shadow-lg transition-all duration-300 block group"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cnp-blue transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {link.description}
                    </p>
                    <div className="mt-3 flex items-center text-cnp-blue text-sm">
                      <span>詳細を見る</span>
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center">
            <Link href="/" className="cnp-button-primary">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}