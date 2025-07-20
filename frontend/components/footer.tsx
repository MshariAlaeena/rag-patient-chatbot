"use client"

import { useTranslations } from "@/components/language-switcher"
import { Linkedin } from "lucide-react"

// Custom X (formerly Twitter) icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  const { t } = useTranslations()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">
              {t("aboutAiQuittingCoach")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("privacyDisclaimer")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("contact")}
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-primary transition-colors"
              aria-label="X (formerly Twitter)"
            >
              <XIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2025
        </div>
      </div>
    </footer>
  )
}
