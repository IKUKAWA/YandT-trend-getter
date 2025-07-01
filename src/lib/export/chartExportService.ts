interface ExportData {
  chartType: string
  platform: string
  category: string
  timestamp: string
  data: any[]
}

export class ChartExportService {
  static exportAsJSON(data: ExportData): void {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      this.downloadFile(
        jsonString,
        `trend-analysis-${data.chartType}-${this.getDateString()}.json`,
        'application/json'
      )
    } catch (error) {
      console.error('JSON エクスポートエラー:', error)
      throw new Error('JSON エクスポートに失敗しました')
    }
  }

  static exportAsCSV(data: ExportData): void {
    try {
      let csvContent = ''
      
      // Add metadata
      csvContent += `チャートタイプ,${data.chartType}\n`
      csvContent += `プラットフォーム,${data.platform}\n`
      csvContent += `カテゴリ,${data.category}\n`
      csvContent += `エクスポート日時,${data.timestamp}\n\n`
      
      // Add data headers and rows
      if (data.data && data.data.length > 0) {
        const headers = Object.keys(data.data[0])
        csvContent += headers.join(',') + '\n'
        
        data.data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          csvContent += values.join(',') + '\n'
        })
      }
      
      this.downloadFile(
        csvContent,
        `trend-analysis-${data.chartType}-${this.getDateString()}.csv`,
        'text/csv'
      )
    } catch (error) {
      console.error('CSV エクスポートエラー:', error)
      throw new Error('CSV エクスポートに失敗しました')
    }
  }

  static async exportAsPDF(data: ExportData, chartElement?: HTMLElement): Promise<void> {
    try {
      // Dynamic import to avoid bundle size issues
      const jsPDF = (await import('jspdf')).default
      
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('トレンド分析レポート', 20, 30)
      
      // Add metadata
      doc.setFontSize(12)
      doc.text(`チャートタイプ: ${data.chartType}`, 20, 50)
      doc.text(`プラットフォーム: ${data.platform}`, 20, 60)
      doc.text(`カテゴリ: ${data.category}`, 20, 70)
      doc.text(`作成日時: ${new Date(data.timestamp).toLocaleString('ja-JP')}`, 20, 80)
      
      // Add chart image if element provided
      if (chartElement) {
        try {
          const html2canvas = (await import('html2canvas')).default
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff'
          })
          
          const imgData = canvas.toDataURL('image/png')
          const imgWidth = 170 // A4 width minus margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          doc.addImage(imgData, 'PNG', 20, 100, imgWidth, imgHeight)
        } catch (canvasError) {
          console.warn('チャート画像の生成に失敗しました:', canvasError)
          doc.text('チャート画像を生成できませんでした', 20, 100)
        }
      }
      
      // Add data table
      if (data.data && data.data.length > 0) {
        const startY = chartElement ? 200 : 100
        
        const tableData = data.data.map(row => Object.values(row))
        const tableHeaders = Object.keys(data.data[0])
        
        // Simple table implementation - add data manually if autoTable is not available
        try {
          if ((doc as any).autoTable) {
            (doc as any).autoTable({
              head: [tableHeaders],
              body: tableData,
              startY: startY,
              margin: { left: 20, right: 20 },
              styles: { fontSize: 8 }
            })
          } else {
            // Fallback: simple text table
            let yPosition = startY
            doc.setFontSize(10)
            
            // Headers
            doc.text(tableHeaders.join(' | '), 20, yPosition)
            yPosition += 10
            
            // Data rows
            tableData.forEach((row, index) => {
              if (yPosition > 250) { // New page if needed
                doc.addPage()
                yPosition = 30
              }
              doc.text(row.join(' | '), 20, yPosition)
              yPosition += 8
            })
          }
        } catch (tableError) {
          console.warn('テーブル生成に失敗しました:', tableError)
          doc.text('データテーブルを生成できませんでした', 20, startY)
        }
      }
      
      // Save PDF
      doc.save(`trend-analysis-${data.chartType}-${this.getDateString()}.pdf`)
      
    } catch (error) {
      console.error('PDF エクスポートエラー:', error)
      throw new Error('PDF エクスポートに失敗しました')
    }
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  private static getDateString(): string {
    return new Date().toISOString().split('T')[0]
  }

  static getSupportedFormats(): Array<{id: string, label: string, description: string}> {
    return [
      { id: 'json', label: 'JSON', description: 'データを JSON 形式でエクスポート' },
      { id: 'csv', label: 'CSV', description: 'Excel で開けるCSV形式でエクスポート' },
      { id: 'pdf', label: 'PDF', description: 'チャート付きPDFレポートを生成' }
    ]
  }
}