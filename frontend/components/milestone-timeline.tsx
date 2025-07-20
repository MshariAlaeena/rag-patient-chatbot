"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, Heart, Zap, TreesIcon as Lungs, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface Milestone {
  id: string
  title: string
  description: string
  timeframe: string
  achieved: boolean
  icon: React.ComponentType<{ className?: string }>
  category: "immediate" | "short" | "medium" | "long"
}

interface MilestoneTimelineProps {
  daysSmokeFree: number
}

export function MilestoneTimeline({ daysSmokeFree }: MilestoneTimelineProps) {
  const milestones: Milestone[] = [
    {
      id: "1",
      title: "Heart Rate Normalized",
      description: "Your heart rate and blood pressure drop to normal levels",
      timeframe: "20 minutes",
      achieved: daysSmokeFree >= 1,
      icon: Heart,
      category: "immediate",
    },
    {
      id: "2",
      title: "Carbon Monoxide Cleared",
      description: "Carbon monoxide levels in blood return to normal",
      timeframe: "12 hours",
      achieved: daysSmokeFree >= 1,
      icon: Lungs,
      category: "immediate",
    },
    {
      id: "3",
      title: "Circulation Improved",
      description: "Blood circulation improves throughout your body",
      timeframe: "2-12 weeks",
      achieved: daysSmokeFree >= 3,
      icon: Zap,
      category: "short",
    },
    {
      id: "4",
      title: "Taste & Smell Enhanced",
      description: "Your sense of taste and smell become sharper",
      timeframe: "1-9 months",
      achieved: daysSmokeFree >= 7,
      icon: Brain,
      category: "short",
    },
    {
      id: "5",
      title: "Lung Function Boost",
      description: "Lung capacity increases by up to 30%",
      timeframe: "1-9 months",
      achieved: daysSmokeFree >= 14,
      icon: Lungs,
      category: "medium",
    },
    {
      id: "6",
      title: "Stroke Risk Reduced",
      description: "Risk of stroke reduced to that of a non-smoker",
      timeframe: "5-15 years",
      achieved: false,
      icon: Heart,
      category: "long",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "immediate":
        return "bg-green-100 text-green-800"
      case "short":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-purple-100 text-purple-800"
      case "long":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Health Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-all",
                    milestone.achieved ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      milestone.achieved ? "bg-green-500" : "bg-slate-300",
                    )}
                  >
                    {milestone.achieved ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={cn("font-medium", milestone.achieved ? "text-green-900" : "text-slate-700")}>
                        {milestone.title}
                      </h3>
                      <Badge className={getCategoryColor(milestone.category)}>{milestone.timeframe}</Badge>
                    </div>
                    <p className={cn("text-sm", milestone.achieved ? "text-green-700" : "text-slate-600")}>
                      {milestone.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <Icon className={cn("w-6 h-6", milestone.achieved ? "text-green-600" : "text-slate-400")} />
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
