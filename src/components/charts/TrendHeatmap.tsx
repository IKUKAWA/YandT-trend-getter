'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { Thermometer, Calendar, TrendingUp, Info } from 'lucide-react'

interface HeatmapData {
  date: string
  hour: number
  platform: 'YOUTUBE' | 'TIKTOK'
  value: number
  count: number
  category?: string
}

interface TrendHeatmapProps {
  data: HeatmapData[]
  width?: number
  height?: number
  platform?: 'YOUTUBE' | 'TIKTOK' | 'ALL'
  metric?: 'engagement' | 'views' | 'posts'
  timeRange?: 'week' | 'month' | 'quarter'
  showLegend?: boolean
  onCellClick?: (data: HeatmapData) => void
}

export function TrendHeatmap({
  data,
  width = 800,
  height = 400,
  platform = 'ALL',
  metric = 'engagement',
  timeRange = 'week',
  showLegend = true,
  onCellClick,
}: TrendHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState(platform)

  const margin = { top: 60, right: 100, bottom: 80, left: 80 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    // Filter data by platform
    const filteredData = selectedPlatform === 'ALL' 
      ? data 
      : data.filter(d => d.platform === selectedPlatform)

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Get unique dates and hours
    const dates = [...new Set(filteredData.map(d => d.date))].sort()
    const hours = [...new Set(filteredData.map(d => d.hour))].sort((a, b) => a - b)

    // Create scales
    const xScale = d3.scaleBand()
      .domain(dates)
      .range([0, chartWidth])
      .padding(0.05)

    const yScale = d3.scaleBand()
      .domain(hours.map(String))
      .range([0, chartHeight])
      .padding(0.05)

    // Color scale
    const maxValue = d3.max(filteredData, d => d.value) || 1
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, maxValue])

    // Alternative color scales for different metrics
    const colorScales = {
      engagement: d3.scaleSequential(d3.interpolatePlasma).domain([0, maxValue]),
      views: d3.scaleSequential(d3.interpolateViridis).domain([0, maxValue]),
      posts: d3.scaleSequential(d3.interpolateBlues).domain([0, maxValue])
    }

    const currentColorScale = colorScales[metric] || colorScale

    // Create data map for easy lookup
    const dataMap = new Map()
    filteredData.forEach(d => {
      dataMap.set(`${d.date}-${d.hour}`, d)
    })

    // Draw heatmap cells
    const cells = g.selectAll('.cell')
      .data(dates.flatMap(date => 
        hours.map(hour => ({
          date,
          hour,
          data: dataMap.get(`${date}-${hour}`)
        }))
      ))
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.date) || 0)
      .attr('y', d => yScale(String(d.hour)) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.data ? currentColorScale(d.data.value) : '#f0f0f0')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 20)
      .style('opacity', 1)

    // Add hover effects
    cells
      .on('mouseover', function(event, d) {
        if (d.data) {
          setHoveredCell(d.data)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke-width', 3)
            .attr('stroke', '#ffffff')
            .style('filter', 'brightness(1.2)')

          // Show tooltip
          if (tooltipRef.current) {
            const rect = event.target.getBoundingClientRect()
            tooltipRef.current.style.left = `${rect.right + 10}px`
            tooltipRef.current.style.top = `${rect.top}px`
            tooltipRef.current.style.opacity = '1'
            tooltipRef.current.style.visibility = 'visible'
          }
        }
      })
      .on('mouseout', function() {
        setHoveredCell(null)
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 1)
          .style('filter', 'none')

        // Hide tooltip
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0'
          tooltipRef.current.style.visibility = 'hidden'
        }
      })
      .on('click', function(event, d) {
        if (d.data && onCellClick) {
          onCellClick(d.data)
        }
      })

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => {
        const date = new Date(d)
        return d3.timeFormat('%m/%d')(date)
      })

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d}:00`)

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
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
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('時間')

    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('日付')

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(`${selectedPlatform === 'ALL' ? '全プラットフォーム' : selectedPlatform} - ${
        metric === 'engagement' ? 'エンゲージメント' :
        metric === 'views' ? '視聴数' : '投稿数'
      }ヒートマップ`)

    // Add color legend
    if (showLegend) {
      const legendWidth = 200
      const legendHeight = 20
      const legendX = chartWidth - legendWidth
      const legendY = -20

      const legendScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, legendWidth])

      const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format('.0f'))

      // Create gradient
      const defs = svg.append('defs')
      const gradient = defs.append('linearGradient')
        .attr('id', 'heatmap-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')

      const steps = 100
      for (let i = 0; i <= steps; i++) {
        gradient.append('stop')
          .attr('offset', `${(i / steps) * 100}%`)
          .attr('stop-color', currentColorScale(maxValue * i / steps))
      }

      // Add legend rectangle
      g.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#heatmap-gradient)')
        .attr('stroke', '#ccc')

      // Add legend axis
      g.append('g')
        .attr('transform', `translate(${legendX}, ${legendY + legendHeight})`)
        .call(legendAxis)
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#666')
    }

  }, [data, selectedPlatform, metric, chartWidth, chartHeight, width, height, showLegend, onCellClick])

  const metricLabels = {
    engagement: 'エンゲージメント率',
    views: '視聴数',
    posts: '投稿数'
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
            <Thermometer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              トレンドヒートマップ
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              時間帯別の{metricLabels[metric]}分布
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
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

          {/* Info Button */}
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors group">
            <Info className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <svg ref={svgRef} className="w-full h-auto" />
        
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="fixed z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm opacity-0 invisible transition-all"
          style={{ pointerEvents: 'none' }}
        >
          {hoveredCell && (
            <div className="space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {new Date(hoveredCell.date).toLocaleDateString('ja-JP')} {hoveredCell.hour}:00
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                プラットフォーム: {hoveredCell.platform}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {metricLabels[metric]}: {hoveredCell.value.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                投稿数: {hoveredCell.count.toLocaleString()}
              </div>
              {hoveredCell.category && (
                <div className="text-gray-600 dark:text-gray-400">
                  カテゴリ: {hoveredCell.category}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <div className="text-lg font-bold text-blue-600">
            {data.filter(d => selectedPlatform === 'ALL' || d.platform === selectedPlatform).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">データポイント</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="text-lg font-bold text-green-600">
            {Math.round(d3.mean(data.filter(d => selectedPlatform === 'ALL' || d.platform === selectedPlatform), d => d.value) || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">平均値</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="text-lg font-bold text-orange-600">
            {Math.round(d3.max(data.filter(d => selectedPlatform === 'ALL' || d.platform === selectedPlatform), d => d.value) || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">最大値</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="text-lg font-bold text-purple-600">
            {[...new Set(data.map(d => d.date))].length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">対象日数</div>
        </div>
      </div>
    </motion.div>
  )
}