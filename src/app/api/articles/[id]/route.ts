import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.aIArticle.findUnique({
      where: { id: params.id },
    })

    if (!article) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Article not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: {
        article: {
          id: article.id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          articleType: article.articleType,
          platforms: article.platforms,
          status: article.status,
          publishedAt: article.publishedAt,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          metadata: article.metadata,
        },
      },
    })
  } catch (error) {
    console.error('Article by ID API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}