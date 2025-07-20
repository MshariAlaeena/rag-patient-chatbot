"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/components/language-switcher"
import { ArrowRight, Heart, TrendingUp, Users } from "lucide-react"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const { t, currentLanguage } = useTranslations()
  const isRTL = currentLanguage === "ar"

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-primary-800 relative overflow-hidden"
      style={{
        backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="absolute inset-0 bg-primary/80" />

      <div className="relative z-10 container mx-auto px-4 py-16 flex items-center min-h-screen">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{t("welcomeTitle")}</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">{t("welcomeSubtitle")}</p>

            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-accent hover:bg-accent-600 text-primary font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t("getStarted")}
              <ArrowRight className={`w-5 h-5 ${isRTL ? "mr-2" : "ml-2"}`} />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized Support</h3>
              <p className="text-white/80">AI-powered coaching tailored to your unique journey</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-white/80">Monitor your health improvements and savings</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-white/80">Join thousands who've successfully quit smoking</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">25,000+</div>
              <div className="text-white/80">Success Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">95%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-white/80">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
