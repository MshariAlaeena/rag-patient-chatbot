"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Calendar, DollarSign, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
  progress?: number
  maxProgress?: number
  category: "streak" | "savings" | "health" | "milestone"
}

interface AchievementsPanelProps {
  daysSmokeFree: number
  moneySaved: number
}

export function AchievementsPanel({ daysSmokeFree, moneySaved }: AchievementsPanelProps) {
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Day Champion",
      description: "Complete your first smoke-free day",
      icon: Star,
      unlocked: daysSmokeFree >= 1,
      category: "streak",
    },
    {
      id: "2",
      title: "Three Day Warrior",
      description: "Maintain a 3-day smoke-free streak",
      icon: Target,
      unlocked: daysSmokeFree >= 3,
      category: "streak",
    },
    {
      id: "3",
      title: "Week Conqueror",
      description: "Complete your first smoke-free week",
      icon: Calendar,
      unlocked: daysSmokeFree >= 7,
      progress: Math.min(daysSmokeFree, 7),
      maxProgress: 7,
      category: "streak",
    },
    {
      id: "4",
      title: "Money Saver",
      description: "Save your first $50",
      icon: DollarSign,
      unlocked: moneySaved >= 50,
      progress: Math.min(moneySaved, 50),
      maxProgress: 50,
      category: "savings",
    },
    {
      id: "5",
      title: "Health Hero",
      description: "Unlock 3 health milestones",
      icon: Heart,
      unlocked: daysSmokeFree >= 7, // Simplified logic
      progress: Math.min(Math.floor(daysSmokeFree / 2), 3),
      maxProgress: 3,
      category: "health",
    },
    {
      id: "6",
      title: "Month Master",
      description: "Complete 30 smoke-free days",
      icon: Trophy,
      unlocked: daysSmokeFree >= 30,
      progress: Math.min(daysSmokeFree, 30),
      maxProgress: 30,
      category: "milestone",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "streak":
        return "bg-blue-100 text-blue-800"
      case "savings":
        return "bg-green-100 text-green-800"
      case "health":
        return "bg-red-100 text-red-800"
      case "milestone":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </div>
          <Badge variant="secondary">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div
                key={achievement.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  achievement.unlocked
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-slate-50 border-slate-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      achievement.unlocked ? "bg-yellow-500" : "bg-slate-300",
                    )}
                  >
                    <Icon className={cn("w-5 h-5", achievement.unlocked ? "text-white" : "text-slate-600")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3
                        className={cn(
                          "font-medium text-sm",
                          achievement.unlocked ? "text-yellow-900" : "text-slate-700",
                        )}
                      >
                        {achievement.title}
                      </h3>
                      <Badge className={getCategoryColor(achievement.category)} variant="secondary">
                        {achievement.category}
                      </Badge>
                    </div>
                    <p className={cn("text-xs", achievement.unlocked ? "text-yellow-700" : "text-slate-600")}>
                      {achievement.description}
                    </p>

                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              achievement.unlocked ? "bg-yellow-500" : "bg-slate-400",
                            )}
                            style={{
                              width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
