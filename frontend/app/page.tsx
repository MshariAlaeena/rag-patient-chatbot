"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ProfileForm } from "@/components/profile-form"
import { GoalConfirmation } from "@/components/goal-confirmation"
import { Dashboard } from "@/components/dashboard"
import { ChatInterface } from "@/components/chat-interface"
import { useTranslations } from "@/components/language-switcher"

export type Screen = "welcome" | "profile" | "goals" | "dashboard" | "chat"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [userProfile, setUserProfile] = useState(null)
  const { t } = useTranslations()

  const handleProfileComplete = (profile: any) => {
    setUserProfile(profile)
    setCurrentScreen("goals")
  }

  const handleGoalsConfirm = () => {
    setCurrentScreen("dashboard")
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onGetStarted={() => setCurrentScreen("profile")} />
      case "profile":
        return <ProfileForm onComplete={handleProfileComplete} />
      case "goals":
        return <GoalConfirmation profile={userProfile} onConfirm={handleGoalsConfirm} />
      case "dashboard":
        return <Dashboard onNavigateToChat={() => setCurrentScreen("chat")} />
      case "chat":
        return <ChatInterface onBack={() => setCurrentScreen("dashboard")} />
      default:
        return <WelcomeScreen onGetStarted={() => setCurrentScreen("profile")} />
    }
  }

  const getPageTitle = () => {
    switch (currentScreen) {
      case "profile":
        return t("profileSetup")
      case "goals":
        return t("goalConfirmation")
      case "dashboard":
        return t("dashboard")
      case "chat":
        return t("chat")
      default:
        return ""
    }
  }

  if (currentScreen === "welcome") {
    return renderScreen()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header pageTitle={getPageTitle()} />
      <main className="flex-1">{renderScreen()}</main>
      <Footer />
    </div>
  )
}
