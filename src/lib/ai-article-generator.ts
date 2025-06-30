import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './db'
import { Platform, ArticleType, ArticleStatus } from '@prisma/client'
import { format, getWeek, getMonth, getYear } from 'date-fns'
import { ja } from 'date-fns/locale'

export class AIArticleGenerator {
  private anthropic: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }

    this.anthropic = new Anthropic({
      apiKey,
    })
  }

  async generateWeeklyReport(weekNumber: number, year: number): Promise<string> {
    console.log(`📝 Generating weekly report for Week ${weekNumber}, ${year}`)

    const youtubeData = await prisma.trendData.findMany({
      where: {
        platform: Platform.YOUTUBE,
        weekNumber,
        year,
      },
      orderBy: { views: 'desc' },
      take: 10,
    })

    const tiktokData = await prisma.trendData.findMany({
      where: {
        platform: Platform.TIKTOK,
        weekNumber,
        year,
      },
      orderBy: { views: 'desc' },
      take: 10,
    })

    const prompt = this.createWeeklyReportPrompt(youtubeData, tiktokData, weekNumber, year)
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude')
      }

      const article = await this.saveArticle({
        title: `${year}年第${weekNumber}週のトレンド分析レポート`,
        content: content.text,
        articleType: ArticleType.WEEKLY,
        platforms: [Platform.YOUTUBE, Platform.TIKTOK],
        metadata: {
          weekNumber,
          year,
          dataCount: {
            youtube: youtubeData.length,
            tiktok: tiktokData.length,
          },
        },
      })

      return article.id
    } catch (error) {
      console.error('Failed to generate weekly report:', error)
      throw error
    }
  }

  async generateMonthlyReport(monthNumber: number, year: number): Promise<string> {
    console.log(`📝 Generating monthly report for ${year}/${monthNumber}`)

    const youtubeData = await prisma.trendData.findMany({
      where: {
        platform: Platform.YOUTUBE,
        monthNumber,
        year,
      },
      orderBy: { views: 'desc' },
      take: 20,
    })

    const tiktokData = await prisma.trendData.findMany({
      where: {
        platform: Platform.TIKTOK,
        monthNumber,
        year,
      },
      orderBy: { views: 'desc' },
      take: 20,
    })

    const prompt = this.createMonthlyReportPrompt(youtubeData, tiktokData, monthNumber, year)
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 5000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude')
      }

      const article = await this.saveArticle({
        title: `${year}年${monthNumber}月のトレンド分析レポート`,
        content: content.text,
        articleType: ArticleType.MONTHLY,
        platforms: [Platform.YOUTUBE, Platform.TIKTOK],
        metadata: {
          monthNumber,
          year,
          dataCount: {
            youtube: youtubeData.length,
            tiktok: tiktokData.length,
          },
        },
      })

      return article.id
    } catch (error) {
      console.error('Failed to generate monthly report:', error)
      throw error
    }
  }

  private createWeeklyReportPrompt(youtubeData: any[], tiktokData: any[], weekNumber: number, year: number): string {
    return `
あなたは専門的なトレンド分析レポートを作成するAIライターです。
以下のデータを基に、${year}年第${weekNumber}週のトレンド分析レポートを作成してください。

## YouTube トレンドデータ（上位10件）
${youtubeData.map((video, index) => `
${index + 1}. ${video.title}
   - 再生数: ${video.views?.toString() || 'N/A'}
   - いいね数: ${video.likes || 'N/A'}
   - カテゴリ: ${video.category || 'N/A'}
   - ハッシュタグ: ${video.hashtags.join(', ')}
`).join('\n')}

## TikTok トレンドデータ（上位10件）
${tiktokData.map((video, index) => `
${index + 1}. ${video.title}
   - 再生数: ${video.views?.toString() || 'N/A'}
   - いいね数: ${video.likes || 'N/A'}
   - カテゴリ: ${video.category || 'N/A'}
   - ハッシュタグ: ${video.hashtags.join(', ')}
`).join('\n')}

## 記事要件
- 文字数: 1500-2000文字
- 構成: 明確な見出し構造
- 内容: 客観的で洞察に富んだ分析
- 文体: 読みやすく専門的
- SEO: 適切なキーワード使用

## 記事構成
# ${year}年第${weekNumber}週のトレンド分析レポート

## 1. 今週のトレンド概要

## 2. YouTubeトレンド分析
### 主要トレンド
### 注目カテゴリ

## 3. TikTokトレンド分析
### 主要トレンド
### バイラルコンテンツの特徴

## 4. プラットフォーム比較
### 共通トレンド
### プラットフォーム固有の特徴

## 5. 今後の展望

## 6. まとめ

上記の構成で、データに基づいた具体的で価値のある分析記事を作成してください。
数値やトレンドの変化に言及し、読者にとって有益な洞察を提供してください。
`
  }

  private createMonthlyReportPrompt(youtubeData: any[], tiktokData: any[], monthNumber: number, year: number): string {
    const monthName = format(new Date(year, monthNumber - 1), 'MMMM', { locale: ja })
    
    return `
あなたは専門的なトレンド分析レポートを作成するAIライターです。
以下のデータを基に、${year}年${monthName}のトレンド分析レポートを作成してください。

## YouTube トレンドデータ（上位20件）
${youtubeData.map((video, index) => `
${index + 1}. ${video.title}
   - 再生数: ${video.views?.toString() || 'N/A'}
   - いいね数: ${video.likes || 'N/A'}
   - カテゴリ: ${video.category || 'N/A'}
   - ハッシュタグ: ${video.hashtags.join(', ')}
`).join('\n')}

## TikTok トレンドデータ（上位20件）
${tiktokData.map((video, index) => `
${index + 1}. ${video.title}
   - 再生数: ${video.views?.toString() || 'N/A'}
   - いいね数: ${video.likes || 'N/A'}
   - カテゴリ: ${video.category || 'N/A'}
   - ハッシュタグ: ${video.hashtags.join(', ')}
`).join('\n')}

## 記事要件
- 文字数: 2500-3000文字
- 構成: 詳細な見出し構造
- 内容: 深い分析と洞察
- 文体: 専門的で読みやすい
- SEO: 月間トレンドキーワード最適化

## 記事構成
# ${year}年${monthName}のトレンド分析レポート

## 1. 月間トレンド総括

## 2. YouTubeトレンド詳細分析
### カテゴリ別トレンド
### 成長率の高いコンテンツ
### 話題のクリエイター

## 3. TikTokトレンド詳細分析
### バイラルハッシュタグ
### 人気コンテンツ形式
### 新興トレンド

## 4. プラットフォーム横断分析
### 共通トピック
### 相互影響関係
### ユーザー行動パターン

## 5. 業界への影響
### マーケティング観点
### コンテンツ戦略への示唆

## 6. 来月の予測

## 7. 総括

上記の構成で、月間の包括的なトレンド分析記事を作成してください。
データドリブンな分析と将来予測を含めて、読者に価値のある洞察を提供してください。
`
  }

  private async saveArticle(data: {
    title: string
    content: string
    articleType: ArticleType
    platforms: Platform[]
    metadata: any
  }) {
    const summary = this.generateSummary(data.content)
    
    return await prisma.aIArticle.create({
      data: {
        title: data.title,
        content: data.content,
        summary,
        articleType: data.articleType,
        platforms: data.platforms,
        metadata: data.metadata,
        status: ArticleStatus.DRAFT,
      },
    })
  }

  private generateSummary(content: string): string {
    const lines = content.split('\n').filter(line => line.trim())
    const firstParagraph = lines.find(line => 
      line.length > 50 && 
      !line.startsWith('#') && 
      !line.startsWith('##')
    )
    
    return firstParagraph?.substring(0, 200) + '...' || '記事の要約が生成されました。'
  }

  async publishArticle(articleId: string): Promise<void> {
    await prisma.aIArticle.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })
  }

  async getArticles(status?: ArticleStatus, limit = 20) {
    return await prisma.aIArticle.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getArticleById(id: string) {
    return await prisma.aIArticle.findUnique({
      where: { id },
    })
  }
}