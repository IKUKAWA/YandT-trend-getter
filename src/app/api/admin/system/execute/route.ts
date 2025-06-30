import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DataCollector } from '@/lib/data-collector'
import { TrendPredictor } from '@/lib/predictions/trend-predictor'
import { CategoryAnalyzer } from '@/lib/analysis/category-analyzer'

export async function POST(request: NextRequest) {
  try {
    const { operationId } = await request.json()
    
    if (!operationId) {
      return NextResponse.json(
        { success: false, error: 'Operation ID is required' },
        { status: 400 }
      )
    }

    const result = await executeOperation(operationId)
    
    return NextResponse.json({
      success: true,
      operationId,
      result
    })
  } catch (error) {
    console.error('Operation execution error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function executeOperation(operationId: string) {
  switch (operationId) {
    case 'data-collection':
      return await executeDataCollection()
    
    case 'ai-analysis':
      return await executeAiAnalysis()
    
    case 'database-cleanup':
      return await executeDatabaseCleanup()
    
    case 'cache-refresh':
      return await executeCacheRefresh()
    
    case 'backup-create':
      return await executeBackupCreation()
    
    default:
      throw new Error(`Unknown operation: ${operationId}`)
  }
}

async function executeDataCollection() {
  try {
    const collector = new DataCollector()
    
    // YouTube データ収集
    const youtubeData = await collector.collectYouTubeData()
    
    // TikTok データ収集
    const tiktokData = await collector.collectTikTokData()
    
    // X データ収集（新機能）
    const xTrends = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/x/trends?q=トレンド&limit=50`)
    const xData = xTrends.ok ? await xTrends.json() : { data: [] }
    
    // Instagram データ収集（新機能）
    const instagramTrends = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/trends?hashtag=インスタ映え&limit=25`)
    const instagramData = instagramTrends.ok ? await instagramTrends.json() : { data: [] }
    
    return {
      youtube_collected: youtubeData.length,
      tiktok_collected: tiktokData.length,
      x_collected: xData.data?.length || 0,
      instagram_collected: instagramData.data?.length || 0,
      total_collected: youtubeData.length + tiktokData.length + (xData.data?.length || 0) + (instagramData.data?.length || 0),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Data collection error:', error)
    throw error
  }
}

async function executeAiAnalysis() {
  try {
    const predictor = new TrendPredictor()
    const categoryAnalyzer = new CategoryAnalyzer()
    
    // 週次予測実行
    const weeklyPredictions = await predictor.predictWeeklyTrends('all')
    
    // 月次予測実行
    const monthlyPredictions = await predictor.predictMonthlyTrends('all')
    
    // カテゴリ分析実行
    const emergingCategories = await categoryAnalyzer.detectEmergingCategories()
    
    // カテゴリ関係性分析
    const categoryRelations = await categoryAnalyzer.analyzeCategoryRelationships()
    
    return {
      weekly_predictions: weeklyPredictions.predictions.length,
      monthly_predictions: monthlyPredictions.predictions.length,
      emerging_categories: emergingCategories.length,
      category_relations: categoryRelations.relationships.length,
      confidence_score: (weeklyPredictions.confidence + monthlyPredictions.confidence) / 2,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    throw error
  }
}

async function executeDatabaseCleanup() {
  try {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - 3) // 3ヶ月前のデータを削除
    
    // 古いトレンドデータを削除
    const deletedTrends = await db.trendData.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })
    
    // 古い予測データを削除
    const deletedPredictions = await db.prediction.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })
    
    // 古い通知を削除
    const deletedNotifications = await db.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })
    
    return {
      deleted_trends: deletedTrends.count,
      deleted_predictions: deletedPredictions.count,
      deleted_notifications: deletedNotifications.count,
      cutoff_date: cutoffDate.toISOString(),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Database cleanup error:', error)
    throw error
  }
}

async function executeCacheRefresh() {
  try {
    // Next.js のキャッシュを無効化
    // 実際の実装では revalidateTag や revalidatePath を使用
    
    // API キャッシュをクリア（模擬）
    const cacheEntries = [
      '/api/trends/weekly',
      '/api/trends/monthly',
      '/api/predictions/weekly',
      '/api/predictions/monthly',
      '/api/categories/emerging',
      '/api/categories/relations'
    ]
    
    // 各エンドポイントにリクエストして強制更新
    const refreshResults = await Promise.allSettled(
      cacheEntries.map(async (endpoint) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}?refresh=true`)
        return { endpoint, success: response.ok }
      })
    )
    
    const successCount = refreshResults.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length
    
    return {
      cache_entries_refreshed: successCount,
      total_cache_entries: cacheEntries.length,
      refresh_results: refreshResults.map(result => 
        result.status === 'fulfilled' ? result.value : { error: 'Failed' }
      ),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Cache refresh error:', error)
    throw error
  }
}

async function executeBackupCreation() {
  try {
    // データベースの統計情報を取得
    const trendCount = await db.trendData.count()
    const predictionCount = await db.prediction.count()
    const notificationCount = await db.notification.count()
    
    // 実際のバックアップ作成（模擬）
    // 本来であれば pg_dump やその他のバックアップツールを使用
    
    const backupInfo = {
      backup_id: `backup_${Date.now()}`,
      total_trends: trendCount,
      total_predictions: predictionCount,
      total_notifications: notificationCount,
      total_records: trendCount + predictionCount + notificationCount,
      backup_size_mb: Math.floor(Math.random() * 100) + 50, // 模擬サイズ
      backup_location: `/backups/backup_${Date.now()}.sql`,
      timestamp: new Date().toISOString()
    }
    
    // バックアップメタデータをデータベースに保存（オプション）
    // await db.backupLog.create({ data: backupInfo })
    
    return backupInfo
  } catch (error) {
    console.error('Backup creation error:', error)
    throw error
  }
}