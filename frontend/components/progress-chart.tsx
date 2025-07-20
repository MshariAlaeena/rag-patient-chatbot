"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface ProgressData {
  date: string
  daysSmokeFree: number
  moneySaved: number
}

interface ProgressChartProps {
  data: ProgressData[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Progress Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            daysSmokeFree: {
              label: "Days Smoke-Free",
              color: "hsl(var(--chart-1))",
            },
            moneySaved: {
              label: "Money Saved ($)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis yAxisId="days" orientation="left" />
              <YAxis yAxisId="money" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="days"
                type="monotone"
                dataKey="daysSmokeFree"
                stroke="var(--color-daysSmokeFree)"
                strokeWidth={2}
                dot={{ fill: "var(--color-daysSmokeFree)", strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="money"
                type="monotone"
                dataKey="moneySaved"
                stroke="var(--color-moneySaved)"
                strokeWidth={2}
                dot={{ fill: "var(--color-moneySaved)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
