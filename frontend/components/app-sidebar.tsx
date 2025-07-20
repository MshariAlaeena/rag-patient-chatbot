"use client"

import { MessageCircle, FileText, Calendar, Settings, Home, Menu } from "lucide-react"
import { LanguageSwitcher, useTranslations } from "@/components/language-switcher"
import type { Screen } from "@/app/page"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface AppSidebarProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function AppSidebar({ currentScreen, onNavigate }: AppSidebarProps) {
  const { t } = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      title: t("chat"),
      icon: MessageCircle,
      screen: "chat" as Screen,
      enabled: true,
    },
    {
      title: t("documents"),
      icon: FileText,
      screen: "documents" as Screen,
      enabled: true,
    },
    {
      title: t("appointments"),
      icon: Calendar,
      screen: "appointments" as Screen,
      enabled: false,
      comingSoon: true,
    },
    {
      title: t("settings"),
      icon: Settings,
      screen: "settings" as Screen,
      enabled: true,
    },
  ]

  const handleNavigation = (screen: Screen) => {
    if (menuItems.find((item) => item.screen === screen)?.enabled) {
      onNavigate(screen)
      setIsOpen(false)
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="font-semibold text-slate-900 text-sm">{t("appName")}</h2>
            <p className="text-xs text-slate-500">{t("appSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.screen
            const isDisabled = !item.enabled

            return (
              <div key={item.screen} className="relative">
                <button
                  onClick={() => handleNavigation(item.screen)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors relative
                    ${
                      isActive && item.enabled
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : isDisabled
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                  title={item.comingSoon ? t("comingSoon") : undefined}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.comingSoon && (
                    <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {t("comingSoon")}
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <LanguageSwitcher className="w-full" />
      </div>
    </>
  )

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className={cn("hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sidebar-container")}>
        <SidebarContent />
      </div>
    </>
  )
}
