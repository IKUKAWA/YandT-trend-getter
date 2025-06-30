import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as ExcelJS from 'exceljs'

interface ExportData {
  title: string
  headers: string[]
  rows: (string | number)[][]
  metadata?: {
    author?: string
    subject?: string
    creator?: string
    createdAt?: Date
    filters?: Record<string, any>
    summary?: Record<string, any>
  }
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  canvas?: HTMLCanvasElement
}

export class ExportService {
  /**
   * Export data to CSV format
   */
  static async exportToCSV(data: ExportData): Promise<void> {
    const { title, headers, rows, metadata } = data
    
    let csvContent = ''
    
    // Add metadata as comments
    if (metadata) {
      csvContent += `# ${title}\n`
      if (metadata.createdAt) {
        csvContent += `# 作成日時: ${metadata.createdAt.toLocaleString('ja-JP')}\n`
      }
      if (metadata.author) {
        csvContent += `# 作成者: ${metadata.author}\n`
      }
      if (metadata.filters) {
        csvContent += `# フィルター: ${JSON.stringify(metadata.filters)}\n`
      }
      csvContent += '\n'
    }
    
    // Add headers
    csvContent += headers.map(header => `"${header}"`).join(',') + '\n'
    
    // Add rows
    rows.forEach(row => {
      const csvRow = row.map(cell => {
        const cellValue = cell?.toString() || ''
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
          return `"${cellValue.replace(/"/g, '""')}"`
        }
        return cellValue
      }).join(',')
      csvContent += csvRow + '\n'
    })
    
