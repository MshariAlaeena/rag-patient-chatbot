"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Flame, AlertTriangle, HelpCircle } from "lucide-react"
import { apiClient, type CalendarDay } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface StreakCalendarProps {
  currentStreak: number
  onSlipReported?: () => void
}

export function StreakCalendar({ currentStreak, onSlipReported }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay["status"]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isReportingSlip, setIsReportingSlip] = useState(false)
  const { toast } = useToast()
  const hasLoadedRef = useRef<Record<string, boolean>>({})

  const loadCalendarData = useCallback(
    async (date: Date) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`

      if (hasLoadedRef.current[monthKey]) return
      hasLoadedRef.current[monthKey] = true

      try {
        setIsLoading(true)
        const dateString = date.toISOString().split("T")[0]
        const response = await apiClient.getCalendar(dateString)

        const dataMap: Record<string, CalendarDay["status"]> = {}
        response.data.forEach((day) => {
          dataMap[day.date] = day.status
        })

        setCalendarData((prev) => ({ ...prev, ...dataMap }))
      } catch (error) {
        console.error("Failed to load calendar data:", error)
        toast({
          title: "Failed to load calendar",
          description: "Unable to load calendar data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    loadCalendarData(currentDate)
  }, [currentDate, loadCalendarData])

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]
      const status = calendarData[dateString] // This will be undefined if not in API response
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)
      const isFuture = compareDate > today
      const isToday = date.toDateString() === new Date().toDateString()

      days.push({
        date,
        day,
        status, // Keep as undefined if not in API response
        isToday,
        isFuture,
        dateString,
      })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleReportSlip = async (dateString: string) => {
    try {
      setIsReportingSlip(true)
      const response = await apiClient.reportSlip({ date: dateString })

      setCalendarData((prev) => ({
        ...prev,
        [dateString]: "SLIP",
      }))

      toast({
        title: "Slip reported",
        description: response.message || "Your slip has been recorded. Tomorrow is a new day!",
      })

      onSlipReported?.()
    } catch (error) {
      console.error("Failed to report slip:", error)
      toast({
        title: "Failed to report slip",
        description: "Unable to report slip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReportingSlip(false)
    }
  }

  const days = generateCalendarDays()

  const getDayStyle = (day: any) => {
    if (!day) return "border-transparent"

    const baseStyle =
      "aspect-square p-1 text-center text-sm border border-slate-200 rounded-md transition-colors cursor-pointer hover:bg-slate-50 flex flex-col items-center justify-center"

    if (day.isFuture) return `${baseStyle} bg-slate-50 text-slate-400 cursor-not-allowed`
    if (day.isToday) return `${baseStyle} ring-2 ring-blue-500`

    switch (day.status) {
      case "SMOKE_FREE":
        return `${baseStyle} bg-green-100 text-green-800 border-green-300 hover:bg-green-200`
      case "SLIP":
        return `${baseStyle} bg-red-100 text-red-800 border-red-300 hover:bg-red-200`
      case "UNKNOWN":
        return `${baseStyle} bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200`
      default:
        // For days with no data (undefined status)
        return `${baseStyle} bg-slate-100 hover:bg-slate-200`
    }
  }

  const handleDayClick = (day: any) => {
    if (day.isFuture || day.status === "SLIP") return

    // Allow reporting slips for smoke-free days, unknown days, or today
    if (day.status === "SMOKE_FREE" || day.status === "UNKNOWN" || day.status === undefined || day.isToday) {
      if (confirm(`Report a slip for ${day.date.toLocaleDateString()}?`)) {
        handleReportSlip(day.dateString)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Streak Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Smoke-free day</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>Slip day</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3 h-3 text-gray-500" />
            <span>Before tracking</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-slate-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={getDayStyle(day)}
              onClick={() => day && handleDayClick(day)}
              title={day && !day.isFuture ? "Click to report a slip" : undefined}
            >
              {day && (
                <>
                  <span className="text-xs font-medium">{day.day}</span>
                  {!day.isFuture && (
                    <>
                      {day.status === "SLIP" && <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />}
                      {day.status === "SMOKE_FREE" && <div className="w-2 h-2 bg-green-500 rounded-full mt-0.5" />}
                      {(day.status === "UNKNOWN" || day.status === undefined) && (
                        <HelpCircle className="w-3 h-3 text-gray-500 mt-0.5" />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center mt-4">
            <div className="text-sm text-slate-500">Loading calendar data...</div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Click on any smoke-free day to report a slip if needed. Being honest about slips
            helps track your real progress!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
