'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Upload, 
  FileText, 
  Mic, 
  Video, 
  Link,
  Download,
  Copy,
  Check,
  Loader2,
  Bot,
  User,
  Sparkles,
  Settings,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  MessageSquare,
  ChevronDown
} from 'lucide-react'

// AI Provider types
type AIProvider = 'claude' | 'openai' | 'gemini' | 'deepseek'

interface AIProviderConfig {
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
  costPerToken: number
  strengths: string[]
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  aiProvider?: AIProvider
  attachments?: {
    type: 'file' | 'url'
    name?: string
    url?: string
  }[]
  transcription?: {
    text: string
    duration?: number
    language?: string
  }
  analysis?: {
    summary: string
    topics: string[]
    sentiment: string
    keywords: string[]
    suggestions: string[]
  }
}

// AI Provider configurations
const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  claude: {
    name: 'Claude (Anthropic)',
    icon: Brain,
    color: 'text-orange-500',
    description: '高度な分析と創造的なコンテンツ生成に最適',
    costPerToken: 0.003,
    strengths: ['分析力', '創造性', '安全性']
  },
  openai: {
    name: 'GPT-4 (OpenAI)',
    icon: Zap,
    color: 'text-green-500',
    description: '汎用的なタスクと会話に優れた性能',
    costPerToken: 0.03,
    strengths: ['汎用性', '会話能力', '多様性']
  },
  gemini: {
    name: 'Gemini (Google)',
    icon: Sparkles,
    color: 'text-blue-500',
    description: 'マルチモーダルとリアルタイム処理が得意',
    costPerToken: 0.001,
    strengths: ['マルチモーダル', '速度', 'コスト効率']
  },
  deepseek: {
    name: 'DeepSeek',
    icon: TrendingUp,
    color: 'text-purple-500',
    description: 'コスト効率が良く実用的なソリューション',
    costPerToken: 0.0001,
    strengths: ['コスト効率', '実用性', '安定性']
  }
}

