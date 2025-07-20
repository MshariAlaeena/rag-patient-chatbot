"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp, Clock } from "lucide-react"

interface CravingData {
  hour: string
  count: number
  intensity: number
}

interface CravingAnalyticsProps {
  data?: CravingData[]
}

export function CravingAnalytics({ data }: CravingAnalyticsProps) {
  // Mock data for demonstration
  const mockData: CravingData[] = [
    { hour: "6 AM", count: 2, intensity: 4 },
    { hour: "8 AM", count: 5, intensity: 6 },
    { hour: "10 AM", count: 3, intensity: 5 },
    { hour: "12 PM", count: 7, intensity: 8 },
    { hour: "2 PM", count: 4, intensity: 6 },
    { hour: "4 PM", count: 6, intensity: 7 },
    { hour: "6 PM", count: 8, intensity: 9 },
    { hour: "8 PM", count: 5, intensity: 6 },
    { hour: "10 PM", count: 3, intensity: 4 },
  ]

  const chartData = data || mockData

  const getBarColor = (intensity: number) => {
    if (intensity <= 3) return "#10b981" // green
    if (intensity <= 6) return "#f59e0b" // yellow
    return "#ef4444" // red
  }

  const peakHour = chartData.reduce((prev, current) => (prev.count > current.count ? prev : current))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Craving Patterns
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          <span>
            Peak time: {peakHour.hour} ({peakHour.count} cravings)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Craving Count",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-slate-600">Cravings: {data.count}</p>
                        <p className="text-sm text-slate-600">Avg Intensity: {data.intensity}/10</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.intensity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low intensity (1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium intensity (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High intensity (7-10)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
