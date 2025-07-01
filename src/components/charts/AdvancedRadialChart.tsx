'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import {
  Zap,
  Target,
  TrendingUp,
  Circle,
  RotateCcw,
  Settings
} from 'lucide-react'

interface PlatformData {
  name: string
  youtube: number
  tiktok: number
  x: number
  instagram: number
}

interface RadialData {
  category: string
  value: number
  percentage: number
  platform: 'youtube' | 'tiktok' | 'x' | 'instagram'
  engagement: number
  growth: number
}

interface AdvancedRadialChartProps {
  data?: PlatformData[]
  type?: 'sunburst' | 'circular' | 'spiral' | 'chord'
  selectedPlatform?: string
  selectedCategory?: string
  showLabels?: boolean
  showValues?: boolean
  animated?: boolean
  interactive?: boolean
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

// Transform platform data to radial data
const transformToRadialData = (platformData: PlatformData[]): RadialData[] => {
  const radialData: RadialData[] = []
  const platforms: Array<keyof Omit<PlatformData, 'name'>> = ['youtube', 'tiktok', 'x', 'instagram']
  
  platformData.forEach(item => {
    platforms.forEach(platform => {
      const value = item[platform]
      const total = item.youtube + item.tiktok + item.x + item.instagram
      const percentage = total > 0 ? (value / total) * 100 : 0
      
      radialData.push({
        category: item.name,
        value,
        percentage,
        platform: platform as 'youtube' | 'tiktok' | 'x' | 'instagram',
        engagement: Math.random() * 5 + 5, // Mock engagement
        growth: Math.random() * 20 + 5 // Mock growth
      })
    })
  })
  
  return radialData
}

const platformColors: Record<string, string> = {
  youtube: '#FF0000',
  tiktok: '#000000',
  x: '#1DA1F2',
  instagram: '#E4405F'
}

export function AdvancedRadialChart({
  data = mockPlatformData,
  type = 'sunburst',
  selectedPlatform = '',
  selectedCategory = '',
  showLabels = true,
  showValues = true,
  animated = true,
  interactive = true
}: AdvancedRadialChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)

  const width = 400
  const height = 400
  const radius = Math.min(width, height) / 2 - 40

