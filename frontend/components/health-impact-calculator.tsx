"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart, TreesIcon as Lungs, Activity, Brain } from "lucide-react"

interface HealthImpactProps {
  daysSmokeFree: number
  cigarettesPerDay?: number
}

export function HealthImpactCalculator({ daysSmokeFree, cigarettesPerDay = 20 }: HealthImpactProps) {
  const calculateHealthMetrics = () => {
    const cigarettesAvoided = daysSmokeFree * cigarettesPerDay
    const minutesOfLifeRegained = cigarettesAvoided * 11
    const hoursRegained = Math.floor(minutesOfLifeRegained / 60)
    const carbonMonoxideReduction = Math.min(100, (daysSmokeFree / 1) * 100)
    const lungCapacityImprovement = Math.min(30, (daysSmokeFree / 30) * 30)
    const circulationImprovement = Math.min(100, (daysSmokeFree / 14) * 100)
    const tasteSmellImprovement = Math.min(100, (daysSmokeFree / 7) * 100)

    return {
      cigarettesAvoided,
      hoursRegained,
      carbonMonoxideReduction,
      lungCapacityImprovement,
      circulationImprovement,
      tasteSmellImprovement,
    }
  }

  const metrics = calculateHealthMetrics()

  const healthIndicators = [
    {
      title: "Carbon Monoxide Cleared",
      description: "CO levels in blood normalized",
      progress: metrics.carbonMonoxideReduction,
      icon: Lungs,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Circulation Improved",
      description: "Blood flow enhancement",
      progress: metrics.circulationImprovement,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Lung Capacity",
      description: "Breathing improvement",
      progress: metrics.lungCapacityImprovement,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Taste & Smell",
      description: "Sensory recovery",
      progress: metrics.tasteSmellImprovement,
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Health Impact Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{metrics.cigarettesAvoided.toLocaleString()}</div>
            <div className="text-sm text-green-600">Cigarettes avoided</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{metrics.hoursRegained}h</div>
            <div className="text-sm text-blue-600">Life regained</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-slate-900">Health Recovery Progress</h3>
          {healthIndicators.map((indicator) => {
            const Icon = indicator.icon
            return (
              <div key={indicator.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${indicator.bgColor}`}>
                      <Icon className={`w-4 h-4 ${indicator.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{indicator.title}</div>
                      <div className="text-xs text-slate-600">{indicator.description}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{Math.round(indicator.progress)}%</div>
                </div>
                <Progress value={indicator.progress} className="h-2" />
              </div>
            )
          })}
        </div>

        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium">
            🎉 Amazing progress! Your body is healing more every day you stay smoke-free.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
