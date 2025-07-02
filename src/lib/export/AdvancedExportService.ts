import jsPDF from 'jspdf'
import ExcelJS from 'exceljs'
import html2canvas from 'html2canvas'
import { ChannelAnalysis, ChannelSearchResult } from '@/types/channel'

// Import jspdf-autotable with TypeScript compatibility
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

// Lazy load jspdf-autotable to handle SSR and improve performance
let autoTableLoaded = false

const loadAutoTable = async () => {
  if (typeof window !== 'undefined' && !autoTableLoaded) {
    try {
      await import('jspdf-autotable')
      autoTableLoaded = true
    } catch (error) {
      console.warn('Failed to load jspdf-autotable:', error)
    }
  }
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  includeCharts?: boolean
  includeSummary?: boolean
  includeRawData?: boolean
  customFields?: string[]
  template?: 'basic' | 'detailed' | 'executive'
  metadata?: Record<string, any>
}

interface ExportData {
  channels: Array<{
    channel: ChannelSearchResult
    analysis: ChannelAnalysis | null
  }>
  comparison?: any
  filters?: any
  exportDate: Date
  user?: string
}

export class AdvancedExportService {
  private static instance: AdvancedExportService
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new AdvancedExportService()
    }
    return this.instance
  }

  async exportChannelAnalysis(
    data: ExportData,
    options: ExportOptions
  ): Promise<void> {
    try {
      switch (options.format) {
        case 'csv':
          await this.exportToCSV(data, options)
          break
        case 'excel':
          await this.exportToExcel(data, options)
          break
        case 'pdf':
          await this.exportToPDF(data, options)
          break
        case 'json':
          await this.exportToJSON(data, options)
          break
        default:
          throw new Error(`Unsupported format: ${options.format}`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  private async exportToCSV(data: ExportData, options: ExportOptions): Promise<void> {
    const csvRows: string[] = []
    
    // Header
    const headers = [
      'チャンネル名',
      'プラットフォーム',
      '登録者数',
      '動画数',
      'カテゴリ',
      '平均再生回数',
      'エンゲージメント率',
      '月間成長率',
      '週間成長率',
      'トレンド',
      '認証済み',
      '作成日',
      '最終更新',
      ...(options.customFields || [])
    ]
    csvRows.push(headers.join(','))

    // Data rows
    data.channels.forEach(({ channel, analysis }) => {
      const row = [
        `"${channel.name}"`,
        channel.platform,
        channel.subscriberCount.toString(),
        analysis?.basicInfo.videoCount?.toString() || '0',
        `"${channel.category}"`,
        analysis?.growthAnalysis.current.avgViews?.toString() || '0',
        analysis?.growthAnalysis.current.engagementRate ? 
          (analysis.growthAnalysis.current.engagementRate * 100).toFixed(2) + '%' : '0%',
        analysis?.growthAnalysis.monthlyGrowthRate?.toString() || '0',
        analysis?.growthAnalysis.weeklyGrowthRate?.toString() || '0',
        analysis?.growthAnalysis.trend || 'unknown',
        channel.verified ? 'Yes' : 'No',
        analysis?.basicInfo.createdDate?.toISOString().split('T')[0] || '',
        analysis?.basicInfo.lastUpdated?.toISOString().split('T')[0] || '',
        ...(options.customFields?.map(field => 
          this.getCustomFieldValue(analysis, field)
        ) || [])
      ]
      csvRows.push(row.join(','))
    })

    // Add summary if requested
    if (options.includeSummary) {
      csvRows.push('')
      csvRows.push('=== SUMMARY ===')
      csvRows.push(`Total Channels,${data.channels.length}`)
      csvRows.push(`Export Date,${data.exportDate.toISOString()}`)
      csvRows.push(`Average Subscribers,${this.calculateAverageSubscribers(data.channels)}`)
      csvRows.push(`Platform Distribution,${this.getPlatformDistribution(data.channels)}`)
    }

    const csvContent = csvRows.join('\n')
    this.downloadFile(csvContent, `channel-analysis-${this.getDateString()}.csv`, 'text/csv')
  }

  private async exportToExcel(data: ExportData, options: ExportOptions): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'YandT Trend Getter'
    workbook.created = new Date()

    // Main data worksheet
    const worksheet = workbook.addWorksheet('Channel Analysis')
    
    // Style definitions
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
      alignment: { horizontal: 'center' }
    }

    // Headers
    const headers = [
      'チャンネル名', 'プラットフォーム', '登録者数', '動画数', 'カテゴリ',
      '平均再生回数', 'エンゲージメント率', '月間成長率', '週間成長率',
      'トレンド強度', '次のマイルストーン', '予測日数', '認証済み'
    ]

    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.style = headerStyle as any
    })

    // Data rows
    data.channels.forEach(({ channel, analysis }) => {
      const row = worksheet.addRow([
        channel.name,
        channel.platform.toUpperCase(),
        channel.subscriberCount,
        analysis?.basicInfo.videoCount || 0,
        channel.category,
        analysis?.growthAnalysis.current.avgViews || 0,
        analysis?.growthAnalysis.current.engagementRate ? 
          (analysis.growthAnalysis.current.engagementRate * 100).toFixed(2) + '%' : '0%',
        analysis?.growthAnalysis.monthlyGrowthRate || 0,
        analysis?.growthAnalysis.weeklyGrowthRate || 0,
        analysis?.growthAnalysis.trendStrength || 0,
        analysis?.growthAnalysis.milestones?.nextSubscriberMilestone || 0,
        analysis?.growthAnalysis.milestones?.timeToMilestone || 0,
        channel.verified ? 'Yes' : 'No'
      ])

      // Conditional formatting for growth rates
      const monthlyGrowthCell = row.getCell(8)
      const monthlyGrowth = analysis?.growthAnalysis.monthlyGrowthRate || 0
      if (monthlyGrowth > 5) {
        monthlyGrowthCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' }
        }
      } else if (monthlyGrowth < 0) {
        monthlyGrowthCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC7CE' }
        }
      }
    })

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15
    })

    // Summary worksheet
    if (options.includeSummary) {
      const summarySheet = workbook.addWorksheet('Summary')
      
      summarySheet.addRow(['分析サマリー'])
      summarySheet.getCell('A1').style = { font: { bold: true, size: 16 } }
      
      summarySheet.addRow([])
      summarySheet.addRow(['総チャンネル数', data.channels.length])
      summarySheet.addRow(['エクスポート日時', data.exportDate.toLocaleString('ja-JP')])
      summarySheet.addRow(['平均登録者数', this.calculateAverageSubscribers(data.channels)])
      summarySheet.addRow(['プラットフォーム分布', this.getPlatformDistribution(data.channels)])
      
      const avgEngagement = this.calculateAverageEngagement(data.channels)
      summarySheet.addRow(['平均エンゲージメント率', `${avgEngagement.toFixed(2)}%`])
      
      const topPerformers = this.getTopPerformers(data.channels, 3)
      summarySheet.addRow([])
      summarySheet.addRow(['トップパフォーマー'])
      topPerformers.forEach((performer, index) => {
        summarySheet.addRow([
          `${index + 1}位`,
          performer.channel.name,
          `${performer.channel.subscriberCount.toLocaleString()}人`
        ])
      })
    }

    // Charts worksheet (if charts are included)
    if (options.includeCharts) {
      const chartsSheet = workbook.addWorksheet('Charts Data')
      
      // Prepare chart data
      const chartData = data.channels.map(({ channel, analysis }) => ({
        name: channel.name,
        subscribers: channel.subscriberCount,
        growth: analysis?.growthAnalysis.monthlyGrowthRate || 0,
        engagement: (analysis?.growthAnalysis.current.engagementRate || 0) * 100
      }))

      chartsSheet.addRow(['チャンネル名', '登録者数', '月間成長率', 'エンゲージメント率'])
      chartData.forEach(data => {
        chartsSheet.addRow([data.name, data.subscribers, data.growth, data.engagement])
      })
    }

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    this.downloadFile(blob, `channel-analysis-${this.getDateString()}.xlsx`)
  }

  private async exportToPDF(data: ExportData, options: ExportOptions): Promise<void> {
    // Ensure autoTable is loaded before using PDF features
    await loadAutoTable()
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.width
    const margin = 20

    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Channel Analysis Report', pageWidth / 2, 30, { align: 'center' })

    // Date
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${data.exportDate.toLocaleString('ja-JP')}`, pageWidth / 2, 40, { align: 'center' })

    let yPosition = 60

    // Executive Summary
    if (options.template === 'executive' || options.includeSummary) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Executive Summary', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      
      const summaryText = [
        `Total Channels Analyzed: ${data.channels.length}`,
        `Average Subscribers: ${this.calculateAverageSubscribers(data.channels)}`,
        `Platform Distribution: ${this.getPlatformDistribution(data.channels)}`,
        `Average Engagement Rate: ${this.calculateAverageEngagement(data.channels).toFixed(2)}%`
      ]

      summaryText.forEach(text => {
        pdf.text(text, margin, yPosition)
        yPosition += 8
      })

      yPosition += 10
    }

    // Channel data table
    const tableHeaders = [
      'Channel', 'Platform', 'Subscribers', 'Growth %', 'Engagement %'
    ]

    const tableData = data.channels.map(({ channel, analysis }) => [
      channel.name.length > 20 ? channel.name.substring(0, 17) + '...' : channel.name,
      channel.platform.toUpperCase(),
      this.formatNumber(channel.subscriberCount),
      (analysis?.growthAnalysis.monthlyGrowthRate || 0).toFixed(1),
      ((analysis?.growthAnalysis.current.engagementRate || 0) * 100).toFixed(1)
    ])

    // Add table using autoTable plugin
    if (typeof (pdf as any).autoTable === 'function') {
      (pdf as any).autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [54, 96, 146] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      })

      yPosition = (pdf as any).lastAutoTable?.finalY + 20 || yPosition + 100
    } else {
      // Fallback if autoTable is not available
      yPosition += 100
    }

    // Charts (if requested and available)
    if (options.includeCharts) {
      const chartElements = document.querySelectorAll('[data-chart-export]')
      
      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i] as HTMLElement
        
        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff'
          })
          
          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pageWidth - 2 * margin
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          // Add new page if needed
          if (yPosition + imgHeight > pdf.internal.pageSize.height - margin) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 10

        } catch (error) {
          console.error('Failed to capture chart:', error)
        }
      }
    }

    // Detailed analysis (if template is detailed)
    if (options.template === 'detailed') {
      pdf.addPage()
      yPosition = margin

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Detailed Analysis', margin, yPosition)
      yPosition += 20

      data.channels.forEach(({ channel, analysis }) => {
        if (yPosition > pdf.internal.pageSize.height - 60) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(channel.name, margin, yPosition)
        yPosition += 12

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        const details = [
          `Platform: ${channel.platform.toUpperCase()}`,
          `Subscribers: ${channel.subscriberCount.toLocaleString()}`,
          `Category: ${channel.category}`,
          `Monthly Growth: ${analysis?.growthAnalysis.monthlyGrowthRate || 0}%`,
          `Engagement Rate: ${((analysis?.growthAnalysis.current.engagementRate || 0) * 100).toFixed(2)}%`,
          `Trend: ${analysis?.growthAnalysis.trend || 'Unknown'}`
        ]

        details.forEach(detail => {
          pdf.text(detail, margin, yPosition)
          yPosition += 6
        })

        yPosition += 10
      })
    }

    // Footer
    const pageCount = (pdf.internal as any).getNumberOfPages?.() || 1
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Page ${i} of ${pageCount} - Generated by YandT Trend Getter`,
        pageWidth / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    pdf.save(`channel-analysis-${this.getDateString()}.pdf`)
  }

  private async exportToJSON(data: ExportData, options: ExportOptions): Promise<void> {
    const exportData = {
      metadata: {
        exportDate: data.exportDate.toISOString(),
        format: 'json',
        version: '1.0',
        generatedBy: 'YandT Trend Getter',
        ...options.metadata
      },
      summary: options.includeSummary ? {
        totalChannels: data.channels.length,
        averageSubscribers: this.calculateAverageSubscribers(data.channels),
        platformDistribution: this.getPlatformDistributionObject(data.channels),
        averageEngagement: this.calculateAverageEngagement(data.channels),
        topPerformers: this.getTopPerformers(data.channels, 5)
      } : undefined,
      channels: data.channels.map(({ channel, analysis }) => ({
        basicInfo: {
          id: channel.id,
          name: channel.name,
          platform: channel.platform,
          subscriberCount: channel.subscriberCount,
          category: channel.category,
          verified: channel.verified,
          description: channel.description
        },
        growthMetrics: analysis ? {
          avgViews: analysis.growthAnalysis.current.avgViews,
          engagementRate: analysis.growthAnalysis.current.engagementRate,
          monthlyGrowthRate: analysis.growthAnalysis.monthlyGrowthRate,
          weeklyGrowthRate: analysis.growthAnalysis.weeklyGrowthRate,
          trend: analysis.growthAnalysis.trend,
          trendStrength: analysis.growthAnalysis.trendStrength,
          growthAcceleration: analysis.growthAnalysis.growthAcceleration
        } : null,
        milestones: analysis?.growthAnalysis.milestones,
        monetization: options.includeRawData ? analysis?.monetization : undefined,
        aiInsights: options.includeRawData ? analysis?.aiReport : undefined
      })),
      filters: data.filters,
      comparison: data.comparison
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    this.downloadFile(jsonString, `channel-analysis-${this.getDateString()}.json`, 'application/json')
  }

  // Helper methods
  private getCustomFieldValue(analysis: ChannelAnalysis | null, field: string): string {
    if (!analysis) return ''
    
    switch (field) {
      case 'nextMilestone':
        return analysis.growthAnalysis.milestones?.nextSubscriberMilestone?.toString() || ''
      case 'timeToMilestone':
        return analysis.growthAnalysis.milestones?.timeToMilestone?.toString() || ''
      case 'trendStrength':
        return analysis.growthAnalysis.trendStrength?.toString() || ''
      default:
        return ''
    }
  }

  private calculateAverageSubscribers(channels: ExportData['channels']): string {
    const total = channels.reduce((sum, { channel }) => sum + channel.subscriberCount, 0)
    return this.formatNumber(Math.round(total / channels.length))
  }

  private calculateAverageEngagement(channels: ExportData['channels']): number {
    const validChannels = channels.filter(({ analysis }) => analysis?.growthAnalysis.current.engagementRate)
    if (validChannels.length === 0) return 0
    
    const total = validChannels.reduce((sum, { analysis }) => 
      sum + (analysis!.growthAnalysis.current.engagementRate * 100), 0)
    return total / validChannels.length
  }

  private getPlatformDistribution(channels: ExportData['channels']): string {
    const distribution = this.getPlatformDistributionObject(channels)
    return Object.entries(distribution)
      .map(([platform, count]) => `${platform}: ${count}`)
      .join(', ')
  }

  private getPlatformDistributionObject(channels: ExportData['channels']) {
    return channels.reduce((acc, { channel }) => {
      acc[channel.platform] = (acc[channel.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private getTopPerformers(channels: ExportData['channels'], count: number) {
    return channels
      .sort((a, b) => b.channel.subscriberCount - a.channel.subscriberCount)
      .slice(0, count)
      .map(({ channel }) => ({ channel }))
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  private getDateString(): string {
    return new Date().toISOString().split('T')[0]
  }

  private downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
    const blob = typeof content === 'string' 
      ? new Blob([content], { type: mimeType || 'text/plain' })
      : content

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}