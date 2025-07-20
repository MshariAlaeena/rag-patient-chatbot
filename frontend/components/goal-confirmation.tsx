"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Calendar, User, Zap } from "lucide-react"
import { useTranslations } from "@/components/language-switcher"

interface GoalConfirmationProps {
  profile: any
  onConfirm: () => void
}

export function GoalConfirmation({ profile, onConfirm }: GoalConfirmationProps) {
  const { t } = useTranslations()

  const getCoachingStyleLabel = (style: string) => {
    switch (style) {
      case "supportive":
        return t("supportive")
      case "direct":
        return t("direct")
      case "motivational":
        return t("motivational")
      default:
        return style
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary">{t("goalConfirmation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">{t("name")}</div>
                  <div className="font-medium">{profile.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">{t("quitDate")}</div>
                  <div className="font-medium">{formatDate(profile.quitDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">{t("coachingStyle")}</div>
                  <div className="font-medium">{getCoachingStyleLabel(profile.coachingStyle)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-medium text-gray-700">Your Benefits</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Personalized quit plan based on your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">24/7 AI support for cravings and challenges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Track health improvements and money saved</span>
                </div>
              </div>
            </div>

            <Button onClick={onConfirm} className="w-full bg-primary hover:bg-primary-600 mt-6">
              {t("confirmAndStart")}
            </Button>

            <div className="text-sm text-gray-500 text-center">2 of 2</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
