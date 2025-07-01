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
  Sparkles
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
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
}

export function TranscriptionChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'こんにちは！動画や音声ファイルの文字起こしをお手伝いします。YouTubeやTikTokのURLを貼り付けるか、ファイルをアップロードしてください。',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() && !isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Process with API
    try {
      if (input.includes('youtube.com') || input.includes('tiktok.com')) {
        const assistantResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'URLを検出しました。動画の文字起こしを開始します...',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantResponse])

        // Call transcription API
        const response = await fetch('/api/transcription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input, action: 'transcribe' })
        })

        const data = await response.json()

        if (data.success) {
          const transcriptionMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'assistant',
            content: '文字起こしが完了しました！以下が動画の内容です：',
            timestamp: new Date(),
            transcription: {
              text: data.transcription.text,
              duration: data.transcription.duration,
              language: data.transcription.language
            }
          }
          setMessages(prev => [...prev, transcriptionMessage])

          // Analyze transcription
          const analysisResponse = await fetch('/api/transcription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'analyze', 
              transcriptionText: data.transcription.text 
            })
          })

          const analysisData = await analysisResponse.json()
          
          if (analysisData.success) {
            const analysisMessage: Message = {
              id: (Date.now() + 3).toString(),
              type: 'assistant',
              content: '📊 分析結果:\n\n' + analysisData.analysis,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, analysisMessage])
          }
        }
      } else {
        const assistantResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '動画のURLまたはファイルをアップロードしてください。対応形式：YouTube、TikTok、MP4、MP3、WAV',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantResponse])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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

    // Process file with API
    try {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'ファイルを受信しました。文字起こしを開始します...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantResponse])

      // In a real implementation, we would upload the file to the server
      // For now, we'll simulate with the API
      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileContent: file.name, 
          action: 'transcribe' 
        })
      })

      const data = await response.json()

      if (data.success) {
        const transcriptionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: '文字起こしが完了しました！',
          timestamp: new Date(),
          transcription: {
            text: data.transcription.text,
            duration: data.transcription.duration,
            language: data.transcription.language
          }
        }
        setMessages(prev => [...prev, transcriptionMessage])

        // Analyze transcription
        const analysisResponse = await fetch('/api/transcription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'analyze', 
            transcriptionText: data.transcription.text 
          })
        })

        const analysisData = await analysisResponse.json()
        
        if (analysisData.success) {
          const analysisMessage: Message = {
            id: (Date.now() + 3).toString(),
            type: 'assistant',
            content: '📊 分析結果:\n\n' + analysisData.analysis,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, analysisMessage])
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'ファイル処理中にエラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files).catch(console.error)
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const exportTranscription = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] glass-card overflow-hidden">
      {/* Header */}
      <div className="neo-card p-6 border-b border-neo-light/10">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-full">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-neo-pink to-neo-purple bg-clip-text text-transparent">
              AI文字起こしアシスタント
            </h2>
            <p className="text-sm text-gray-500">動画や音声を高精度でテキストに変換</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4"
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
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="neo-button p-2 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`p-4 rounded-2xl ${
                  message.type === 'user' 
                    ? 'neo-gradient text-white' 
                    : 'neo-card'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.attachments?.map((attachment, idx) => (
                    <div key={idx} className="mt-2 flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4" />
                      <span>{attachment.name || attachment.url}</span>
                    </div>
                  ))}
                  
                  {message.transcription && (
                    <div className="mt-4 p-4 bg-neo-light/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-neo-yellow" />
                          <span className="text-xs text-gray-500">
                            {message.transcription.duration}秒 • {message.transcription.language?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(message.transcription!.text, message.id)}
                            className="neo-button p-2 rounded-lg hover:scale-105 transition-transform"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4 text-neo-green" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => exportTranscription(message.transcription!.text)}
                            className="neo-button p-2 rounded-lg hover:scale-105 transition-transform"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{message.transcription.text}</p>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 block px-2">
                  {message.timestamp.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              {message.type === 'user' && (
                <div className="neo-button p-2 rounded-full">
                  <User className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="neo-button p-2 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div className="neo-card p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">処理中...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neo-dark/50 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="neo-card p-8 rounded-2xl flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-neo-blue" />
              <p className="text-lg font-medium">ファイルをドロップしてアップロード</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="neo-card p-4 border-t border-neo-light/10">
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files).catch(console.error)}
            accept="video/*,audio/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="neo-button p-3 rounded-xl hover:scale-105 transition-transform"
            disabled={isLoading}
          >
            <Upload className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="YouTubeやTikTokのURLを貼り付け..."
            className="flex-1 px-4 py-3 neo-card rounded-xl focus:outline-none focus:ring-2 focus:ring-neo-purple/50"
            disabled={isLoading}
          />
          
          <button
            onClick={handleSendMessage}
            className="neo-gradient p-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 text-white"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            <span>YouTube</span>
          </div>
          <div className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            <span>TikTok</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>MP4/MP3/WAV</span>
          </div>
          <div className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            <span>URLペースト対応</span>
          </div>
        </div>
      </div>
    </div>
  )
}