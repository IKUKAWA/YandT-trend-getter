/**
 * ΨtrendAI - AI Provider Management System
 * 複数のAIプロバイダーを統一的に管理するためのコンフィギュレーション
 */

import { Brain, Zap, Sparkles, TrendingUp } from 'lucide-react'

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'deepseek'
export type ProcessingMode = 'chat' | 'transcription' | 'analysis' | 'ideas'

export interface AIProviderConfig {
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
  costPerToken: number
  strengths: string[]
  limitations: string[]
  bestUseCases: ProcessingMode[]
  maxTokens: number
  supportedFeatures: {
    textGeneration: boolean
    codeGeneration: boolean
    imageAnalysis: boolean
    audioProcessing: boolean
    realTimeProcessing: boolean
    multimodal: boolean
  }
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  claude: {
    name: 'Claude (Anthropic)',
    icon: Brain,
    color: 'text-orange-500',
    description: '高度な分析と創造的なコンテンツ生成に最適。安全性と正確性を重視。',
    costPerToken: 0.003,
    strengths: ['高度な分析力', '創造的思考', '安全性', '長文理解', '日本語対応'],
    limitations: ['リアルタイム処理制限', '画像処理制限'],
    bestUseCases: ['analysis', 'transcription', 'ideas'],
    maxTokens: 100000,
    supportedFeatures: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: false,
      audioProcessing: false,
      realTimeProcessing: false,
      multimodal: false
    }
  },
  openai: {
    name: 'GPT-4 (OpenAI)',
    icon: Zap,
    color: 'text-green-500',
    description: '汎用的なタスクと会話に優れた性能。多様なタスクに対応可能。',
    costPerToken: 0.03,
    strengths: ['汎用性', '会話能力', '多様なタスク', 'コード生成', 'プラグイン対応'],
    limitations: ['コスト', '知識カットオフ', 'ハルシネーション'],
    bestUseCases: ['chat', 'transcription', 'ideas'],
    maxTokens: 8192,
    supportedFeatures: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: true,
      audioProcessing: true,
      realTimeProcessing: false,
      multimodal: true
    }
  },
  gemini: {
    name: 'Gemini (Google)',
    icon: Sparkles,
    color: 'text-blue-500',
    description: 'マルチモーダルとリアルタイム処理が得意。Googleエコシステム統合。',
    costPerToken: 0.001,
    strengths: ['マルチモーダル', '高速処理', 'コスト効率', 'Google連携', 'リアルタイム'],
    limitations: ['新しいAPI', '日本語精度', '複雑な推論'],
    bestUseCases: ['chat', 'analysis'],
    maxTokens: 30000,
    supportedFeatures: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: true,
      audioProcessing: true,
      realTimeProcessing: true,
      multimodal: true
    }
  },
  deepseek: {
    name: 'DeepSeek',
    icon: TrendingUp,
    color: 'text-purple-500',
    description: 'コスト効率が良く実用的なソリューション。高い性能とコストパフォーマンス。',
    costPerToken: 0.0001,
    strengths: ['コスト効率', '実用性', '安定性', '高性能', '大容量処理'],
    limitations: ['新興プロバイダー', '日本語対応', 'エコシステム'],
    bestUseCases: ['analysis', 'transcription'],
    maxTokens: 64000,
    supportedFeatures: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: false,
      audioProcessing: false,
      realTimeProcessing: false,
      multimodal: false
    }
  }
}

// モード別の推奨プロバイダー
export const RECOMMENDED_PROVIDERS: Record<ProcessingMode, AIProvider[]> = {
  chat: ['openai', 'claude', 'gemini', 'deepseek'],
  transcription: ['claude', 'deepseek', 'openai', 'gemini'],
  analysis: ['claude', 'deepseek', 'gemini', 'openai'],
  ideas: ['claude', 'openai', 'gemini', 'deepseek']
}

// プロバイダー選択の自動最適化
export function getOptimalProvider(
  mode: ProcessingMode,
  priorityFactor: 'cost' | 'quality' | 'speed' = 'quality'
): AIProvider {
  const candidates = RECOMMENDED_PROVIDERS[mode]
  
  switch (priorityFactor) {
    case 'cost':
      // コスト重視：DeepSeek → Gemini → Claude → OpenAI
      return candidates.find(p => ['deepseek', 'gemini', 'claude', 'openai'].includes(p)) || 'deepseek'
    case 'speed':
      // 速度重視：Gemini → DeepSeek → OpenAI → Claude
      return candidates.find(p => ['gemini', 'deepseek', 'openai', 'claude'].includes(p)) || 'gemini'
    case 'quality':
    default:
      // 品質重視：Claude → OpenAI → Gemini → DeepSeek
      return candidates.find(p => ['claude', 'openai', 'gemini', 'deepseek'].includes(p)) || 'claude'
  }
}

