import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ArticleStatus, ArticleType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ArticleStatus | null
    const type = searchParams.get('type') as ArticleType | null
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const offset = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(type && { articleType: type }),
    }

    const [articles, total] = await Promise.all([
      prisma.aIArticle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.aIArticle.count({ where }),
    ])

    return NextResponse.json({
      status: 'success',
      data: {
        articles: articles.map(article => ({
          id: article.id,
          title: article.title,
          summary: article.summary,
          articleType: article.articleType,
          platforms: article.platforms,
          status: article.status,
          publishedAt: article.publishedAt,
          createdAt: article.createdAt,
          metadata: article.metadata,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Articles API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}