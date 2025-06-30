import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getMonth, getYear } from 'date-fns'

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
    const month = getMonth(now) + 1 // getMonth()は0ベースなので+1
    const year = getYear(now)

    // 月間トレンドデータを取得
    const trends = await prisma.trendData.findMany({
      where: {
        monthNumber: month,
        year: year,
      },
      orderBy: {
        views: 'desc'
      },
      take: 20
    })

    // モック月間記事生成
    const mockArticle = {
      title: `${year}年${month}月 YouTube & TikTok 月間トレンド総括レポート`,
      content: `# ${year}年${month}月 月間トレンド総括レポート

## 📊 月間ハイライト

${year}年${month}月は${trends.length}件のトレンドコンテンツが話題となりました。

### 月間トップトレンド

**1. エンターテイメント分野の圧倒的人気**
${trends.filter(t => t.category === 'Entertainment').length}件のエンタメコンテンツが月間ランキングを席巻しています。

**2. 多様なコンテンツジャンルの競争**
- 音楽: ${trends.filter(t => t.category === 'Music').length}件
- ゲーム: ${trends.filter(t => t.category === 'Gaming').length}件
- スポーツ: ${trends.filter(t => t.category === 'Sports').length}件
- アニメ: ${trends.filter(t => t.category === 'Film & Animation').length}件

### 月間注目コンテンツ TOP5

${trends.slice(0, 5).map((trend, index) => `
**${index + 1}. ${trend.title}**
- プラットフォーム: ${trend.platform}
- 視聴数: ${Number(trend.views).toLocaleString()}回
- カテゴリ: ${trend.category}
- 収集日: ${new Date(trend.collectedAt).toLocaleDateString('ja-JP')}
`).join('')}

## 🎯 プラットフォーム詳細分析

### YouTube月間分析
- 総動画数: ${trends.filter(t => t.platform === 'YOUTUBE').length}件
- 主要カテゴリ: エンタメ、ゲーム、音楽、スポーツ
- 特徴: 長時間コンテンツとショート動画の両方で人気

### TikTok月間分析
- 総動画数: ${trends.filter(t => t.platform === 'TIKTOK').length}件
- 主要カテゴリ: ダンス、ペット、料理、ライフスタイル
- 特徴: バイラル性の高いショートコンテンツが中心

## 📈 月間トレンド傾向分析

### 1. コンテンツの多様化
今月は様々なジャンルのコンテンツがバランス良く人気を集めました。

### 2. 季節性の影響
${month}月の季節的特徴がコンテンツ選択に影響を与えています。

### 3. クリエイターの成長
新しいクリエイターの台頭と既存クリエイターの安定した人気が共存しています。

## 🔮 来月の予測

来月（${month === 12 ? 1 : month + 1}月）に向けて：

1. **継続的人気ジャンル**: エンタメ、ゲーム、音楽
2. **注目トピック**: 季節イベント関連コンテンツ
3. **新興トレンド**: AI、テクノロジー関連コンテンツの増加予想

## まとめ

${year}年${month}月は、多様性に富んだコンテンツが特徴的な月でした。プラットフォームを問わず、クリエイターの創造性が存分に発揮された期間と言えるでしょう。

---
*この月間レポートは自動生成されました*`,
      summary: `${year}年${month}月のYouTube・TikTok月間総括分析。エンタメ${trends.filter(t => t.category === 'Entertainment').length}件、ゲーム${trends.filter(t => t.category === 'Gaming').length}件、音楽${trends.filter(t => t.category === 'Music').length}件が上位にランクイン。`,
      articleType: 'MONTHLY' as const,
      platforms: ['YOUTUBE', 'TIKTOK'] as const,
      status: 'PUBLISHED' as const,
      metadata: {
        month,
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
      message: 'Mock monthly report generated successfully',
      data: {
        articleId: article.id,
        title: article.title,
        trendsAnalyzed: trends.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mock monthly report generation error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to generate mock monthly report',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}