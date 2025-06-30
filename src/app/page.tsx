import { Dashboard } from '@/components/Dashboard'
import { prisma } from '@/lib/db'
import { Platform } from '@prisma/client'
import { getWeek, getYear } from 'date-fns'

async function getDashboardData() {
  const now = new Date()
  const weekNumber = getWeek(now)
  const year = getYear(now)

  try {
    const [youtubeData, tiktokData] = await Promise.all([
      prisma.trendData.findMany({
        where: {
          platform: Platform.YOUTUBE,
          weekNumber,
          year,
        },
        orderBy: { views: 'desc' },
        take: 10,
      }),
      prisma.trendData.findMany({
        where: {
          platform: Platform.TIKTOK,
          weekNumber,
          year,
        },
        orderBy: { views: 'desc' },
        take: 10,
      }),
    ])

    const categoryData = getCategoryChartData([...youtubeData, ...tiktokData])
    
    const stats = {
      totalViews: [...youtubeData, ...tiktokData].reduce(
        (sum, item) => sum + BigInt(item.views || 0),
        BigInt(0)
      ),
      totalVideos: youtubeData.length + tiktokData.length,
      topCategory: getTopCategory([...youtubeData, ...tiktokData]),
      weekNumber,
    }

    return {
      youtubeData,
      tiktokData,
      chartData: categoryData,
      stats,
    }
  } catch (error) {
    console.error('Dashboard data error:', error)
    
    return {
      youtubeData: [],
      tiktokData: [],
      chartData: [],
      stats: {
        totalViews: BigInt(0),
        totalVideos: 0,
        topCategory: 'N/A',
        weekNumber,
      },
    }
  }
}

function getCategoryChartData(data: any[]) {
  const categoryData: Record<string, { youtube: number; tiktok: number }> = {}
  
  data.forEach(item => {
    if (item.category) {
      if (!categoryData[item.category]) {
        categoryData[item.category] = { youtube: 0, tiktok: 0 }
      }
      
      if (item.platform === 'YOUTUBE') {
        categoryData[item.category].youtube += Number(item.views || 0)
      } else {
        categoryData[item.category].tiktok += Number(item.views || 0)
      }
    }
  })
  
  return Object.entries(categoryData)
    .map(([category, data]) => ({
      category,
      youtube: Math.round(data.youtube / 1000000),
      tiktok: Math.round(data.tiktok / 1000000),
    }))
    .sort((a, b) => (b.youtube + b.tiktok) - (a.youtube + a.tiktok))
    .slice(0, 8)
}

function getTopCategory(data: any[]): string {
  const categoryCount: Record<string, number> = {}
  
  data.forEach(item => {
    if (item.category) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    }
  })
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Entertainment'
}

export default async function Home() {
  const dashboardData = await getDashboardData()
  
  return <Dashboard {...dashboardData} />
}