import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendCard } from './TrendCard'
import { TrendChart } from './TrendChart'
import { BarChart3, TrendingUp, Eye, Calendar } from 'lucide-react'

interface DashboardProps {
  youtubeData: Array<{
    id: string
    title: string
    videoId: string
    views: bigint | null
    likes: number | null
    comments: number | null
    category?: string | null
    hashtags: string[]
    collectedAt: Date
  }>
  tiktokData: Array<{
    id: string
    title: string
    videoId: string
    views: bigint | null
    likes: number | null
    comments: number | null
    category?: string | null
    hashtags: string[]
    collectedAt: Date
  }>
  chartData: Array<{
    category: string
    youtube: number
    tiktok: number
  }>
  stats: {
    totalViews: bigint
    totalVideos: number
    topCategory: string
    weekNumber: number
  }
}

export function Dashboard({ youtubeData, tiktokData, chartData, stats }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            トレンド分析ダッシュボード
          </h1>
          <p className="text-gray-600">
            YouTubeとTikTokの最新トレンドデータを分析
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総再生数</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(Number(stats.totalViews) / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                今週の累計
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">動画数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                収集済み動画
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">トップカテゴリ</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topCategory}</div>
              <p className="text-xs text-muted-foreground">
                最も人気
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">週</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">第{stats.weekNumber}週</div>
              <p className="text-xs text-muted-foreground">
                2025年
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別トレンド</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={chartData} type="bar" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>プラットフォーム比較</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={chartData} type="pie" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              🎥 YouTube トレンド
            </h2>
            <div className="space-y-4">
              {youtubeData.slice(0, 5).map((video) => (
                <TrendCard
                  key={video.id}
                  title={video.title}
                  platform="YOUTUBE"
                  views={video.views || BigInt(0)}
                  likes={video.likes || 0}
                  comments={video.comments || 0}
                  category={video.category || undefined}
                  hashtags={video.hashtags}
                  collectedAt={video.collectedAt}
                  videoId={video.videoId}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              🎵 TikTok トレンド
            </h2>
            <div className="space-y-4">
              {tiktokData.slice(0, 5).map((video) => (
                <TrendCard
                  key={video.id}
                  title={video.title}
                  platform="TIKTOK"
                  views={video.views || BigInt(0)}
                  likes={video.likes || 0}
                  comments={video.comments || 0}
                  category={video.category || undefined}
                  hashtags={video.hashtags}
                  collectedAt={video.collectedAt}
                  videoId={video.videoId}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}