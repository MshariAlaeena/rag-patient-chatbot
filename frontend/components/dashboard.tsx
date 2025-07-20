"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, TrendingUp, Zap, Calendar, Clock, AlertCircle, BarChart3, Trophy } from "lucide-react"
import { useTranslations } from "@/components/language-switcher"
import { chatHistory } from "@/src/mocks/dummyData"
import { motion } from "framer-motion"
import { apiClient, type DashboardResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { StreakCalendar } from "@/components/streak-calendar"
import { ProgressChart } from "@/components/progress-chart"
import { MilestoneTimeline } from "@/components/milestone-timeline"
import { CravingLogger } from "@/components/craving-logger"
import { AchievementsPanel } from "@/components/achievements-panel"
import { CravingAnalytics } from "@/components/craving-analytics"
import { HealthImpactCalculator } from "@/components/health-impact-calculator"

interface DashboardProps {
  onNavigateToChat: () => void
}

export function Dashboard({ onNavigateToChat }: DashboardProps) {
  const { t } = useTranslations()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef<boolean>(false)

  const mockProgressData = [
    { date: "2024-01-01", daysSmokeFree: 1, moneySaved: 30 },
    { date: "2024-01-02", daysSmokeFree: 2, moneySaved: 60 },
    { date: "2024-01-03", daysSmokeFree: 2, moneySaved: 60 }, // slip day
    { date: "2024-01-04", daysSmokeFree: 3, moneySaved: 90 },
    { date: "2024-01-05", daysSmokeFree: 4, moneySaved: 120 },
    { date: "2024-01-06", daysSmokeFree: 5, moneySaved: 150 },
    { date: "2024-01-07", daysSmokeFree: 6, moneySaved: 180 },
  ]

  const loadDashboardData = useCallback(async () => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setError("Failed to load dashboard data")
      toast({
        title: "Connection Error",
        description: "Unable to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const refreshDashboardData = useCallback(async () => {
    try {
      const response = await apiClient.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-slate-600 mb-4">Unable to load dashboard data</p>
            <Button
              onClick={() => {
                hasLoadedRef.current = false
                loadDashboardData()
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-gradient-to-br from-primary to-primary-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Current Streak</p>
                  <h3 className="text-4xl font-bold mt-1">{dashboardData.streak_days_smoke_free}</h3>
                  <p className="text-xs text-white/60 mt-1">🔥 Days in a row</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-accent to-accent-600 text-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary/80">Total Money Saved</p>
                  <h3 className="text-4xl font-bold mt-1">{dashboardData.total_money_saved} SAR</h3>
                  <p className="text-xs text-primary/60 mt-1">💰 Keep it up!</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Days Smoke-Free</p>
                  <h3 className="text-4xl font-bold mt-1 text-blue-900">{dashboardData.total_days_smoke_free}</h3>
                  <p className="text-xs text-blue-600 mt-1">📈 Overall progress</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("quickActions")}</h2>
        <div className="grid grid-cols-3 gap-4">
          <CravingLogger />

          <Button variant="outline" className="flex flex-col items-center justify-center h-24 border-2 bg-transparent">
            <Zap className="w-6 h-6 mb-2 text-yellow-500" />
            <span>My Plan</span>
          </Button>

          <Button variant="outline" className="flex flex-col items-center justify-center h-24 border-2 bg-transparent">
            <AlertCircle className="w-6 h-6 mb-2 text-red-500" />
            <span>Report Slip</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreakCalendar
              currentStreak={dashboardData.streak_days_smoke_free}
              onSlipReported={refreshDashboardData}
            />
            <MilestoneTimeline daysSmokeFree={dashboardData.total_days_smoke_free} />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("recentChat")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatHistory.slice(-2).map((message, index) => (
                  <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={onNavigateToChat} className="w-full mt-4 bg-primary hover:bg-primary-600">
                {t("continueChat")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart data={mockProgressData} />
            <HealthImpactCalculator daysSmokeFree={dashboardData.total_days_smoke_free} cigarettesPerDay={20} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CravingAnalytics />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Tip Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deep Breathing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Physical Activity</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">5-4-3-2-1 Grounding</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                      </div>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsPanel
            daysSmokeFree={dashboardData.total_days_smoke_free}
            moneySaved={dashboardData.total_money_saved}
          />
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => {
            hasLoadedRef.current = false
            loadDashboardData()
          }}
          className="bg-transparent"
        >
          Refresh Data
        </Button>
      </div>
    </div>
  )
}
