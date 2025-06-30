'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { Network, Zap, Users, Settings, Play, Pause, RotateCcw } from 'lucide-react'

interface Node {
  id: string
  name: string
  type: 'category' | 'hashtag' | 'influencer' | 'trend'
  value: number
  platform?: 'YOUTUBE' | 'TIKTOK'
  color?: string
  size?: number
  group?: string
}

interface Link {
  source: string
  target: string
  value: number
  type: 'correlation' | 'collaboration' | 'hashtag' | 'mention'
  strength?: number
}

interface NetworkGraphData {
  nodes: Node[]
  links: Link[]
}

interface NetworkGraphProps {
  data: NetworkGraphData
  width?: number
  height?: number
  nodeSize?: 'value' | 'degree' | 'fixed'
  linkStrength?: number
  showLabels?: boolean
  clustering?: boolean
  onNodeClick?: (node: Node) => void
  onLinkClick?: (link: Link) => void
}

export function NetworkGraph({
  data,
  width = 800,
  height = 600,
  nodeSize = 'value',
  linkStrength = 1,
  showLabels = true,
  clustering = true,
  onNodeClick,
  onLinkClick,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k)
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const g = svg.append('g')

    // Color scales for different node types
    const typeColors = {
      category: '#8B5CF6',
      hashtag: '#06B6D4',
      influencer: '#F59E0B',
      trend: '#10B981'
    }

    const platformColors = {
      YOUTUBE: '#FF0000',
      TIKTOK: '#000000'
    }

    // Link type styles
    const linkStyles = {
      correlation: { stroke: '#94A3B8', strokeWidth: 2, opacity: 0.6 },
      collaboration: { stroke: '#F59E0B', strokeWidth: 3, opacity: 0.8 },
      hashtag: { stroke: '#06B6D4', strokeWidth: 1, opacity: 0.4 },
      mention: { stroke: '#8B5CF6', strokeWidth: 1, opacity: 0.5 }
    }

    // Create simulation
    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links)
        .id(d => d.id)
        .strength(d => (d.strength || 1) * linkStrength)
        .distance(d => Math.max(50, 100 - d.value * 10))
      )
      .force('charge', d3.forceManyBody().strength(d => {
        const baseStrength = -300
        const sizeMultiplier = (d.size || d.value) / 10
        return baseStrength * sizeMultiplier
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        const baseRadius = nodeSize === 'value' ? Math.sqrt(d.value) * 3 + 5 :
                          nodeSize === 'degree' ? 10 : 8
        return baseRadius + 2
      }))

    if (clustering) {
      // Add clustering force
      simulation.force('cluster', () => {
        const alpha = simulation.alpha()
        data.nodes.forEach(node => {
          if (node.group) {
            const cluster = data.nodes.filter(n => n.group === node.group)
            const clusterCenter = {
              x: d3.mean(cluster, n => n.x || 0) || 0,
              y: d3.mean(cluster, n => n.y || 0) || 0
            }
            
            const dx = clusterCenter.x - (node.x || 0)
            const dy = clusterCenter.y - (node.y || 0)
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > 0) {
              const strength = alpha * 0.1
              node.vx = (node.vx || 0) + dx * strength
              node.vy = (node.vy || 0) + dy * strength
            }
          }
        })
      })
    }

    simulationRef.current = simulation

    // Create arrowhead marker
    const defs = svg.append('defs')
    const marker = defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')

    marker.append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999')

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', d => linkStyles[d.type]?.stroke || '#999')
      .style('stroke-width', d => linkStyles[d.type]?.strokeWidth || 1)
      .style('opacity', d => linkStyles[d.type]?.opacity || 0.5)
      .attr('marker-end', d => d.type === 'collaboration' ? 'url(#arrowhead)' : null)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onLinkClick) {
          onLinkClick(d)
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .style('stroke-width', (linkStyles[d.type]?.strokeWidth || 1) + 1)
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', linkStyles[d.type]?.opacity || 0.5)
          .style('stroke-width', linkStyles[d.type]?.strokeWidth || 1)
      })

    // Create nodes
    const node = g.append('g')
      .selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    // Add circles for nodes
    const circles = node.append('circle')
      .attr('r', d => {
        if (nodeSize === 'value') return Math.sqrt(d.value) * 3 + 5
        if (nodeSize === 'degree') {
          const degree = data.links.filter(l => l.source === d.id || l.target === d.id).length
          return Math.sqrt(degree) * 4 + 5
        }
        return d.size || 8
      })
      .style('fill', d => {
        if (d.color) return d.color
        if (d.platform) return platformColors[d.platform]
        return typeColors[d.type] || '#8B5CF6'
      })
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('opacity', 0.9)

    // Add node event handlers
    node
      .on('click', (event, d) => {
        setSelectedNode(d)
        if (onNodeClick) {
          onNodeClick(d)
        }
      })
      .on('mouseover', function(event, d) {
        setHoveredNode(d)
        
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', (d.size || 8) * 1.3)
          .style('stroke-width', 4)

        // Highlight connected links
        link
          .style('opacity', l => 
            (l.source === d.id || l.target === d.id) ? 1 : 0.1
          )
      })
      .on('mouseout', function(event, d) {
        setHoveredNode(null)
        
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d => {
            if (nodeSize === 'value') return Math.sqrt(d.value) * 3 + 5
            if (nodeSize === 'degree') {
              const degree = data.links.filter(l => l.source === d.id || l.target === d.id).length
              return Math.sqrt(degree) * 4 + 5
            }
            return d.size || 8
          })
          .style('stroke-width', 2)

        // Reset link opacity
        link
          .style('opacity', d => linkStyles[d.type]?.opacity || 0.5)
      })

    // Add labels
    if (showLabels) {
      const labels = node.append('text')
        .text(d => d.name)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central')
        .style('pointer-events', 'none')
        .attr('dy', d => (d.size || 8) + 15)

      // Add background for labels
      const labelBgs = node.insert('rect', 'text')
        .attr('x', d => -(d.name.length * 3))
        .attr('y', d => (d.size || 8) + 8)
        .attr('width', d => d.name.length * 6)
        .attr('height', 14)
        .attr('rx', 7)
        .style('fill', 'rgba(255, 255, 255, 0.8)')
        .style('stroke', 'rgba(0, 0, 0, 0.1)')
        .style('pointer-events', 'none')
    }

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Start simulation
    simulation.alpha(1).restart()

  }, [data, width, height, nodeSize, linkStrength, showLabels, clustering, onNodeClick, onLinkClick])

  const handlePlayPause = () => {
    if (simulationRef.current) {
      if (isPlaying) {
        simulationRef.current.stop()
      } else {
        simulationRef.current.alpha(0.3).restart()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart()
      setSelectedNode(null)
      setHoveredNode(null)
    }
  }

  // Calculate network statistics
  const networkStats = {
    nodes: data.nodes.length,
    links: data.links.length,
    density: (2 * data.links.length) / (data.nodes.length * (data.nodes.length - 1)),
    avgDegree: data.links.length > 0 ? (2 * data.links.length) / data.nodes.length : 0,
    components: 1 // Simplified
  }

  const typeDistribution = data.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
            <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ネットワークグラフ
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              カテゴリとトレンドの関係性
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="text-xs text-gray-500 px-2">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <svg 
          ref={svgRef} 
          className="w-full bg-gray-50/50 dark:bg-gray-900/50"
          style={{ minHeight: height }}
        />

        {/* Node Info Panel */}
        {(selectedNode || hoveredNode) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg max-w-xs"
          >
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">
                {(selectedNode || hoveredNode)?.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                タイプ: {(selectedNode || hoveredNode)?.type}
              </div>
              {(selectedNode || hoveredNode)?.platform && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  プラットフォーム: {(selectedNode || hoveredNode)?.platform}
                </div>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                値: {(selectedNode || hoveredNode)?.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                接続数: {data.links.filter(l => 
                  l.source === (selectedNode || hoveredNode)?.id || 
                  l.target === (selectedNode || hoveredNode)?.id
                ).length}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* Node Types */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ノードタイプ
          </h4>
          <div className="space-y-1">
            {Object.entries(typeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: type === 'category' ? '#8B5CF6' :
                                   type === 'hashtag' ? '#06B6D4' :
                                   type === 'influencer' ? '#F59E0B' : '#10B981'
                  }}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {type} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Network Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ネットワーク統計
          </h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>ノード数: {networkStats.nodes}</div>
            <div>エッジ数: {networkStats.links}</div>
            <div>平均次数: {networkStats.avgDegree.toFixed(1)}</div>
            <div>密度: {(networkStats.density * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}