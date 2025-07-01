'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import {
  Grid3X3,
  Target,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Zap,
  Youtube,
  Music2,
  Camera,
  Monitor
} from 'lucide-react'

interface PlatformData {
  name: string
  youtube: number
  tiktok: number
  x: number
  instagram: number
}

interface ScatterData {
  category: string
  platform: 'youtube' | 'tiktok' | 'x' | 'instagram'
  views: number
  likes: number
  comments: number
  shares: number
  engagement: number
  growth: number
  viral_score: number
  reach: number
}

interface ScatterMatrixChartProps {
  data?: PlatformData[]
  variables?: string[]
  selectedCategory?: string
  selectedPlatform?: string
  onCategoryChange?: (category: string) => void
  interactive?: boolean
  showCorrelations?: boolean
}

const mockPlatformData: PlatformData[] = [
  { name: '音楽', youtube: 1250, tiktok: 890, x: 640, instagram: 720 },
  { name: 'ゲーム', youtube: 1120, tiktok: 1340, x: 580, instagram: 650 },
  { name: 'ライフスタイル', youtube: 980, tiktok: 1150, x: 720, instagram: 1100 },
  { name: 'テクノロジー', youtube: 1450, tiktok: 650, x: 890, instagram: 540 },
  { name: 'ファッション', youtube: 750, tiktok: 1580, x: 420, instagram: 1320 },
  { name: 'フード', youtube: 920, tiktok: 1240, x: 580, instagram: 980 },
  { name: 'スポーツ', youtube: 1380, tiktok: 780, x: 1120, instagram: 690 },
  { name: 'エンタメ', youtube: 1650, tiktok: 1420, x: 980, instagram: 1180 }
]

// Transform platform data to scatter data for analysis
const transformToScatterData = (platformData: PlatformData[]): ScatterData[] => {
  const scatterData: ScatterData[] = []
  const platforms: Array<keyof Omit<PlatformData, 'name'>> = ['youtube', 'tiktok', 'x', 'instagram']
  
  platformData.forEach(item => {
    platforms.forEach(platform => {
      const baseValue = item[platform]
      
      scatterData.push({
        category: item.name,
        platform: platform as 'youtube' | 'tiktok' | 'x' | 'instagram',
        views: baseValue * 1000, // Scale up for realistic view numbers
        likes: Math.round(baseValue * 0.08), // 8% like rate
        comments: Math.round(baseValue * 0.015), // 1.5% comment rate
        shares: Math.round(baseValue * 0.01), // 1% share rate
        engagement: Math.round((Math.random() * 3 + 5) * 10) / 10, // 5-8% engagement
        growth: Math.round((Math.random() * 15 + 5) * 10) / 10, // 5-20% growth
        viral_score: Math.round(Math.random() * 30 + 60), // 60-90 viral score
        reach: Math.round(baseValue * 0.8 * 1000) // 80% reach rate
      })
    })
  })
  
  return scatterData
}

const defaultVariables = ['views', 'engagement', 'growth', 'viral_score']

const platformColors: Record<string, string> = {
  youtube: '#FF0000',
  tiktok: '#000000',
  x: '#1DA1F2',
  instagram: '#E4405F'
}

const variableLabels: Record<string, string> = {
  views: 'ビュー数',
  likes: 'いいね数',
  comments: 'コメント数',
  shares: 'シェア数',
  engagement: 'エンゲージメント率',
  growth: '成長率',
  viral_score: 'バイラルスコア',
  reach: 'リーチ数'
}

