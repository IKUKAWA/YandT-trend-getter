import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatDate } from '@/lib/utils'
import { ExternalLink, Eye, Heart, MessageCircle } from 'lucide-react'

interface TrendCardProps {
  title: string
  platform: 'YOUTUBE' | 'TIKTOK'
  views: bigint | number
  likes: number
  comments: number
  category?: string
  hashtags: string[]
  collectedAt: Date | string
  videoId: string
}

export function TrendCard({
  title,
  platform,
  views,
  likes,
  comments,
  category,
  hashtags,
  collectedAt,
  videoId,
}: TrendCardProps) {
  const platformColors = {
    YOUTUBE: 'bg-red-500',
    TIKTOK: 'bg-black',
  }

  const platformLinks = {
    YOUTUBE: `https://youtube.com/watch?v=${videoId}`,
    TIKTOK: `https://tiktok.com/@user/video/${videoId}`,
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${platformColors[platform]}`} />
              <span className="text-sm font-medium text-gray-600">{platform}</span>
              {category && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {category}
                </span>
              )}
            </div>
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {title}
            </CardTitle>
          </div>
          <a
            href={platformLinks[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>{formatNumber(views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={16} />
            <span>{formatNumber(likes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{formatNumber(comments)}</span>
          </div>
        </div>
        
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {hashtags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{hashtags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {formatDate(collectedAt)}
        </div>
      </CardContent>
    </Card>
  )
}