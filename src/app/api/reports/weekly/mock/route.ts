import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getWeek, getYear } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    const week = getWeek(now)
    const year = getYear(now)

    // 週間トレンドデータを取得
    const trends = await prisma.trendData.findMany({
      where: {
        weekNumber: week,
        year: year,
      },
      orderBy: {
        views: 'desc'
      },
      take: 10
    })

    // モック記事生成
    const mockArticle = {
      title: `${year}年第${week}週 YouTube & TikTok トレンド分析レポート`,
      content: `# ${year}年第${week}週 トレンド分析レポート

## 📊 今週のハイライト

今週（${year}年第${week}週）は${trends.length}件のトレンドコンテンツが収集されました。

### 主要トレンド

**1. エンターテイメント分野の台頭**
${trends.filter(t => t.category === 'Entertainment').length}件のエンタメコンテンツがランキング上位を占めています。

**2. 音楽・ゲーム分野の安定した人気**
- 音楽: ${trends.filter(t => t.category === 'Music').length}件
- ゲーム: ${trends.filter(t => t.category === 'Gaming').length}件

### 注目コンテンツ

${trends.slice(0, 3).map((trend, index) => `
**${index + 1}. ${trend.title}**
- プラットフォーム: ${trend.platform}
- 視聴数: ${Number(trend.views).toLocaleString()}回
- カテゴリ: ${trend.category}
`).join('')}

## 🎯 プラットフォーム分析

### YouTube
- 総動画数: ${trends.filter(t => t.platform === 'YOUTUBE').length}件
- 主要カテゴリ: エンタメ、ゲーム、音楽

### TikTok
- 総動画数: ${trends.filter(t => t.platform === 'TIKTOK').length}件
- 特徴: ダンス、ペット、料理系コンテンツが人気

## 📈 今後の展望

今週のトレンドから、以下の傾向が読み取れます：

1. **エンタメコンテンツの多様化**
2. **ショート動画フォーマットの定着**
3. **日本独自コンテンツの国際的注目**

## まとめ

${year}年第${week}週は、特にエンターテイメント分野で多くの話題作が生まれました。クリエイターにとって、この動向を参考にしたコンテンツ制作が効果的と考えられます。

---
*このレポートは自動生成されました*`,
      summary: `${year}年第${week}週のYouTube・TikTokトレンド分析。エンタメ${trends.filter(t => t.category === 'Entertainment').length}件、ゲーム${trends.filter(t => t.category === 'Gaming').length}件が上位にランクイン。`,
      articleType: 'WEEKLY' as const,
      platforms: ['YOUTUBE', 'TIKTOK'] as const,
      status: 'PUBLISHED' as const,
      metadata: {
        week,
        year,
        trendsAnalyzed: trends.length,
        generatedAt: now.toISOString(),
        mockGeneration: true
      }
    }

    // データベースに保存
    const article = await prisma.aIArticle.create({
      data: mockArticle
    })

    return NextResponse.json({
      status: 'success',
      message: 'Mock weekly report generated successfully',
      data: {
        articleId: article.id,
        title: article.title,
        trendsAnalyzed: trends.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mock weekly report generation error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to generate mock weekly report',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}