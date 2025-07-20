"use client"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { MessageCircle, Upload, FileText, Clock } from "lucide-react"
import { LanguageSwitcher, useTranslations } from "@/components/language-switcher"
import type { Screen } from "@/app/page"

interface LandingScreenProps {
  onNavigate: (screen: Screen) => void
}

export function LandingScreen({ onNavigate }: LandingScreenProps) {
  const { t, currentLanguage } = useTranslations()
  const isRTL = currentLanguage === "ar"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header with Language Switcher - Always top right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className={cn("text-center max-w-4xl mx-auto")}>
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4 text-center">{t("landingTitle")}</h1>
            <p className="text-xl text-slate-600 mb-8 text-center">{t("landingSubtitle")}</p>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => onNavigate("chat")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg flex items-center justify-center"
            >
              <MessageCircle className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
              {t("chatNow")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("documents")}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg flex items-center justify-center"
            >
              <Upload className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
              {t("uploadDocument")}
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-center">{t("smartDocProcessing")}</h3>
              <p className="text-slate-600 text-sm text-center">{t("smartDocDescription")}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-center">{t("intelligentQA")}</h3>
              <p className="text-slate-600 text-sm text-center">{t("intelligentQADescription")}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-center">{t("availability247")}</h3>
              <p className="text-slate-600 text-sm text-center">{t("availability247Description")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t("documentation")}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t("contact")}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t("privacyPolicy")}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
