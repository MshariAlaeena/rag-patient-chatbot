"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Plus, User, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  title: string
  date: Date
  time: string
  doctor: string
  location: string
  type: "consultation" | "follow-up" | "test" | "procedure"
  status: "upcoming" | "completed" | "cancelled"
  notes?: string
}

export function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      title: "Annual Checkup",
      date: new Date(2024, 11, 15),
      time: "10:00 AM",
      doctor: "Dr. Sarah Johnson",
      location: "Main Clinic - Room 205",
      type: "consultation",
      status: "upcoming",
      notes: "Bring previous test results",
    },
    {
      id: "2",
      title: "Blood Work Follow-up",
      date: new Date(2024, 11, 20),
      time: "2:30 PM",
      doctor: "Dr. Michael Chen",
      location: "Lab Center",
      type: "follow-up",
      status: "upcoming",
    },
    {
      id: "3",
      title: "Physical Therapy",
      date: new Date(2024, 11, 10),
      time: "9:00 AM",
      doctor: "Lisa Rodriguez, PT",
      location: "Therapy Wing",
      type: "procedure",
      status: "completed",
    },
  ])

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    date: "",
    time: "",
    doctor: "",
    location: "",
    type: "consultation" as Appointment["type"],
    notes: "",
  })
  const { toast } = useToast()

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return []
    return appointments.filter((apt) => apt.date.toDateString() === date.toDateString())
  }

  const handleCreateAppointment = () => {
    if (!newAppointment.title || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      title: newAppointment.title,
      date: new Date(newAppointment.date),
      time: newAppointment.time,
      doctor: newAppointment.doctor,
      location: newAppointment.location,
      type: newAppointment.type,
      status: "upcoming",
      notes: newAppointment.notes,
    }

    setAppointments((prev) => [...prev, appointment])
    setNewAppointment({
      title: "",
      date: "",
      time: "",
      doctor: "",
      location: "",
      type: "consultation",
      notes: "",
    })
    setIsDialogOpen(false)

    toast({
      title: "Appointment scheduled",
      description: `${appointment.title} has been scheduled for ${appointment.date.toLocaleDateString()}.`,
    })
  }

  const getTypeColor = (type: Appointment["type"]) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800"
      case "follow-up":
        return "bg-green-100 text-green-800"
      case "test":
        return "bg-yellow-100 text-yellow-800"
      case "procedure":
        return "bg-purple-100 text-purple-800"
    }
  }

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
    }
  }

  const upcomingAppointments = appointments
    .filter((apt) => apt.status === "upcoming")
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50">
      {/* Left Panel - Calendar */}
      <div className="w-full lg:w-2/3 p-4 lg:p-6 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold text-slate-900">Appointments</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Annual Checkup"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor/Provider</Label>
                  <Input
                    id="doctor"
                    value={newAppointment.doctor}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, doctor: e.target.value }))}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Main Clinic - Room 101"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateAppointment} className="flex-1">
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs sm:text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1 lg:p-2 text-center font-medium text-slate-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays().map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date)
            const isToday = date && date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[60px] lg:min-h-[80px] p-1 border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs lg:text-sm",
                  !date && "bg-slate-50",
                  isToday && "bg-blue-50 border-blue-200",
                )}
              >
                {date && (
                  <>
                    <div className={cn("text-sm font-medium mb-1", isToday ? "text-blue-600" : "text-slate-900")}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div key={apt.id} className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate">
                          {apt.time} {apt.title}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-slate-500">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Upcoming Appointments */}
      <div className="w-full lg:w-1/3 p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-4">Upcoming Appointments</h2>
        <ScrollArea className="h-96 lg:h-[calc(100vh-120px)]">
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{appointment.title}</h3>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    {appointment.doctor && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{appointment.doctor}</span>
                      </div>
                    )}
                    {appointment.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className={getTypeColor(appointment.type)}>
                      {appointment.type}
                    </Badge>
                  </div>

                  {appointment.notes && (
                    <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">{appointment.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {upcomingAppointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No upcoming appointments</p>
                <p className="text-sm text-slate-500 mt-1">Schedule your next appointment to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
