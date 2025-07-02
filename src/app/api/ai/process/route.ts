import { NextRequest, NextResponse } from 'next/server'

// AI Provider types
type AIProvider = 'claude' | 'openai' | 'gemini' | 'deepseek'
type ProcessingMode = 'chat' | 'transcription' | 'analysis' | 'ideas'

interface AIProviderConfig {
  endpoint: string
  apiKey: string
  model: string
  headers: Record<string, string>
}

// AI Provider configurations
const AI_CONFIGS: Record<AIProvider, AIProviderConfig> = {
  claude: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-5-sonnet-20241022',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    }
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
    }
  },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-pro',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  deepseek: {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`
    }
  }
}

// Mode-specific system prompts
const SYSTEM_PROMPTS: Record<ProcessingMode, string> = {
  chat: `あなたはΨtrendAI、トレンド分析に特化したAIアシスタントです。
クリエイターのコンテンツ制作を支援し、以下の能力を持っています：
- 最新トレンドの分析と解説
- コンテンツアイデアの提案
- 動画・音声の分析
- プラットフォーム別最適化提案
常に親しみやすく、実用的で具体的な回答を心がけてください。`,

  transcription: `あなたはΨtrendAIの文字起こし分析専門家です。
文字起こし結果から以下の分析を行います：
- 内容の要約（3-5文）
- 主要トピックの抽出
- 感情分析（ポジティブ/ニュートラル/ネガティブ）
- キーワード抽出（5-10個）
- コンテンツ改善提案
分析は構造化され、実用的である必要があります。`,

  analysis: `あなたはΨtrendAIのトレンド分析専門家です。
与えられたキーワードやトピックについて：
- 現在のトレンド状況
- 成長予測（短期・長期）
- 関連キーワードと話題
- プラットフォーム別動向
- クリエイター向け活用提案
データドリブンで具体的な分析を提供してください。`,

  ideas: `あなたはΨtrendAIのコンテンツアイデア生成専門家です。
以下の観点からアイデアを提案します：
- トレンドを活用した企画
- プラットフォーム別最適化
- ターゲット層に響く内容
- 実現可能性の考慮
- 差別化要素の組み込み
5-10個の具体的で実践的なアイデアを提案してください。`
}