export function ScatterMatrixChart({
  data = mockPlatformData,
  variables = defaultVariables,
  selectedCategory = '',
  selectedPlatform = '',
  onCategoryChange,
  interactive = true,
  showCorrelations = true
}: ScatterMatrixChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [correlations, setCorrelations] = useState<Record<string, number>>({})

  const size = 120
  const padding = 20
  const totalSize = variables.length * size + (variables.length - 1) * padding

  // Transform platform data to scatter data
  const scatterData = useMemo(() => {
    let filteredData = data
    
    // Filter by category if selected
    if (selectedCategory) {
      filteredData = data.filter(item => item.name === selectedCategory)
    }
    
    return transformToScatterData(filteredData)
  }, [data, selectedCategory])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    renderMatrix()
    calculateCorrelations()
  }, [scatterData, variables, selectedCategory])

  const calculateCorrelations = () => {
    const corrs: Record<string, number> = {}
    
    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        const var1 = variables[i]
        const var2 = variables[j]
        
        const values1 = scatterData.map(d => (d as any)[var1])
        const values2 = scatterData.map(d => (d as any)[var2])
        
        const correlation = calculatePearsonCorrelation(values1, values2)
        corrs[`${var1}-${var2}`] = correlation
      }
    }
    
    setCorrelations(corrs)
  }

  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  const renderMatrix = () => {
    const svg = d3.select(svgRef.current)
    
    const filteredData = selectedCategory
      ? scatterData.filter(d => d.category === selectedCategory)
      : scatterData

    variables.forEach((yVar, i) => {
      variables.forEach((xVar, j) => {
        const x = j * (size + padding)
        const y = i * (size + padding)

        const g = svg.append("g")
          .attr("transform", `translate(${x}, ${y})`)

        if (i === j) {
          // Diagonal - show variable name and histogram
          renderDiagonal(g, xVar, filteredData)
        } else {
          // Off-diagonal - show scatter plot
          renderScatterPlot(g, xVar, yVar, filteredData, i, j)
        }
      })
    })

    // Add axis labels
    variables.forEach((variable, i) => {
      // X-axis labels (bottom)
      svg.append("text")
        .attr("x", i * (size + padding) + size / 2)
        .attr("y", totalSize + 30)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#666")
        .text(variableLabels[variable])

      // Y-axis labels (left)
      svg.append("text")
        .attr("x", -10)
        .attr("y", i * (size + padding) + size / 2)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90, -10, ${i * (size + padding) + size / 2})`)
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#666")
        .text(variableLabels[variable])
    })
  }

  const renderDiagonal = (g: any, variable: string, data: ScatterData[]) => {
    // Background
    g.append("rect")
      .attr("width", size)
      .attr("height", size)
      .attr("fill", "#f8f9fa")
      .attr("stroke", "#e9ecef")
      .attr("stroke-width", 1)
      .attr("rx", 4)

    // Variable name
    g.append("text")
      .attr("x", size / 2)
      .attr("y", size / 2 - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(variableLabels[variable])

    // Simple histogram
    const values = data.map(d => (d as any)[variable])
    const extent = d3.extent(values) as [number, number]
    const scale = d3.scaleLinear()
      .domain(extent)
      .range([10, size - 10])

    const histogram = d3.histogram()
      .domain(extent)
      .thresholds(8)

    const bins = histogram(values)
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([size - 20, size / 2 + 10])

    g.selectAll("rect.hist")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "hist")
      .attr("x", (d: any) => scale(d.x0))
      .attr("y", (d: any) => yScale(d.length))
      .attr("width", (d: any) => Math.max(0, scale(d.x1) - scale(d.x0) - 1))
      .attr("height", (d: any) => size - 20 - yScale(d.length))
      .attr("fill", "#4f46e5")
      .attr("fill-opacity", 0.6)
  }

  const renderScatterPlot = (
    g: any,
    xVar: string,
    yVar: string,
    data: ScatterData[],
    i: number,
    j: number
  ) => {
    const xValues = data.map(d => (d as any)[xVar])
    const yValues = data.map(d => (d as any)[yVar])

    const xScale = d3.scaleLinear()
      .domain(d3.extent(xValues) as [number, number])
      .range([10, size - 10])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(yValues) as [number, number])
      .range([size - 10, 10])

    // Background
    g.append("rect")
      .attr("width", size)
      .attr("height", size)
      .attr("fill", "#fdfdfd")
      .attr("stroke", "#e9ecef")
      .attr("stroke-width", 1)
      .attr("rx", 4)

    // Grid lines
    const xTicks = xScale.ticks(3)
    const yTicks = yScale.ticks(3)

    g.selectAll("line.grid-x")
      .data(xTicks)
      .enter()
      .append("line")
      .attr("class", "grid-x")
      .attr("x1", xScale)
      .attr("x2", xScale)
      .attr("y1", 10)
      .attr("y2", size - 10)
      .attr("stroke", "#f0f0f0")
      .attr("stroke-width", 1)

    g.selectAll("line.grid-y")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-y")
      .attr("x1", 10)
      .attr("x2", size - 10)
      .attr("y1", yScale)
      .attr("y2", yScale)
      .attr("stroke", "#f0f0f0")
      .attr("stroke-width", 1)

    // Correlation coefficient
    if (showCorrelations) {
      const corrKey = `${variables[Math.min(i, j)]}-${variables[Math.max(i, j)]}`
      const correlation = correlations[corrKey]
      
      if (correlation !== undefined) {
        g.append("text")
          .attr("x", size - 5)
          .attr("y", 15)
          .attr("text-anchor", "end")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("fill", Math.abs(correlation) > 0.5 ? "#e74c3c" : "#666")
          .text(`r=${correlation.toFixed(2)}`)
      }
    }

    // Trend line
    const regression = calculateLinearRegression(xValues, yValues)
    const trendLine = g.append("line")
      .attr("x1", xScale(d3.min(xValues)!))
      .attr("y1", yScale(regression.slope * d3.min(xValues)! + regression.intercept))
      .attr("x2", xScale(d3.max(xValues)!))
      .attr("y2", yScale(regression.slope * d3.max(xValues)! + regression.intercept))
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "3,3")

    // Data points
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => xScale(d[xVar]))
      .attr("cy", (d: any) => yScale(d[yVar]))
      .attr("r", 3)
      .attr("fill", (d: any) => platformColors[d.platform])
      .attr("fill-opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", interactive ? "pointer" : "default")
      .on("mouseover", function(event, d: any) {
        if (!interactive) return
        setHoveredPoint(d.category)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("fill-opacity", 1)
      })
      .on("mouseout", function() {
        if (!interactive) return
        setHoveredPoint(null)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 3)
          .attr("fill-opacity", 0.7)
      })
      .on("click", function(event, d: any) {
        if (!interactive || !onCategoryChange) return
        onCategoryChange(d.category)
      })
  }

  const calculateLinearRegression = (x: number[], y: number[]) => {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  return (
    <div className="neo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <Grid3X3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-neo-pink to-neo-purple bg-clip-text text-transparent">
              散布図マトリックス分析
            </h3>
            <p className="text-sm text-gray-500">
              多変量データの相関関係を可視化
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            className="neo-card px-3 py-2 rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-neo-purple/50"
          >
            <option value="">全カテゴリ</option>
            {Array.from(new Set(data.map(d => d.name))).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix */}
      <div className="flex justify-center mb-6">
        <svg
          ref={svgRef}
          width={totalSize + 60}
          height={totalSize + 60}
          className="overflow-visible"
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        {Object.entries(platformColors).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-medium capitalize">
              {platform === 'x' ? 'X (Twitter)' : platform}
            </span>
          </div>
        ))}
      </div>

      {/* Hover Info */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-gradient-to-r from-neo-light/10 to-neo-dark/10 rounded-xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {variables.map(variable => {
                const item = scatterData.find(d => d.category === hoveredPoint)
                const value = item ? (item as any)[variable] : 0
                return (
                  <div key={variable} className="text-center">
                    <div className="font-medium text-gray-600 dark:text-gray-400">
                      {variableLabels[variable]}
                    </div>
                    <div className="text-lg font-bold text-neo-dark dark:text-neo-light">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}