    // Download file
    this.downloadFile(csvContent, `${title}.csv`, 'text/csv;charset=utf-8;')
  }

  /**
   * Export data to Excel format
   */
  static async exportToExcel(data: ExportData): Promise<void> {
    const { title, headers, rows, metadata } = data
    
    const workbook = new ExcelJS.Workbook()
    
    // Set workbook properties
    workbook.creator = metadata?.author || 'YandT Trend Getter'
    workbook.lastModifiedBy = metadata?.author || 'YandT Trend Getter'
    workbook.created = metadata?.createdAt || new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()
    
    const worksheet = workbook.addWorksheet(title, {
      properties: {
        tabColor: { argb: '8B5CF6' }
      }
    })
    
    let currentRow = 1
    
    // Add metadata section
    if (metadata) {
      worksheet.addRow([title])
      worksheet.getCell(currentRow, 1).font = { size: 16, bold: true }
      worksheet.getCell(currentRow, 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8B5CF6' }
      }
      worksheet.getCell(currentRow, 1).font.color = { argb: 'FFFFFF' }
      currentRow++
      
      if (metadata.createdAt) {
        worksheet.addRow(['作成日時:', metadata.createdAt.toLocaleString('ja-JP')])
        currentRow++
      }
      
      if (metadata.author) {
        worksheet.addRow(['作成者:', metadata.author])
        currentRow++
      }
      
      if (metadata.subject) {
        worksheet.addRow(['説明:', metadata.subject])
        currentRow++
      }
      
      if (metadata.filters && Object.keys(metadata.filters).length > 0) {
        worksheet.addRow(['フィルター:'])
        currentRow++
        Object.entries(metadata.filters).forEach(([key, value]) => {
          worksheet.addRow(['', `${key}: ${value}`])
          currentRow++
        })
      }
      
      if (metadata.summary && Object.keys(metadata.summary).length > 0) {
        worksheet.addRow(['サマリー:'])
        currentRow++
        Object.entries(metadata.summary).forEach(([key, value]) => {
          worksheet.addRow(['', `${key}: ${value}`])
          currentRow++
        })
      }
      
      // Add empty row
      worksheet.addRow([])
      currentRow++
    }
    
    // Add headers
    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F3F4F6' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    currentRow++
    
    // Add data rows
    rows.forEach(row => {
      const dataRow = worksheet.addRow(row)
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      currentRow++
    })
    
    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index]?.length || 10
      
      rows.forEach(row => {
        const cellValue = row[index]?.toString() || ''
        maxLength = Math.max(maxLength, cellValue.length)
      })
      
      column.width = Math.min(maxLength + 2, 50)
    })
    
    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    this.downloadBlob(blob, `${title}.xlsx`)
  }

  /**
   * Export data to PDF format
   */
  static async exportToPDF(
    data: ExportData, 
    options: {
      orientation?: 'portrait' | 'landscape'
      includeCharts?: ChartData[]
      pageSize?: 'a4' | 'a3' | 'letter'
    } = {}
  ): Promise<void> {
    const { title, headers, rows, metadata } = data
    const { orientation = 'portrait', includeCharts = [], pageSize = 'a4' } = options
    
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    })
    
    // Set font for Japanese text
    doc.setFont('helvetica')
    
    let yPosition = 20
    
    // Add title
    doc.setFontSize(20)
    doc.setTextColor(139, 92, 246) // Purple color
    doc.text(title, 20, yPosition)
    yPosition += 15
    
    // Add metadata
    if (metadata) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      
      if (metadata.createdAt) {
        doc.text(`作成日時: ${metadata.createdAt.toLocaleString('ja-JP')}`, 20, yPosition)
        yPosition += 6
      }
      
      if (metadata.author) {
        doc.text(`作成者: ${metadata.author}`, 20, yPosition)
        yPosition += 6
      }
      
      if (metadata.subject) {
        doc.text(`説明: ${metadata.subject}`, 20, yPosition)
        yPosition += 6
      }
      
      yPosition += 5
    }
    
    // Add summary if available
    if (metadata?.summary && Object.keys(metadata.summary).length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('サマリー', 20, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      Object.entries(metadata.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 25, yPosition)
        yPosition += 5
      })
      yPosition += 5
    }
    
    // Add charts if provided
    if (includeCharts && includeCharts.length > 0) {
      for (const chart of includeCharts) {
        if (chart.canvas) {
          const imgData = chart.canvas.toDataURL('image/png')
          doc.addImage(imgData, 'PNG', 20, yPosition, 160, 80)
          yPosition += 90
          
          // Add page break if needed
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }
        }
      }
    }
    
    // Add table
    const tableData = rows.map(row => row.map(cell => cell?.toString() || ''))
    
    ;(doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    })
    
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      )
    }
    
    // Download PDF
    doc.save(`${title}.pdf`)
  }

  /**
   * Export trends data with specialized formatting
   */
  static async exportTrendsData(
    trends: any[],
    format: 'csv' | 'excel' | 'pdf',
    options: {
      includeMetrics?: boolean
      includeCharts?: boolean
      filters?: Record<string, any>
      author?: string
    } = {}
  ): Promise<void> {
    const { includeMetrics = true, includeCharts = false, filters = {}, author = 'User' } = options
    
    const headers = [
      'タイトル',
      'プラットフォーム',
      'カテゴリ',
      '再生数',
      'いいね数',
      'コメント数',
      'シェア数',
      'エンゲージメント率',
      '投稿日時',
      'ハッシュタグ'
    ]
    
    const rows = trends.map(trend => {
      const views = Number(trend.views) || 0
      const likes = trend.likes || 0
      const comments = trend.comments || 0
      const shares = trend.shares || 0
      const engagementRate = views > 0 ? ((likes + comments + shares) / views * 100).toFixed(2) : '0.00'
      
      return [
        trend.title || '',
        trend.platform || '',
        trend.category || '',
        views.toLocaleString(),
        likes.toLocaleString(),
        comments.toLocaleString(),
        shares.toLocaleString(),
        `${engagementRate}%`,
        new Date(trend.createdAt).toLocaleString('ja-JP'),
        (trend.hashtags || []).join(', ')
      ]
    })
    
    const summary = includeMetrics ? {
      '総データ数': trends.length.toLocaleString(),
      '総再生数': trends.reduce((sum, t) => sum + (Number(t.views) || 0), 0).toLocaleString(),
      '平均エンゲージメント率': (
        trends.reduce((sum, t) => {
          const views = Number(t.views) || 0
          const engagement = (t.likes || 0) + (t.comments || 0) + (t.shares || 0)
          return sum + (views > 0 ? engagement / views : 0)
        }, 0) / trends.length * 100
      ).toFixed(2) + '%',
      '最新データ': trends.length > 0 ? new Date(Math.max(...trends.map(t => new Date(t.createdAt).getTime()))).toLocaleString('ja-JP') : 'N/A'
    } : undefined
    
    const exportData: ExportData = {
      title: 'トレンドデータエクスポート',
      headers,
      rows,
      metadata: {
        author,
        subject: 'YandTトレンドゲッターからエクスポートされたトレンドデータ',
        createdAt: new Date(),
        filters,
        summary
      }
    }
    
    switch (format) {
      case 'csv':
        await this.exportToCSV(exportData)
        break
      case 'excel':
        await this.exportToExcel(exportData)
        break
      case 'pdf':
        await this.exportToPDF(exportData, {
          orientation: 'landscape',
          includeCharts: includeCharts ? [] : undefined // Charts would be passed here
        })
        break
    }
  }

  /**
   * Export analytics report
   */
  static async exportAnalyticsReport(
    analytics: {
      trends: any[]
      predictions: any[]
      categories: any[]
      engagement: any[]
    },
    format: 'pdf' | 'excel',
    options: {
      author?: string
      includeCharts?: boolean
    } = {}
  ): Promise<void> {
    const { author = 'User', includeCharts = false } = options
    const reportTitle = 'トレンド分析レポート'
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook()
      workbook.creator = author
      workbook.created = new Date()
      
      // Trends sheet
      const trendsSheet = workbook.addWorksheet('トレンド')
      const trendHeaders = ['タイトル', 'プラットフォーム', 'カテゴリ', '再生数', 'エンゲージメント率']
      trendsSheet.addRow(trendHeaders)
      analytics.trends.forEach(trend => {
        const views = Number(trend.views) || 0
        const engagement = (trend.likes || 0) + (trend.comments || 0) + (trend.shares || 0)
        const engagementRate = views > 0 ? (engagement / views * 100).toFixed(2) : '0.00'
        trendsSheet.addRow([
          trend.title,
          trend.platform,
          trend.category,
          views,
          `${engagementRate}%`
        ])
      })
      
      // Predictions sheet
      if (analytics.predictions.length > 0) {
        const predictionsSheet = workbook.addWorksheet('予測')
        const predictionHeaders = ['カテゴリ', '現在値', '予測値', '信頼度', '期間']
        predictionsSheet.addRow(predictionHeaders)
        analytics.predictions.forEach(prediction => {
          predictionsSheet.addRow([
            prediction.category,
            prediction.currentTrend,
            prediction.predictedTrend,
            `${(prediction.confidence * 100).toFixed(1)}%`,
            prediction.timeframe
          ])
        })
      }
      
      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      this.downloadBlob(blob, `${reportTitle}.xlsx`)
      
    } else if (format === 'pdf') {
      // Create comprehensive PDF report
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // Title page
      doc.setFontSize(24)
      doc.setTextColor(139, 92, 246)
      doc.text(reportTitle, 20, 40)
      
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`作成日時: ${new Date().toLocaleString('ja-JP')}`, 20, 60)
      doc.text(`作成者: ${author}`, 20, 70)
      
      // Summary
      doc.setFontSize(16)
      doc.text('エグゼクティブサマリー', 20, 100)
      doc.setFontSize(10)
      doc.text(`• 分析対象トレンド数: ${analytics.trends.length}件`, 25, 115)
      doc.text(`• 予測データ数: ${analytics.predictions.length}件`, 25, 125)
      doc.text(`• カテゴリ数: ${analytics.categories.length}件`, 25, 135)
      
      // Add new page for detailed data
      doc.addPage()
      
      // Trends table
      const trendData = analytics.trends.slice(0, 20).map(trend => {
        const views = Number(trend.views) || 0
        const engagement = (trend.likes || 0) + (trend.comments || 0) + (trend.shares || 0)
        const engagementRate = views > 0 ? (engagement / views * 100).toFixed(1) : '0.0'
        return [
          trend.title?.substring(0, 30) || '',
          trend.platform || '',
          views.toLocaleString(),
          `${engagementRate}%`
        ]
      })
      
      ;(doc as any).autoTable({
        head: [['タイトル', 'プラットフォーム', '再生数', 'エンゲージメント率']],
        body: trendData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 92, 246] },
        margin: { top: 20 }
      })
      
      doc.save(`${reportTitle}.pdf`)
    }
  }

  /**
   * Helper method to download text files
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    this.downloadBlob(blob, filename)
  }

  /**
   * Helper method to download blob files
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}