export function PsiTrendAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'ΨtrendAIへようこそ！🔮✨\n\n私はトレンド分析に特化したAIアシスタントです。以下の機能でクリエイターをサポートします：\n\n🎬 **動画・音声の文字起こし** - YouTube、TikTok、音声ファイルから正確な文字起こし\n📊 **トレンド分析** - リアルタイムトレンドの詳細分析と予測\n💡 **コンテンツアイデア生成** - ジャンル別最適化されたアイデア提案\n🤖 **マルチAI分析** - Claude、GPT-4、Gemini、DeepSeekを用途別に最適選択\n\n何をお手伝いしましょうか？',
      timestamp: new Date(),
      aiProvider: 'claude'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedAI, setSelectedAI] = useState<AIProvider>('claude')
  const [showAISelector, setShowAISelector] = useState(false)
  const [mode, setMode] = useState<'chat' | 'transcription' | 'analysis' | 'ideas'>('chat')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && mode === 'chat') return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 選択されたAIプロバイダーに基づいて適切なAPIを呼び出し
      const response = await callAIProvider(selectedAI, input, mode)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        aiProvider: selectedAI,
        analysis: response.analysis
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI API Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '申し訳ございません。処理中にエラーが発生しました。別のAIプロバイダーをお試しください。',
        timestamp: new Date(),
        aiProvider: selectedAI
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const callAIProvider = async (provider: AIProvider, prompt: string, currentMode: string) => {
    // AI API呼び出しロジック
    const response = await fetch('/api/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        prompt,
        mode: currentMode
      })
    })

    if (!response.ok) {
      throw new Error('AI API call failed')
    }

    return await response.json()
  }

  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `ファイルをアップロードしました: ${file.name}`,
      timestamp: new Date(),
      attachments: [{
        type: 'file',
        name: file.name
      }]
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('provider', selectedAI)
      formData.append('mode', mode)

      const response = await fetch('/api/ai/transcription', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.message || '文字起こしが完了しました！',
        timestamp: new Date(),
        aiProvider: selectedAI,
        transcription: result.transcription,
        analysis: result.analysis
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadTranscription = (content: string, filename?: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `transcription-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* ヘッダー - AI選択とモード切替 */}
      <div className="neo-card p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ΨtrendAI
            </h1>
          </div>
          
          {/* AI プロバイダー選択 */}
          <div className="relative">
            <motion.button
              onClick={() => setShowAISelector(!showAISelector)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {React.createElement(AI_PROVIDERS[selectedAI].icon, {
                className: `w-4 h-4 ${AI_PROVIDERS[selectedAI].color}`
              })}
              <span className="text-sm font-medium">{AI_PROVIDERS[selectedAI].name}</span>
              <ChevronDown className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showAISelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  {Object.entries(AI_PROVIDERS).map(([key, config]) => (
                    <motion.button
                      key={key}
                      onClick={() => {
                        setSelectedAI(key as AIProvider)
                        setShowAISelector(false)
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        selectedAI === key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-3">
                        {React.createElement(config.icon, {
                          className: `w-5 h-5 ${config.color} mt-0.5`
                        })}
                        <div className="flex-1">
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {config.description}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {config.strengths.map((strength, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                              >
                                {strength}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            コスト: ${config.costPerToken}/1K tokens
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* モード選択タブ */}
        <div className="flex gap-2">
          {[
            { key: 'chat', label: '対話', icon: MessageSquare },
            { key: 'transcription', label: '文字起こし', icon: Mic },
            { key: 'analysis', label: 'トレンド分析', icon: BarChart3 },
            { key: 'ideas', label: 'アイデア生成', icon: Sparkles }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setMode(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mode === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {React.createElement(tab.icon, { className: 'w-4 h-4' })}
              <span className="text-sm font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* メッセージエリア */}
      <div 
        className={`flex-1 p-4 overflow-y-auto space-y-4 ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* アバター */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : message.aiProvider 
                    ? `bg-gradient-to-r from-${AI_PROVIDERS[message.aiProvider].color.split('-')[1]}-400 to-${AI_PROVIDERS[message.aiProvider].color.split('-')[1]}-600 text-white`
                    : 'bg-purple-500 text-white'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  message.aiProvider ? 
                    React.createElement(AI_PROVIDERS[message.aiProvider].icon, { className: 'w-4 h-4' }) :
                    <Bot className="w-4 h-4" />
                )}
              </div>

              {/* メッセージ内容 */}
              <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}>
                  {message.aiProvider && message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                      {React.createElement(AI_PROVIDERS[message.aiProvider].icon, {
                        className: `w-3 h-3 ${AI_PROVIDERS[message.aiProvider].color}`
                      })}
                      <span>{AI_PROVIDERS[message.aiProvider].name}</span>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* 添付ファイル表示 */}
                  {message.attachments && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {attachment.type === 'file' ? <FileText className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                          <span className="text-sm">{attachment.name || attachment.url}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 文字起こし結果 */}
                  {message.transcription && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          文字起こし結果
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(message.transcription!.text, message.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => downloadTranscription(message.transcription!.text)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm mb-2">
                        {message.transcription.duration && (
                          <span className="text-gray-500">
                            時間: {Math.floor(message.transcription.duration / 60)}:{(message.transcription.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                        {message.transcription.language && (
                          <span className="text-gray-500 ml-4">言語: {message.transcription.language}</span>
                        )}
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded text-sm">
                        {message.transcription.text}
                      </div>
                    </div>
                  )}

                  {/* AI分析結果 */}
                  {message.analysis && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="font-semibold mb-2">📝 要約</h5>
                        <p className="text-sm">{message.analysis.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h5 className="font-semibold mb-2">🎯 トピック</h5>
                          <ul className="text-sm space-y-1">
                            {message.analysis.topics.map((topic, index) => (
                              <li key={index}>• {topic}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h5 className="font-semibold mb-2">🔑 キーワード</h5>
                          <div className="flex flex-wrap gap-1">
                            {message.analysis.keywords.map((keyword, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded-full text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h5 className="font-semibold mb-2">💡 改善提案</h5>
                        <ul className="text-sm space-y-1">
                          {message.analysis.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI分析中...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'transcription' ? 'YouTube/TikTokのURLを入力、またはファイルをドロップ...' :
                mode === 'analysis' ? 'トレンド分析したいキーワードやトピックを入力...' :
                mode === 'ideas' ? 'アイデアが欲しいジャンルやテーマを入力...' :
                'メッセージを入力...'
              }
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
          
          <motion.button
            type="submit"
            disabled={isLoading || (!input.trim() && mode === 'chat')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*,.mp3,.wav,.mp4,.mov,.avi"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-50"
        >
          <div className="text-center">
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-600 font-semibold">ファイルをドロップして分析開始</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}