// プロバイダーの可用性チェック
export function checkProviderAvailability(provider: AIProvider): boolean {
  const envKeys = {
    claude: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY'
  }
  
  return Boolean(process.env[envKeys[provider]])
}

// 利用可能なプロバイダーの一覧を取得
export function getAvailableProviders(): AIProvider[] {
  return Object.keys(AI_PROVIDERS).filter(provider => 
    checkProviderAvailability(provider as AIProvider)
  ) as AIProvider[]
}

// コスト計算
export function calculateCost(provider: AIProvider, tokenCount: number): number {
  const config = AI_PROVIDERS[provider]
  return (tokenCount / 1000) * config.costPerToken
}

// プロバイダーの比較情報
export function compareProviders(providers: AIProvider[]) {
  return providers.map(provider => {
    const config = AI_PROVIDERS[provider]
    return {
      provider,
      name: config.name,
      costPerToken: config.costPerToken,
      strengths: config.strengths,
      bestUseCases: config.bestUseCases,
      available: checkProviderAvailability(provider)
    }
  })
}

// フォールバック戦略
export function getFallbackProvider(primaryProvider: AIProvider, mode: ProcessingMode): AIProvider | null {
  const availableProviders = getAvailableProviders()
  const recommended = RECOMMENDED_PROVIDERS[mode]
  
  // プライマリ以外で利用可能な推奨プロバイダーを探す
  const fallback = recommended.find(p => 
    p !== primaryProvider && availableProviders.includes(p)
  )
  
  return fallback || null
}

// モード別システムプロンプト
export const SYSTEM_PROMPTS: Record<ProcessingMode, string> = {
  chat: `あなたはΨtrendAI、トレンド分析に特化したAIアシスタントです。
クリエイターのコンテンツ制作を支援し、以下の能力を持っています：
- 最新トレンドの分析と解説
- コンテンツアイデアの提案
- 動画・音声の分析
- プラットフォーム別最適化提案
常に親しみやすく、実用的で具体的な回答を心がけてください。日本語で回答してください。`,

  transcription: `あなたはΨtrendAIの文字起こし分析専門家です。
文字起こし結果から以下の分析を行います：
1. 内容の要約（3-5文で簡潔に）
2. 主要トピックの抽出（箇条書きで5つまで）
3. 感情分析（ポジティブ/ニュートラル/ネガティブ）
4. 重要キーワードの抽出（10個まで）
5. コンテンツ改善提案（3つまで）
分析は構造化され、実用的である必要があります。すべて日本語で回答してください。`,

  analysis: `あなたはΨtrendAIのトレンド分析専門家です。
与えられたキーワードやトピックについて以下の分析を提供します：
- 現在のトレンド状況と背景
- 成長予測（短期1-2週間、長期1-3ヶ月）
- 関連キーワードと周辺話題
- プラットフォーム別の動向分析
- クリエイター向けの具体的活用提案
データドリブンで具体的な分析を日本語で提供してください。`,

  ideas: `あなたはΨtrendAIのコンテンツアイデア生成専門家です。
以下の観点から具体的なアイデアを提案します：
- 現在のトレンドを活用した企画
- プラットフォーム別の最適化（YouTube/TikTok/Instagram）
- ターゲット層に響く内容構成
- 実現可能性と必要リソースの考慮
- 他との差別化要素の組み込み
5-10個の具体的で実践的なアイデアを日本語で提案してください。`
}

// エラーハンドリング用のメッセージ
export const ERROR_MESSAGES = {
  apiKeyMissing: (provider: string) => `${provider}のAPIキーが設定されていません。`,
  apiCallFailed: (provider: string) => `${provider}のAPI呼び出しに失敗しました。`,
  quotaExceeded: (provider: string) => `${provider}のAPIクォータを超過しました。`,
  noAvailableProvider: '利用可能なAIプロバイダーがありません。',
  fallbackActivated: (primary: string, fallback: string) => 
    `${primary}が利用できないため、${fallback}に切り替えました。`
}