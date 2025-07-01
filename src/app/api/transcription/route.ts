import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, fileContent, action } = body

    if (!url && !fileContent) {
      return NextResponse.json(
        { error: 'URLまたはファイルコンテンツが必要です' },
        { status: 400 }
      )
    }

    // Mock transcription for demo purposes
    // In production, this would integrate with actual transcription services
    if (action === 'transcribe') {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock transcription based on URL or file type
      let transcriptionResult = {
        text: '',
        duration: 0,
        language: 'ja',
        confidence: 0.95,
        segments: [] as Array<{ start: number; end: number; text: string }>
      }

      if (url?.includes('youtube.com')) {
        transcriptionResult = {
          text: `こんにちは、今日は最新のAI技術トレンドについて解説していきます。

2024年は生成AIの飛躍的な進化の年となりました。特に注目すべきは、マルチモーダルAIの発展です。テキスト、画像、音声、動画を統合的に処理できるAIモデルが次々と登場し、私たちの創造的な作業を大きく変革しています。

まず第一に、動画生成AIの進化について見ていきましょう。従来は静止画の生成が中心でしたが、現在では高品質な動画コンテンツをAIが自動生成できるようになりました。これにより、コンテンツクリエイターの制作プロセスが大幅に効率化されています。

次に、AIアシスタントの進化です。対話型AIは単なる質問応答を超えて、複雑なタスクの実行や創造的な問題解決をサポートするパートナーへと進化しています。コーディング、デザイン、音楽制作など、様々な分野でAIとの協働が進んでいます。

最後に、今後の展望について触れたいと思います。2025年に向けて、AIはより人間らしい理解力と創造性を獲得していくでしょう。私たちはAIと共に新しい価値を生み出す時代に突入しています。

ご視聴ありがとうございました。チャンネル登録といいねボタンをお願いします！`,
          duration: 245,
          language: 'ja',
          confidence: 0.98,
          segments: [
            { start: 0, end: 15, text: 'こんにちは、今日は最新のAI技術トレンドについて解説していきます。' },
            { start: 15, end: 45, text: '2024年は生成AIの飛躍的な進化の年となりました。特に注目すべきは、マルチモーダルAIの発展です。' },
            { start: 45, end: 80, text: 'テキスト、画像、音声、動画を統合的に処理できるAIモデルが次々と登場し、私たちの創造的な作業を大きく変革しています。' },
            { start: 80, end: 120, text: 'まず第一に、動画生成AIの進化について見ていきましょう。' },
            { start: 120, end: 160, text: '従来は静止画の生成が中心でしたが、現在では高品質な動画コンテンツをAIが自動生成できるようになりました。' },
            { start: 160, end: 195, text: '次に、AIアシスタントの進化です。対話型AIは単なる質問応答を超えて、複雑なタスクの実行や創造的な問題解決をサポートするパートナーへと進化しています。' },
            { start: 195, end: 230, text: '最後に、今後の展望について触れたいと思います。2025年に向けて、AIはより人間らしい理解力と創造性を獲得していくでしょう。' },
            { start: 230, end: 245, text: 'ご視聴ありがとうございました。チャンネル登録といいねボタンをお願いします！' }
          ]
        }
      } else if (url?.includes('tiktok.com')) {
        transcriptionResult = {
          text: `みんな〜！今日は超簡単なライフハックを紹介するよ！

スマホのバッテリーを長持ちさせる裏技知ってる？実は画面の明るさを自動調整にして、使わないアプリの通知をオフにするだけで、バッテリー持ちが30%もアップするんだって！

あと、充電は20%から80%の間でキープするのがベスト。100%まで充電しちゃうとバッテリーの劣化が早まっちゃうから気をつけて！

この動画が役に立ったらフォローといいねお願い！次回も便利な情報シェアするね〜！`,
          duration: 45,
          language: 'ja',
          confidence: 0.96,
          segments: [
            { start: 0, end: 8, text: 'みんな〜！今日は超簡単なライフハックを紹介するよ！' },
            { start: 8, end: 20, text: 'スマホのバッテリーを長持ちさせる裏技知ってる？' },
            { start: 20, end: 35, text: '実は画面の明るさを自動調整にして、使わないアプリの通知をオフにするだけで、バッテリー持ちが30%もアップするんだって！' },
            { start: 35, end: 45, text: 'この動画が役に立ったらフォローといいねお願い！' }
          ]
        }
      } else {
        transcriptionResult = {
          text: `この音声ファイルの内容を文字起こししました。

本日は、プロジェクトの進捗について報告させていただきます。第一四半期の目標は全て達成され、売上は前年同期比で120%の成長を記録しました。

特に新規顧客の獲得が好調で、マーケティング施策の効果が現れています。今後も継続的な成長を目指して、チーム一丸となって取り組んでまいります。

詳細なデータについては、配布資料をご確認ください。ご質問がございましたら、お気軽にお申し付けください。`,
          duration: 90,
          language: 'ja',
          confidence: 0.94,
          segments: [
            { start: 0, end: 20, text: '本日は、プロジェクトの進捗について報告させていただきます。' },
            { start: 20, end: 45, text: '第一四半期の目標は全て達成され、売上は前年同期比で120%の成長を記録しました。' },
            { start: 45, end: 70, text: '特に新規顧客の獲得が好調で、マーケティング施策の効果が現れています。' },
            { start: 70, end: 90, text: '詳細なデータについては、配布資料をご確認ください。' }
          ]
        }
      }

      return NextResponse.json({
        success: true,
        transcription: transcriptionResult,
        processingTime: '2.3s',
        metadata: {
          source: url || 'uploaded_file',
          timestamp: new Date().toISOString()
        }
      })
    }

    // Handle AI-powered analysis of transcription
    if (action === 'analyze' && body.transcriptionText) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `以下の文字起こしテキストを分析して、主要なポイント、トピック、感情分析、要約を日本語で提供してください：

${body.transcriptionText}

以下の形式で回答してください：
1. 要約（3-5文）
2. 主要トピック（箇条書き）
3. 感情分析（ポジティブ/ニュートラル/ネガティブと理由）
4. キーワード（5-10個）
5. 改善提案（もしあれば）`
            }
          ]
        })

        return NextResponse.json({
          success: true,
          analysis: message.content[0].type === 'text' ? message.content[0].text : '',
          model: 'claude-3-5-sonnet-20241022'
        })
      } catch (aiError) {
        console.error('AI analysis error:', aiError)
        
        // Fallback mock analysis
        return NextResponse.json({
          success: true,
          analysis: `## 文字起こし分析結果

### 1. 要約
提供されたコンテンツは、技術的なトピックまたは日常的な情報を扱っています。明確な構造を持ち、視聴者に有益な情報を提供することを目的としています。

### 2. 主要トピック
- メインテーマの説明
- 具体的な例や手順
- 実践的なアドバイス
- 今後の展望

### 3. 感情分析
**ポジティブ** - 前向きで建設的なトーンで情報を提供し、視聴者の関心を引く内容となっています。

### 4. キーワード
技術, トレンド, 解説, 実践, 効果, 改善, 最新, 情報, アドバイス, 展望

### 5. 改善提案
- より具体的な数値やデータを含めることで信頼性を高める
- 視覚的な要素（図表やグラフ）を追加して理解を深める
- 関連リンクや参考資料を提供する`,
          model: 'mock-fallback'
        })
      }
    }

    return NextResponse.json(
      { error: '無効なアクションです' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Transcription API error:', error)
    return NextResponse.json(
      { error: '文字起こし処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}