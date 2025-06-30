'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface TrendChartProps {
  data: Array<{
    category: string
    youtube: number
    tiktok: number
  }>
  type?: 'bar' | 'pie'
}

const COLORS = ['#FF0000', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']

export function TrendChart({ data, type = 'bar' }: TrendChartProps) {
  if (type === 'pie') {
    const pieData = data.map(item => ({
      name: item.category,
      value: item.youtube + item.tiktok,
      youtube: item.youtube,
      tiktok: item.tiktok,
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Total Views']} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value: number) => [value.toLocaleString(), '']} />
        <Bar dataKey="youtube" fill="#FF0000" name="YouTube" />
        <Bar dataKey="tiktok" fill="#000000" name="TikTok" />
      </BarChart>
    </ResponsiveContainer>
  )
}