"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { translations, type Language } from "@/lib/translations"
import React from "react"

interface LanguageSwitcherProps {
  className?: string
  onLanguageChange?: (language: Language) => void
}

const LANGUAGE_CHANGE_EVENT = "languageChange"

const dispatchLanguageChange = (language: Language) => {
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: language }))
}

export function LanguageSwitcher({ className, onLanguageChange }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setCurrentLanguage(savedLanguage)
      applyLanguage(savedLanguage)
    }
  }, [])

  const applyLanguage = (language: Language) => {
    if (language === "ar") {
      document.documentElement.dir = "rtl"
      document.documentElement.lang = "ar"
    } else {
      document.documentElement.dir = "ltr"
      document.documentElement.lang = "en"
    }
  }

  const toggleLanguage = () => {
    const newLanguage: Language = currentLanguage === "en" ? "ar" : "en"
    setCurrentLanguage(newLanguage)
    applyLanguage(newLanguage)

    localStorage.setItem("language", newLanguage)

    dispatchLanguageChange(newLanguage)

    onLanguageChange?.(newLanguage)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center gap-2 text-white hover:bg-white/10 ${className}`}
    >
      <span className="text-lg">{currentLanguage === "en" ? "🇸🇦" : "🇺🇸"}</span>
      <span className="text-sm font-medium">{currentLanguage === "en" ? "العربية" : "English"}</span>
    </Button>
  )
}

export function useTranslations() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage === "en" || savedLanguage === "ar") {
      setCurrentLanguage(savedLanguage)
    }

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setCurrentLanguage(e.detail)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "ar")) {
        setCurrentLanguage(e.newValue as Language)
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const t = React.useCallback(
    (key: keyof typeof translations.en) => translations[currentLanguage][key] || translations.en[key],
    [currentLanguage],
  )

  return { t, currentLanguage, setCurrentLanguage }
}
