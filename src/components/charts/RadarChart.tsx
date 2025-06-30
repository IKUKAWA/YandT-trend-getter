'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { Target, Layers, BarChart3, Info } from 'lucide-react'

interface RadarData {
  axis: string
  value: number
  maxValue?: number
  category?: string
  description?: string
}

interface RadarDataSet {
  name: string
  color: string
  data: RadarData[]
  opacity?: number
}

interface RadarChartProps {
  datasets: RadarDataSet[]
  width?: number
  height?: number
  levels?: number
  maxValue?: number
  labelFactor?: number
  showLegend?: boolean
  showGrid?: boolean
  animateOnLoad?: boolean
  onAxisClick?: (axis: string) => void
}

export function RadarChart({
  datasets,
  width = 500,
  height = 500,
  levels = 5,
  maxValue = 100,
  labelFactor = 1.15,
  showLegend = true,
  showGrid = true,
  animateOnLoad = true,
  onAxisClick,
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredDataset, setHoveredDataset] = useState<string | null>(null)
  const [selectedAxis, setSelectedAxis] = useState<string | null>(null)

  const margin = { top: 50, right: 50, bottom: 50, left: 50 }
  const radius = Math.min(width, height) / 2 - Math.max(...Object.values(margin))

  useEffect(() => {
    if (!svgRef.current || !datasets.length || !datasets[0].data.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // Get all axes from the first dataset
    const allAxis = datasets[0].data.map(d => d.axis)
    const total = allAxis.length
    const angleSlice = (Math.PI * 2) / total

    // Scale for the radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, maxValue])

    // Create the radial grid
    if (showGrid) {
      // Grid circles
      for (let level = 1; level <= levels; level++) {
        const levelRadius = (radius / levels) * level
        
        g.append('circle')
          .attr('class', 'grid-circle')
          .attr('r', levelRadius)
          .style('fill', 'none')
          .style('stroke', '#e5e7eb')
          .style('stroke-width', 1)
          .style('opacity', 0.5)
      }

      // Grid lines
      allAxis.forEach((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2
        
        g.append('line')
          .attr('class', 'grid-line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', radius * Math.cos(angle))
          .attr('y2', radius * Math.sin(angle))
          .style('stroke', '#e5e7eb')
          .style('stroke-width', 1)
          .style('opacity', 0.5)
      })

      // Add level labels
      for (let level = 1; level <= levels; level++) {
        const levelValue = (maxValue / levels) * level
        const levelRadius = (radius / levels) * level
        
        g.append('text')
          .attr('x', 5)
          .attr('y', -levelRadius + 3)
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('fill', '#9ca3af')
          .text(levelValue.toFixed(0))
      }
    }

    // Add axis labels
    const axisLabels = g.selectAll('.axis-label')
      .data(allAxis)
      .enter()
      .append('g')
      .attr('class', 'axis-label')

    axisLabels.append('text')
      .attr('class', 'legend')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .style('text-anchor', 'middle')
      .style('cursor', onAxisClick ? 'pointer' : 'default')
      .attr('dy', '0.35em')
      .attr('transform', (d, i) => {
        const angle = angleSlice * i - Math.PI / 2
        const x = radius * labelFactor * Math.cos(angle)
        const y = radius * labelFactor * Math.sin(angle)
        return `translate(${x}, ${y})`
      })
      .text(d => d)
      .on('click', (event, d) => {
        setSelectedAxis(d === selectedAxis ? null : d)
        if (onAxisClick) {
          onAxisClick(d)
        }
      })
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('fill', '#8b5cf6')
          .style('font-size', '14px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('fill', '#374151')
          .style('font-size', '12px')
      })

    // Draw radar areas and lines for each dataset
    datasets.forEach((dataset, datasetIndex) => {
      const datasetGroup = g.append('g')
        .attr('class', `dataset-${datasetIndex}`)

      // Create line coordinates
      const lineCoordinates = dataset.data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2
        const value = Math.min(d.value, maxValue)
        const radius = rScale(value)
        return [radius * Math.cos(angle), radius * Math.sin(angle)]
      })

      // Add closing point
      lineCoordinates.push(lineCoordinates[0])

      // Create line generator
      const radarLine = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveLinearClosed)

      // Draw the area
      const area = datasetGroup.append('path')
        .datum(lineCoordinates)
        .attr('class', 'radar-area')
        .attr('d', radarLine)
        .style('fill', dataset.color)
        .style('fill-opacity', dataset.opacity || 0.1)
        .style('stroke', 'none')

      // Draw the outline
      const outline = datasetGroup.append('path')
        .datum(lineCoordinates)
        .attr('class', 'radar-stroke')
        .attr('d', radarLine)
        .style('stroke-width', 2)
        .style('stroke', dataset.color)
        .style('fill', 'none')
        .style('opacity', 0)

      // Draw data points
      const dots = datasetGroup.selectAll('.radar-dot')
        .data(dataset.data)
        .enter()
        .append('circle')
        .attr('class', 'radar-dot')
        .attr('r', 0)
        .attr('cx', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2
          const value = Math.min(d.value, maxValue)
          const radius = rScale(value)
          return radius * Math.cos(angle)
        })
        .attr('cy', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2
          const value = Math.min(d.value, maxValue)
          const radius = rScale(value)
          return radius * Math.sin(angle)
        })
        .style('fill', dataset.color)
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('cursor', 'pointer')

      // Add hover effects to dots
      dots
        .on('mouseover', function(event, d) {
          setHoveredDataset(dataset.name)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)
            .style('stroke-width', 3)

          // Show tooltip
          const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'radar-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('opacity', 0)

          tooltip.html(`
            <div style="font-weight: bold;">${dataset.name}</div>
            <div>${d.axis}: ${d.value}</div>
            ${d.description ? `<div style="margin-top: 4px; opacity: 0.8;">${d.description}</div>` : ''}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .transition()
          .duration(200)
          .style('opacity', 1)
        })
        .on('mouseout', function() {
          setHoveredDataset(null)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4)
            .style('stroke-width', 2)

          d3.selectAll('.radar-tooltip').remove()
        })

      // Animation
      if (animateOnLoad) {
        // Animate area
        area
          .style('fill-opacity', 0)
          .transition()
          .delay(datasetIndex * 300)
          .duration(1000)
          .style('fill-opacity', dataset.opacity || 0.1)

        // Animate outline
        const totalLength = outline.node()?.getTotalLength() || 0
        outline
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .delay(datasetIndex * 300)
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)
          .style('opacity', 1)
          .on('end', () => {
            outline.attr('stroke-dasharray', 'none')
          })

        // Animate dots
        dots
          .transition()
          .delay(datasetIndex * 300 + 1000)
          .duration(500)
          .attr('r', 4)
      } else {
        outline.style('opacity', 1)
        dots.attr('r', 4)
      }

      // Hover effects for dataset
      datasetGroup
        .on('mouseover', () => {
          setHoveredDataset(dataset.name)
          
          // Highlight this dataset
          datasetGroup.selectAll('.radar-area')
            .transition()
            .duration(200)
            .style('fill-opacity', (dataset.opacity || 0.1) + 0.1)
          
          datasetGroup.selectAll('.radar-stroke')
            .transition()
            .duration(200)
            .style('stroke-width', 3)
          
          // Dim other datasets
          g.selectAll(`.dataset-${datasetIndex}`)
            .filter(function() { return this !== datasetGroup.node() })
            .transition()
            .duration(200)
            .style('opacity', 0.3)
        })
        .on('mouseout', () => {
          setHoveredDataset(null)
          
          // Reset all datasets
          g.selectAll('[class*="dataset-"]')
            .transition()
            .duration(200)
            .style('opacity', 1)
          
          datasetGroup.selectAll('.radar-area')
            .transition()
            .duration(200)
            .style('fill-opacity', dataset.opacity || 0.1)
          
          datasetGroup.selectAll('.radar-stroke')
            .transition()
            .duration(200)
            .style('stroke-width', 2)
        })
    })

  }, [datasets, width, height, levels, maxValue, labelFactor, showGrid, animateOnLoad, onAxisClick, selectedAxis])

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
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              レーダーチャート
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              多角的パフォーマンス比較
            </p>
          </div>
        </div>

        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors group">
          <Info className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Chart Container */}
      <div className="flex items-center justify-center">
        <svg ref={svgRef} className="max-w-full h-auto" />
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-6">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {datasets.map((dataset, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  hoveredDataset === dataset.name
                    ? 'bg-white/20 shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: dataset.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dataset.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <div className="text-lg font-bold text-blue-600">
            {datasets.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">比較対象</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="text-lg font-bold text-green-600">
            {datasets[0]?.data.length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">評価軸</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="text-lg font-bold text-orange-600">
            {maxValue}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">最大値</div>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="text-lg font-bold text-purple-600">
            {datasets.reduce((sum, d) => sum + d.data.reduce((s, item) => s + item.value, 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">総合スコア</div>
        </div>
      </div>

      {/* Selected Axis Info */}
      {selectedAxis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
        >
          <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
            {selectedAxis} の詳細
          </h4>
          <div className="space-y-2">
            {datasets.map((dataset, index) => {
              const axisData = dataset.data.find(d => d.axis === selectedAxis)
              return axisData ? (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dataset.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{dataset.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {axisData.value}
                  </span>
                </div>
              ) : null
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}