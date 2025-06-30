'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { TrendingUp, Calendar, BarChart3, Zap, Eye, Heart, MessageCircle } from 'lucide-react'

interface TimeSeriesData {
  date: Date
  value: number
  category?: string
  platform?: 'YOUTUBE' | 'TIKTOK'
  metric?: 'views' | 'likes' | 'comments' | 'engagement'
  additional?: {
    volume?: number
    sentiment?: number
    viral_score?: number
  }
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  width?: number
  height?: number
  showBrushSelection?: boolean
  showMultipleMetrics?: boolean
  animateOnLoad?: boolean
  showPrediction?: boolean
  predictionData?: TimeSeriesData[]
  onTimeRangeChange?: (startDate: Date, endDate: Date) => void
  onDataPointClick?: (data: TimeSeriesData) => void
}

export function TimeSeriesChart({
  data,
  width = 800,
  height = 400,
  showBrushSelection = true,
  showMultipleMetrics = false,
  animateOnLoad = true,
  showPrediction = false,
  predictionData = [],
  onTimeRangeChange,
  onDataPointClick,
}: TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const brushRef = useRef<SVGGElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'comments' | 'engagement'>('views')
  const [selectedPlatform, setSelectedPlatform] = useState<'ALL' | 'YOUTUBE' | 'TIKTOK'>('ALL')
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesData | null>(null)
  const [zoomedRange, setZoomedRange] = useState<[Date, Date] | null>(null)

  const margin = { top: 20, right: 80, bottom: showBrushSelection ? 100 : 50, left: 80 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom - (showBrushSelection ? 60 : 0)
  const brushHeight = 60

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    // Filter data by platform and metric
    const filteredData = data.filter(d => {
      const platformMatch = selectedPlatform === 'ALL' || d.platform === selectedPlatform
      const hasMetric = d.metric === selectedMetric || !d.metric
      return platformMatch && hasMetric
    })

    if (!filteredData.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date) as [Date, Date])
      .range([0, chartWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.value) || 1])
      .nice()
      .range([chartHeight, 0])

    // Create line generator
    const line = d3.line<TimeSeriesData>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Add gradient definition
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', chartHeight)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#8B5CF6')
      .attr('stop-opacity', 0.8)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8B5CF6')
      .attr('stop-opacity', 0.1)

    // Add area under the line
    const area = d3.area<TimeSeriesData>()
      .x(d => xScale(d.date))
      .y0(chartHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    const areaPath = g.append('path')
      .datum(filteredData)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', 'url(#area-gradient)')
      .style('opacity', 0)

    // Add main line
    const linePath = g.append('path')
      .datum(filteredData)
      .attr('class', 'line')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', '#8B5CF6')
      .style('stroke-width', 3)
      .style('opacity', 0)

    // Add prediction line if available
    if (showPrediction && predictionData.length) {
      const predictionLine = g.append('path')
        .datum(predictionData)
        .attr('class', 'prediction-line')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', '#F59E0B')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5')
        .style('opacity', 0.7)
    }

    // Add dots for data points
    const dots = g.selectAll('.dot')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .style('fill', d => {
        if (d.platform === 'YOUTUBE') return '#FF0000'
        if (d.platform === 'TIKTOK') return '#000000'
        return '#8B5CF6'
      })
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')

    // Add hover and click interactions
    dots
      .on('mouseover', function(event, d) {
        setHoveredPoint(d)
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .style('stroke-width', 4)

        // Show tooltip line
        g.append('line')
          .attr('class', 'tooltip-line')
          .attr('x1', xScale(d.date))
          .attr('x2', xScale(d.date))
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .style('stroke', '#999')
          .style('stroke-dasharray', '2,2')
          .style('opacity', 0.7)
      })
      .on('mouseout', function(event, d) {
        setHoveredPoint(null)
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4)
          .style('stroke-width', 2)

        g.selectAll('.tooltip-line').remove()
      })
      .on('click', function(event, d) {
        if (onDataPointClick) {
          onDataPointClick(d)
        }
      })

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%m/%d'))

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('.2s'))

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text(getMetricLabel(selectedMetric))

    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('日付')

    // Add brush for time range selection
    if (showBrushSelection) {
      const brushG = svg.append('g')
        .attr('class', 'brush')
        .attr('transform', `translate(${margin.left}, ${height - brushHeight})`)

      const brushXScale = d3.scaleTime()
        .domain(xScale.domain())
        .range([0, chartWidth])

      const brushYScale = d3.scaleLinear()
        .domain(yScale.domain())
        .range([brushHeight - 20, 0])

      // Add mini chart for brush
      const brushLine = d3.line<TimeSeriesData>()
        .x(d => brushXScale(d.date))
        .y(d => brushYScale(d.value))
        .curve(d3.curveMonotoneX)

      brushG.append('path')
        .datum(filteredData)
        .attr('d', brushLine)
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', 1)

      // Add brush behavior
      const brush = d3.brushX()
        .extent([[0, 0], [chartWidth, brushHeight - 20]])
        .on('brush end', (event) => {
          if (!event.selection) return
          
          const [x0, x1] = event.selection
          const range: [Date, Date] = [brushXScale.invert(x0), brushXScale.invert(x1)]
          setZoomedRange(range)
          
          if (onTimeRangeChange) {
            onTimeRangeChange(range[0], range[1])
          }
        })

      brushG.call(brush)
    }

    // Animation
    if (animateOnLoad) {
      const totalLength = linePath.node()?.getTotalLength() || 0

      linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .style('opacity', 1)
        .on('end', () => {
          linePath.attr('stroke-dasharray', 'none')
        })

      areaPath
        .transition()
        .delay(500)
        .duration(1500)
        .style('opacity', 0.6)

      dots
        .transition()
        .delay((d, i) => i * 50 + 1000)
        .duration(300)
        .attr('r', 4)
    } else {
      linePath.style('opacity', 1)
      areaPath.style('opacity', 0.6)
      dots.attr('r', 4)
    }

    // Add trend indicators
    const trendData = calculateTrend(filteredData)
    if (trendData.direction !== 'stable') {
      const trendIcon = g.append('g')
        .attr('transform', `translate(${chartWidth - 30}, 20)`)

      trendIcon.append('circle')
        .attr('r', 15)
        .style('fill', trendData.direction === 'up' ? '#10B981' : '#EF4444')
        .style('opacity', 0.2)

      trendIcon.append('text')
        .text(trendData.direction === 'up' ? '↗' : '↘')
        .style('font-size', '16px')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central')
        .style('fill', trendData.direction === 'up' ? '#10B981' : '#EF4444')
    }

  }, [data, selectedMetric, selectedPlatform, width, height, showBrushSelection, animateOnLoad, showPrediction, predictionData])

  const getMetricLabel = (metric: string) => {
    const labels = {
      views: '視聴数',
      likes: 'いいね数',
      comments: 'コメント数',
      engagement: 'エンゲージメント率'
    }
    return labels[metric as keyof typeof labels] || '値'
  }

  const getMetricIcon = (metric: string) => {
    const icons = {
      views: Eye,
      likes: Heart,
      comments: MessageCircle,
      engagement: Zap
    }
    return icons[metric as keyof typeof icons] || BarChart3
  }

  const calculateTrend = (data: TimeSeriesData[]) => {
    if (data.length < 2) return { direction: 'stable', change: 0 }
    
    const first = data[0].value
    const last = data[data.length - 1].value
    const change = ((last - first) / first) * 100
    
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      change: Math.abs(change)
    }
  }

  // Calculate statistics
  const stats = {
    total: data.length,
    avg: d3.mean(data, d => d.value) || 0,
    max: d3.max(data, d => d.value) || 0,
    min: d3.min(data, d => d.value) || 0,
    trend: calculateTrend(data.filter(d => 
      selectedPlatform === 'ALL' || d.platform === selectedPlatform
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              時系列トレンド分析
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getMetricLabel(selectedMetric)}の推移
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 p-1 bg-white/30 dark:bg-gray-700/30 rounded-lg">
            {(['views', 'likes', 'comments', 'engagement'] as const).map((metric) => {
              const Icon = getMetricIcon(metric)
              return (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    selectedMetric === metric
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                      : 'hover:bg-white/20 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {getMetricLabel(metric)}
                </button>
              )
            })}
          </div>

          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 text-sm"
          >
            <option value="ALL">全プラットフォーム</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="TIKTOK">TikTok</option>
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <svg ref={svgRef} className="w-full" />
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-sm z-10">
            <div className="space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {hoveredPoint.date.toLocaleDateString('ja-JP')}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {getMetricLabel(selectedMetric)}: {hoveredPoint.value.toLocaleString()}
              </div>
              {hoveredPoint.platform && (
                <div className="text-gray-600 dark:text-gray-400">
                  プラットフォーム: {hoveredPoint.platform}
                </div>
              )}
              {hoveredPoint.category && (
                <div className="text-gray-600 dark:text-gray-400">
                  カテゴリ: {hoveredPoint.category}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <div className="text-lg font-bold text-blue-600">
            {stats.max.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">最大値</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="text-lg font-bold text-green-600">
            {Math.round(stats.avg).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">平均値</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="text-lg font-bold text-orange-600">
            {stats.min.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">最小値</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-purple-600">
              {stats.trend.change.toFixed(1)}%
            </div>
            <div className={`text-sm ${
              stats.trend.direction === 'up' ? 'text-green-600' :
              stats.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stats.trend.direction === 'up' ? '↗' : 
               stats.trend.direction === 'down' ? '↘' : '→'}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">トレンド</div>
        </div>
      </div>
    </motion.div>
  )
}