"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { translations, type Language } from "@/lib/translations"
import React from "react"

interface LanguageSwitcherProps {
  className?: string
  onLanguageChange?: (language: Language) => void
}

// Custom event for language changes
const LANGUAGE_CHANGE_EVENT = "languageChange"

// Helper function to dispatch language change event
const dispatchLanguageChange = (language: Language) => {
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: language }))
}

export function LanguageSwitcher({ className, onLanguageChange }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setCurrentLanguage(savedLanguage)
      applyLanguage(savedLanguage)
    }
  }, [])

  const applyLanguage = (language: Language) => {
    // Apply RTL/LTR to document
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

    // Save language preference
    localStorage.setItem("language", newLanguage)

    // Dispatch custom event to notify all components
    dispatchLanguageChange(newLanguage)

    // Notify parent component
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

// Hook to use translations
export function useTranslations() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load initial language
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage === "en" || savedLanguage === "ar") {
      setCurrentLanguage(savedLanguage)
    }

    // Listen for language changes from the same tab
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setCurrentLanguage(e.detail)
    }

    // Listen for language changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "ar")) {
        setCurrentLanguage(e.newValue as Language)
      }
    }

    // Add both event listeners
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Memoised translator – identity only changes when language changes
  const t = React.useCallback(
    (key: keyof typeof translations.en) => translations[currentLanguage][key] || translations.en[key],
    [currentLanguage],
  )

  return { t, currentLanguage, setCurrentLanguage }
}
