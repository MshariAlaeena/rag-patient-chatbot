"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, Bot, Calendar, Bell, Shield, Save, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsScreen() {
  const [orgSettings, setOrgSettings] = useState({
    name: "Healthcare Clinic",
    logo: "",
    description: "Providing quality healthcare services",
  })

  const [chatSettings, setChatSettings] = useState({
    tone: "professional",
    maxTokens: 500,
    temperature: 0.7,
  })

  const [calendarSettings, setCalendarSettings] = useState({
    provider: "none",
    timezone: "America/New_York",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    documentProcessing: true,
  })

  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    })
  }

  return (
    <div className="h-screen overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold text-slate-900">Settings</h1>
          <Button onClick={handleSaveSettings} className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgSettings.name}
                  onChange={(e) => setOrgSettings((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <Label htmlFor="org-logo">Logo Upload</Label>
                <div className="flex gap-2">
                  <Input id="org-logo" type="file" accept="image/*" className="flex-1" />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                value={orgSettings.description}
                onChange={(e) => setOrgSettings((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your organization"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chat Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Chat Assistant Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chat-tone">Response Tone</Label>
                <Select
                  value={chatSettings.tone}
                  onValueChange={(value) => setChatSettings((prev) => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max-tokens">Max Response Length</Label>
                <Select
                  value={chatSettings.maxTokens.toString()}
                  onValueChange={(value) => setChatSettings((prev) => ({ ...prev, maxTokens: Number.parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="250">Short (250 tokens)</SelectItem>
                    <SelectItem value="500">Medium (500 tokens)</SelectItem>
                    <SelectItem value="1000">Long (1000 tokens)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendar Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Outlook Calendar</h3>
                  <p className="text-sm text-slate-500">Sync appointments with Outlook</p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Google Calendar</h3>
                  <p className="text-sm text-slate-500">Sync appointments with Google Calendar</p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={calendarSettings.timezone}
                onValueChange={(value) => setCalendarSettings((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-slate-500">Receive email updates for important events</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                <p className="text-sm text-slate-500">Get notified before upcoming appointments</p>
              </div>
              <Switch
                id="appointment-reminders"
                checked={notificationSettings.appointmentReminders}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, appointmentReminders: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="document-processing">Document Processing</Label>
                <p className="text-sm text-slate-500">Notifications when documents are processed</p>
              </div>
              <Switch
                id="document-processing"
                checked={notificationSettings.documentProcessing}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, documentProcessing: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">HIPAA Compliance</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    All data is encrypted and stored in compliance with HIPAA regulations. Patient information is
                    protected with enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                View Privacy Policy
              </Button>
              <Button variant="outline" className="justify-start bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                Data Export Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
