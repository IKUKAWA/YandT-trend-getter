import { NextRequest, NextResponse } from 'next/server'
import { CategoryAnalyzer } from '@/lib/analysis/category-analyzer'
import { Platform } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform | null

    const analyzer = new CategoryAnalyzer()
    const relationAnalysis = await analyzer.analyzeCategoryRelations(platform || undefined)

    const response = {
      status: 'success',
      data: {
        ...relationAnalysis,
        summary: {
          totalCategories: Object.keys(relationAnalysis.relationMatrix).length,
          strongRelations: relationAnalysis.strongRelations.length,
          clusters: relationAnalysis.clusters.length,
          platform: platform || 'all',
        },
        networkAnalysis: generateNetworkAnalysis(relationAnalysis),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Category relations API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

function generateNetworkAnalysis(analysis: any): any {
  const { relationMatrix, strongRelations, clusters } = analysis

  // ネットワーク中心性の計算
  const centrality = calculateCentrality(relationMatrix)
  
  // 最も影響力のあるカテゴリ
  const influentialCategories = Object.entries(centrality)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([category, score]) => ({ category, centralityScore: score }))

  // クラスター分析
  const clusterAnalysis = clusters.map((cluster: any) => ({
    ...cluster,
    size: cluster.categories.length,
    dominantCategory: findDominantCategory(cluster.categories, centrality),
  }))

  return {
    networkDensity: strongRelations.length / (Object.keys(relationMatrix).length * 2),
    influentialCategories,
    clusterAnalysis,
    recommendations: generateNetworkRecommendations(influentialCategories, clusterAnalysis),
  }
}

function calculateCentrality(matrix: Record<string, Record<string, number>>): Record<string, number> {
  const centrality: Record<string, number> = {}
  
  for (const category of Object.keys(matrix)) {
    const connections = Object.values(matrix[category] || {})
    centrality[category] = connections.reduce((sum, score) => sum + score, 0) / connections.length || 0
  }

  return centrality
}

function findDominantCategory(categories: string[], centrality: Record<string, number>): string {
  return categories.reduce((dominant, category) => 
    (centrality[category] || 0) > (centrality[dominant] || 0) ? category : dominant
  )
}

function generateNetworkRecommendations(influential: any[], clusters: any[]): string[] {
  const recommendations = []

  if (influential.length > 0) {
    recommendations.push(`${influential[0].category}を中心としたコンテンツ戦略の構築`)
  }

  if (clusters.length > 0) {
    const largestCluster = clusters.reduce((largest, cluster) => 
      cluster.size > largest.size ? cluster : largest
    )
    recommendations.push(`${largestCluster.dominantCategory}クラスターでのクロスプロモーション`)
  }

  recommendations.push('高い関連性を持つカテゴリ間での協業コンテンツ制作')
  
  return recommendations
}