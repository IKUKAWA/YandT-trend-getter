import { DataCollector } from './data-collector'
import { AIArticleGenerator } from './ai-article-generator'
import { getWeek, getMonth, getYear } from 'date-fns'

export class ReportScheduler {
  private dataCollector: DataCollector
  private articleGenerator: AIArticleGenerator

  constructor() {
    this.dataCollector = new DataCollector()
    this.articleGenerator = new AIArticleGenerator()
  }

  async generateWeeklyReport(): Promise<{ success: boolean; articleId?: string; error?: string }> {
    try {
      console.log('🕐 Starting weekly report generation...')
      
      const now = new Date()
      const weekNumber = getWeek(now)
      const year = getYear(now)

      console.log(`📅 Generating report for Week ${weekNumber}, ${year}`)

      await this.dataCollector.collectAllData()

      const articleId = await this.articleGenerator.generateWeeklyReport(weekNumber, year)

      await this.articleGenerator.publishArticle(articleId)

      console.log(`✅ Weekly report generated successfully: ${articleId}`)
      
      return { success: true, articleId }
    } catch (error) {
      console.error('❌ Weekly report generation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async generateMonthlyReport(): Promise<{ success: boolean; articleId?: string; error?: string }> {
    try {
      console.log('🕐 Starting monthly report generation...')
      
      const now = new Date()
      const monthNumber = getMonth(now) + 1
      const year = getYear(now)

      console.log(`📅 Generating report for Month ${monthNumber}, ${year}`)

      const articleId = await this.articleGenerator.generateMonthlyReport(monthNumber, year)

      await this.articleGenerator.publishArticle(articleId)

      console.log(`✅ Monthly report generated successfully: ${articleId}`)
      
      return { success: true, articleId }
    } catch (error) {
      console.error('❌ Monthly report generation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async runDailyTasks(): Promise<{ success: boolean; collected: boolean; error?: string }> {
    try {
      console.log('🌅 Running daily tasks...')
      
      await this.dataCollector.collectAllData()
      
      console.log('✅ Daily data collection completed')
      
      return { success: true, collected: true }
    } catch (error) {
      console.error('❌ Daily tasks failed:', error)
      return { 
        success: false, 
        collected: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async runWeeklyTasks(): Promise<{ success: boolean; articleId?: string; error?: string }> {
    try {
      console.log('📊 Running weekly tasks...')
      
      const result = await this.generateWeeklyReport()
      
      if (result.success) {
        console.log('✅ Weekly tasks completed successfully')
      }
      
      return result
    } catch (error) {
      console.error('❌ Weekly tasks failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async runMonthlyTasks(): Promise<{ success: boolean; articleId?: string; error?: string }> {
    try {
      console.log('📈 Running monthly tasks...')
      
      const result = await this.generateMonthlyReport()
      
      if (result.success) {
        console.log('✅ Monthly tasks completed successfully')
      }
      
      return result
    } catch (error) {
      console.error('❌ Monthly tasks failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  getScheduleInfo() {
    return {
      daily: {
        time: '09:00 JST',
        task: 'Data collection from YouTube and TikTok APIs',
        frequency: 'Every day'
      },
      weekly: {
        time: '10:00 JST on Monday',
        task: 'Generate and publish weekly trend report',
        frequency: 'Every Monday'
      },
      monthly: {
        time: '11:00 JST on 1st of month',
        task: 'Generate and publish monthly trend report',
        frequency: '1st day of each month'
      }
    }
  }
}