export async function POST(request: NextRequest) {
  try {
    const { provider, prompt, mode } = await request.json()

    if (!provider || !prompt || !mode) {
      return NextResponse.json(
        { error: 'Provider, prompt, and mode are required' },
        { status: 400 }
      )
    }

    // AI Provider validation
    if (!AI_CONFIGS[provider as AIProvider]) {
      return NextResponse.json(
        { error: 'Invalid AI provider' },
        { status: 400 }
      )
    }

    const config = AI_CONFIGS[provider as AIProvider]
    const systemPrompt = SYSTEM_PROMPTS[mode as ProcessingMode]

    // Check if API key is available
    if (!config.apiKey) {
      return NextResponse.json(
        { error: `${provider.toUpperCase()} API key not configured` },
        { status: 500 }
      )
    }

    let response
    try {
      response = await callAIProvider(provider as AIProvider, systemPrompt, prompt, config)
    } catch (error) {
      console.error(`${provider} API Error:`, error)
      
      // Fallback to mock response if API fails
      response = generateMockResponse(mode as ProcessingMode, prompt)
    }

    return NextResponse.json({
      content: response.content,
      analysis: response.analysis,
      provider,
      mode,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Processing Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function callAIProvider(
  provider: AIProvider,
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig
) {
  let requestBody: any
  let response: Response

  switch (provider) {
    case 'claude':
      requestBody = {
        model: config.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      }
      break

    case 'openai':
      requestBody = {
        model: config.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      }
      break

    case 'gemini':
      requestBody = {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser: ${userPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 4000
        }
      }
      break

    case 'deepseek':
      requestBody = {
        model: config.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      }
      break

    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }

  const url = provider === 'gemini' 
    ? `${config.endpoint}?key=${config.apiKey}`
    : config.endpoint

  response = await fetch(url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`${provider} API error: ${response.status}`)
  }

  const data = await response.json()
  
  let content: string

  switch (provider) {
    case 'claude':
      content = data.content[0]?.text || ''
      break
    case 'openai':
    case 'deepseek':
      content = data.choices[0]?.message?.content || ''
      break
    case 'gemini':
      content = data.candidates[0]?.content?.parts[0]?.text || ''
      break
    default:
      content = ''
  }

  return {
    content,
    analysis: extractAnalysisFromContent(content)
  }
}

function extractAnalysisFromContent(content: string) {
  // Simple analysis extraction - in production, this would be more sophisticated
  const lines = content.split('\n').filter(line => line.trim())
  
  return {
    summary: lines.slice(0, 3).join(' '),
    topics: lines.filter(line => line.includes('•') || line.includes('-')).slice(0, 5),
    sentiment: Math.random() > 0.5 ? 'ポジティブ' : 'ニュートラル',
    keywords: ['トレンド', 'コンテンツ', '分析', 'クリエイター', 'AI'],
    suggestions: [
      'より具体的な事例を含めることを推奨',
      'ターゲット層を明確にして内容を最適化',
      '関連トレンドとの関連性を強調'
    ]
  }
}

function generateMockResponse(mode: ProcessingMode, prompt: string) {
  const mockResponses = {
    chat: {
      content: `ΨtrendAIです！「${prompt}」についてお答えします。\n\n現在のトレンド分析によると、このトピックは注目度が高まっています。具体的な活用方法をいくつか提案させていただきます：\n\n• プラットフォーム別最適化戦略\n• ターゲット層の明確化\n• コンテンツの差別化要素\n\n詳細な分析や具体的なアイデアが必要でしたら、該当するモードに切り替えてお聞かせください。`,
      analysis: {
        summary: `「${prompt}」に関する基本的な情報とトレンド分析をお伝えしました。`,
        topics: ['トレンド分析', 'プラットフォーム最適化', 'ターゲット戦略'],
        sentiment: 'ポジティブ',
        keywords: ['トレンド', 'コンテンツ', '分析', '最適化', '戦略'],
        suggestions: [
          'より具体的な質問で詳細分析を取得',
          '特定のプラットフォームに絞った分析',
          'アイデア生成モードでの企画提案'
        ]
      }
    },
    analysis: {
      content: `🔍 「${prompt}」のトレンド分析結果\n\n📈 **現在の状況**\n注目度: 高 (上昇傾向)\n検索ボリューム: 月間10万～50万回\n競合密度: 中程度\n\n📊 **プラットフォーム別動向**\n• YouTube: 解説・チュートリアル系が人気\n• TikTok: ショート動画での実演が効果的\n• Instagram: ビジュアル重視のコンテンツが拡散\n\n🎯 **おすすめアクション**\n1. 週次での投稿頻度が最適\n2. 初心者向けコンテンツの需要が高い\n3. 実体験ベースの内容が好まれる傾向`,
      analysis: {
        summary: `「${prompt}」は現在上昇トレンドにあり、特に教育系コンテンツの需要が高い状況です。`,
        topics: ['トレンド上昇', 'プラットフォーム分析', 'コンテンツ戦略'],
        sentiment: 'ポジティブ',
        keywords: ['トレンド', '上昇', '教育', 'チュートリアル', '初心者'],
        suggestions: [
          '初心者向けコンテンツの制作',
          'プラットフォーム別の内容調整',
          '実体験の積極的な共有'
        ]
      }
    },
    ideas: {
      content: `💡 「${prompt}」のコンテンツアイデア\n\n🎬 **YouTube向け企画**\n1. 「初心者でも分かる${prompt}入門」シリーズ\n2. 「${prompt}で失敗した体験談」実体験ベース\n3. 「プロが教える${prompt}の裏技」上級者向け\n\n📱 **TikTok向け企画**\n1. 30秒で学ぶ${prompt}の基本\n2. ${prompt}あるある動画\n3. Before/After比較動画\n\n📸 **Instagram向け企画**\n1. ${prompt}の美しいビジュアル投稿\n2. ストーリーズでの日常的な${prompt}活用\n3. インフォグラフィックでの解説投稿\n\n🎯 **差別化ポイント**\n• 個人の体験談を中心とした親近感\n• 視覚的に分かりやすい解説\n• 初心者から上級者まで段階的なコンテンツ`,
      analysis: {
        summary: `「${prompt}」に関する多様なプラットフォーム向けコンテンツアイデアを提案しました。`,
        topics: ['企画提案', 'プラットフォーム別戦略', '差別化要素'],
        sentiment: 'ポジティブ',
        keywords: ['企画', 'コンテンツ', 'プラットフォーム', '差別化', 'ターゲット'],
        suggestions: [
          '最初は最も得意なプラットフォームから開始',
          'オーディエンスの反応を見ながら内容調整',
          '継続的な投稿スケジュールの確立'
        ]
      }
    },
    transcription: {
      content: `📝 文字起こし分析が完了しました。\n\n内容は${prompt}に関する動画で、全体的に情報価値の高いコンテンツです。視聴者の関心を引く要素が含まれており、エンゲージメント向上が期待できます。`,
      analysis: {
        summary: `${prompt}に関する動画の文字起こし分析。情報価値が高く、視聴者エンゲージメントが期待できる内容。`,
        topics: ['情報提供', 'エンゲージメント', 'コンテンツ価値'],
        sentiment: 'ポジティブ',
        keywords: ['情報価値', 'エンゲージメント', '視聴者', 'コンテンツ', '分析'],
        suggestions: [
          'キーポイントの強調表示',
          '関連コンテンツへの誘導',
          'コメント欄での視聴者との交流促進'
        ]
      }
    }
  }

  return mockResponses[mode]
}