"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSwitcher, useTranslations } from "@/components/language-switcher"
import { User, Settings, LogOut } from "lucide-react"
import { userProfile } from "@/src/mocks/dummyData"

interface HeaderProps {
  pageTitle?: string
}

export function Header({ pageTitle }: HeaderProps) {
  const { t } = useTranslations()

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Quitting Coach</h1>
              <p className="text-xs text-white/80">Company</p>
            </div>
          </div>

          {pageTitle && (
            <div className="hidden md:block">
              <h2 className="text-xl font-semibold">{pageTitle}</h2>
            </div>
          )}

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
                    <AvatarFallback className="bg-accent text-primary">{userProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{userProfile.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>{t("settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