  // Transform platform data to radial data
  const radialData = useMemo(() => {
    let filteredData = data
    
    // Filter by category if selected
    if (selectedCategory) {
      filteredData = data.filter(item => item.name === selectedCategory)
    }
    
    return transformToRadialData(filteredData)
  }, [data, selectedCategory])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)

    if (type === 'sunburst') {
      renderSunburst(g)
    } else if (type === 'circular') {
      renderCircular(g)
    } else if (type === 'spiral') {
      renderSpiral(g)
    } else if (type === 'chord') {
      renderChord(g)
    }
  }, [radialData, type, selectedSegment, rotation])

  const renderSunburst = (g: any) => {
    const innerRadius = 60
    const outerRadius = radius

    // Create hierarchical data
    const hierarchyData = {
      name: 'root',
      children: radialData.map(d => ({
        name: d.category,
        value: d.value,
        platform: d.platform,
        engagement: d.engagement,
        growth: d.growth
      }))
    }

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    const partition = d3.partition<any>()
      .size([2 * Math.PI, outerRadius - innerRadius])

    partition(root)

    const arc = d3.arc<any>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => innerRadius + d.y0)
      .outerRadius(d => innerRadius + d.y1)
      .cornerRadius(3)

    const colorScale = d3.scaleOrdinal()
      .domain(radialData.map(d => d.category))
      .range(radialData.map(d => platformColors[d.platform]))

    g.selectAll("path")
      .data(root.descendants().filter(d => d.depth > 0))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d: any) => colorScale(d.data.name))
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", interactive ? "pointer" : "default")
      .on("mouseover", function(event, d: any) {
        if (!interactive) return
        setHoveredSegment(d.data.name)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill-opacity", 1)
          .attr("stroke-width", 3)
      })
      .on("mouseout", function(event, d: any) {
        if (!interactive) return
        setHoveredSegment(null)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill-opacity", 0.8)
          .attr("stroke-width", 2)
      })
      .on("click", function(event, d: any) {
        if (!interactive) return
        setSelectedSegment(selectedSegment === d.data.name ? null : d.data.name)
      })

    if (animated) {
      g.selectAll("path")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay((d: any, i: number) => i * 100)
        .style("opacity", 1)
    }

    // Add labels
    if (showLabels) {
      g.selectAll("text")
        .data(root.descendants().filter(d => d.depth > 0))
        .enter()
        .append("text")
        .attr("transform", (d: any) => {
          const angle = (d.x0 + d.x1) / 2
          const radius = (innerRadius + d.y0 + innerRadius + d.y1) / 2
          return `rotate(${angle * 180 / Math.PI - 90}) translate(${radius}, 0) rotate(${angle > Math.PI ? 180 : 0})`
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => (d.x0 + d.x1) / 2 > Math.PI ? "end" : "start")
        .text((d: any) => d.data.name)
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#333")
        .style("pointer-events", "none")
    }
  }

  const renderCircular = (g: any) => {
    const pie = d3.pie<RadialData>()
      .value(d => d.value)
      .sort(null)
      .startAngle(rotation * Math.PI / 180)
      .endAngle(rotation * Math.PI / 180 + 2 * Math.PI)

    const arc = d3.arc<d3.PieArcDatum<RadialData>>()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.8)
      .cornerRadius(8)

    const arcs = pie(radialData)

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d: any) => platformColors[d.data.platform])
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("cursor", interactive ? "pointer" : "default")
      .on("mouseover", function(event, d: any) {
        if (!interactive) return
        setHoveredSegment(d.data.category)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", d3.arc<d3.PieArcDatum<RadialData>>()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 0.85)
            .cornerRadius(8)
          )
      })
      .on("mouseout", function(event, d: any) {
        if (!interactive) return
        setHoveredSegment(null)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc)
      })
      .on("click", function(event, d: any) {
        if (!interactive) return
        setSelectedSegment(selectedSegment === d.data.category ? null : d.data.category)
      })

    // Add percentage labels
    if (showValues) {
      g.selectAll("text")
        .data(arcs)
        .enter()
        .append("text")
        .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .text((d: any) => `${d.data.percentage}%`)
    }
  }

  const renderSpiral = (g: any) => {
    const spiralGenerator = (t: number) => {
      const r = 20 + t * 2
      const angle = t * 0.5
      return [r * Math.cos(angle), r * Math.sin(angle)]
    }

    radialData.forEach((d, i) => {
      const t = i * 10
      const [x, y] = spiralGenerator(t)
      
      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", Math.sqrt(d.value) / 10)
        .attr("fill", platformColors[d.platform])
        .attr("fill-opacity", 0.7)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", interactive ? "pointer" : "default")
        .on("mouseover", function() {
          if (!interactive) return
          setHoveredSegment(d.category)
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", Math.sqrt(d.value) / 8)
            .attr("fill-opacity", 1)
        })
        .on("mouseout", function() {
          if (!interactive) return
          setHoveredSegment(null)
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", Math.sqrt(d.value) / 10)
            .attr("fill-opacity", 0.7)
        })

      if (showLabels) {
        g.append("text")
          .attr("x", x)
          .attr("y", y + Math.sqrt(d.value) / 10 + 15)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "#333")
          .text(d.category)
      }
    })
  }

  const renderChord = (g: any) => {
    // Create matrix for chord diagram
    const matrix = radialData.map(d => 
      radialData.map(d2 => 
        d.platform === d2.platform ? d.value * 0.1 : Math.random() * d.value * 0.05
      )
    )

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)

    const arc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.8)

    const ribbon = d3.ribbon()
      .radius(radius * 0.65)

    const chords = chord(matrix)

    // Draw groups
    g.selectAll("g.group")
      .data(chords.groups)
      .enter()
      .append("g")
      .attr("class", "group")
      .append("path")
      .attr("d", arc)
      .attr("fill", (d: any) => platformColors[radialData[d.index].platform])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)

    // Draw ribbons
    g.selectAll("path.ribbon")
      .data(chords)
      .enter()
      .append("path")
      .attr("class", "ribbon")
      .attr("d", ribbon)
      .attr("fill", (d: any) => platformColors[radialData[d.source.index].platform])
      .attr("fill-opacity", 0.6)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
  }

  return (
    <div className="neo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 neo-gradient rounded-xl">
            <Circle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-neo-pink to-neo-purple bg-clip-text text-transparent">
              {type === 'sunburst' ? 'サンバースト' : 
               type === 'circular' ? '円形' : 
               type === 'spiral' ? 'スパイラル' : 'コード'}
              ラジアルチャート
            </h3>
            <p className="text-sm text-gray-500">
              カテゴリ別データの放射状可視化
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {type === 'circular' && (
            <button
              onClick={() => setRotation(rotation + 45)}
              className="neo-button p-2 rounded-lg hover:scale-105 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
        />
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.slice(0, 4).map((item, index) => {
          const total = item.youtube + item.tiktok + item.x + item.instagram
          const primaryPlatform = ['youtube', 'tiktok', 'x', 'instagram']
            .reduce((max, platform) => item[max as keyof typeof item] > item[platform as keyof typeof item] ? max : platform)
          
          return (
            <motion.div
              key={item.name}
              className={`text-center p-3 rounded-xl transition-all ${
                hoveredSegment === item.name
                  ? 'bg-neo-light/20 scale-105'
                  : selectedSegment === item.name
                  ? 'bg-neo-light/10'
                  : 'hover:bg-neo-light/5'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: platformColors[primaryPlatform] }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-lg font-bold text-neo-dark dark:text-neo-light">
                {total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                主要: {primaryPlatform}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Hover Info */}
      <AnimatePresence>
        {hoveredSegment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 bg-gradient-to-r from-neo-light/10 to-neo-dark/10 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{hoveredSegment}</span>
              <div className="flex items-center gap-4 text-sm">
                {data.find(d => d.name === hoveredSegment) && (
                  <>
                    <span>YouTube: {data.find(d => d.name === hoveredSegment)?.youtube}</span>
                    <span>TikTok: {data.find(d => d.name === hoveredSegment)?.tiktok}</span>
                    <span>X: {data.find(d => d.name === hoveredSegment)?.x}</span>
                    <span>Instagram: {data.find(d => d.name === hoveredSegment)?.instagram}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}