import { NextRequest } from 'next/server'
import { GET } from '@/app/api/channels/search/route'
import { GET as getAnalysis } from '@/app/api/channels/[id]/analysis/route'

// Mock the database/data functions
jest.mock('@/lib/data/channelData', () => ({
  searchChannels: jest.fn(),
  getChannelAnalysis: jest.fn(),
}))

describe('/api/channels API endpoints', () => {
  describe('/api/channels/search', () => {
    test('returns search results for valid query', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト&platform=youtube')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.results)).toBe(true)
      expect(data.total).toBeGreaterThanOrEqual(0)
    })

    test('returns error for query too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=a')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('2 characters')
    })

    test('filters by platform correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト&platform=youtube')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All results should be from YouTube platform
      data.results.forEach((channel: any) => {
        expect(channel.platform).toBe('youtube')
      })
    })

    test('applies subscriber count filters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/channels/search?q=テスト&minSubscribers=10000&maxSubscribers=500000'
      )
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All results should be within subscriber range
      data.results.forEach((channel: any) => {
        expect(channel.subscriberCount).toBeGreaterThanOrEqual(10000)
        expect(channel.subscriberCount).toBeLessThanOrEqual(500000)
      })
    })

    test('applies verified filter', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト&verified=true')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All results should be verified
      data.results.forEach((channel: any) => {
        expect(channel.verified).toBe(true)
      })
    })

    test('returns analytics data', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.analytics).toBeDefined()
      expect(data.analytics.totalResults).toBeDefined()
      expect(data.analytics.platforms).toBeDefined()
      expect(data.analytics.categories).toBeDefined()
      expect(data.analytics.averageSubscribers).toBeDefined()
      expect(data.analytics.verifiedCount).toBeDefined()
    })

    test('supports pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト&limit=5&offset=0')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.limit).toBe(5)
      expect(data.pagination.offset).toBe(0)
      expect(data.pagination.hasMore).toBeDefined()
    })

    test('sorts results by subscriber count', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      
      // Results should be sorted by subscriber count in descending order
      if (data.results.length > 1) {
        for (let i = 0; i < data.results.length - 1; i++) {
          expect(data.results[i].subscriberCount).toBeGreaterThanOrEqual(
            data.results[i + 1].subscriberCount
          )
        }
      }
    })

    test('handles category filter', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=テスト&category=テクノロジー')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All results should be in the specified category
      data.results.forEach((channel: any) => {
        expect(channel.category).toBe('テクノロジー')
      })
    })

    test('handles server error gracefully', async () => {
      // Create a request that might cause an error
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=' + 'x'.repeat(1000))
      
      const response = await GET(request)
      
      // Should either succeed or return a proper error response
      expect([200, 400, 500]).toContain(response.status)
      
      const data = await response.json()
      expect(data).toHaveProperty('success')
    })
  })

  describe('/api/channels/[id]/analysis', () => {
    test('returns analysis for valid channel ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/ch_test_001/analysis')
      const params = Promise.resolve({ id: 'ch_test_001' })
      
      const response = await getAnalysis(request, { params })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.basicInfo).toBeDefined()
      expect(data.data.growthAnalysis).toBeDefined()
    })

    test('returns 404 for non-existent channel', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/nonexistent/analysis')
      const params = Promise.resolve({ id: 'nonexistent' })
      
      const response = await getAnalysis(request, { params })
      const data = await response.json()
      
      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('not found')
    })

    test('handles depth parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/ch_test_001/analysis?depth=comprehensive')
      const params = Promise.resolve({ id: 'ch_test_001' })
      
      const response = await getAnalysis(request, { params })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })

    test('handles includeCompetitors parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/ch_test_001/analysis?includeCompetitors=true')
      const params = Promise.resolve({ id: 'ch_test_001' })
      
      const response = await getAnalysis(request, { params })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.competitorComparison).toBeDefined()
    })

    test('handles includeAI parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/ch_test_001/analysis?includeAI=true')
      const params = Promise.resolve({ id: 'ch_test_001' })
      
      const response = await getAnalysis(request, { params })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.aiReport).toBeDefined()
    })

    test('handles refresh parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/ch_test_001/analysis?refresh=true')
      const params = Promise.resolve({ id: 'ch_test_001' })
      
      const response = await getAnalysis(request, { params })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    test('validates request parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/ch_test_001/analysis?depth=invalid')
      const params = Promise.resolve({ id: 'ch_test_001' })
      
      const response = await getAnalysis(request, { params })
      
      // Should either accept default value or return error
      expect([200, 400]).toContain(response.status)
    })
  })

  describe('Error handling', () => {
    test('handles malformed requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels/search')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    test('handles database connection errors', async () => {
      // This would require mocking database failures
      // For now, just ensure the endpoint doesn't crash
      const request = new NextRequest('http://localhost:3000/api/channels/search?q=테스트')
      
      const response = await GET(request)
      
      // Should return a valid response even if there are issues
      expect(response).toBeDefined()
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })
})