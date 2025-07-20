"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/components/language-switcher"

interface ProfileFormProps {
  onComplete: (profile: any) => void
}

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const { t, currentLanguage } = useTranslations()
  const isRTL = currentLanguage === "ar"

  const [profile, setProfile] = useState({
    name: "Ahmed",
    quitDate: new Date().toISOString().split("T")[0],
    currentNicotineMg: "0",
    coachingStyle: "supportive",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const profileWithDate = {
      ...profile,
      quitDate: new Date(profile.quitDate),
    }
    onComplete(profileWithDate)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">{t("profileSetup")}</h2>
            <p className="text-gray-600">{t("tellUsAboutYou")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={t("namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quitDate">{t("quitDate")}</Label>
              <Input
                id="quitDate"
                type="date"
                value={profile.quitDate}
                onChange={(e) => setProfile({ ...profile, quitDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nicotine">{t("currentNicotine")}</Label>
              <Select
                value={profile.currentNicotineMg}
                onValueChange={(value) => setProfile({ ...profile, currentNicotineMg: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nicotine level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 mg (Quit completely)</SelectItem>
                  <SelectItem value="3">3 mg (Low)</SelectItem>
                  <SelectItem value="6">6 mg (Medium)</SelectItem>
                  <SelectItem value="12">12 mg (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>{t("coachingStyle")}</Label>
              <RadioGroup
                value={profile.coachingStyle}
                onValueChange={(value) => setProfile({ ...profile, coachingStyle: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="supportive" id="supportive" />
                  <Label htmlFor="supportive" className="cursor-pointer">
                    {t("supportive")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direct" id="direct" />
                  <Label htmlFor="direct" className="cursor-pointer">
                    {t("direct")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="motivational" id="motivational" />
                  <Label htmlFor="motivational" className="cursor-pointer">
                    {t("motivational")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">1 of 2</div>
              <Button type="submit" className="bg-primary hover:bg-primary-600">
                {t("next")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
