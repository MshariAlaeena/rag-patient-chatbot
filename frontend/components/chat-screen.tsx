"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Bot, User, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient, type ChatMessage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/components/language-switcher"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  error?: boolean
}

export function ChatScreen() {
  const { t, currentLanguage } = useTranslations()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: t("initialBotMessage"),
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const healthCheckRef = useRef<boolean>(false)

  // Update initial message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: t("initialBotMessage"),
        sender: "assistant",
        timestamp: new Date(),
      },
    ])
  }, [currentLanguage, t])

  // Check API health on component mount - prevent duplicate calls
  const checkApiHealth = useCallback(async () => {
    if (healthCheckRef.current) return
    healthCheckRef.current = true

    try {
      await apiClient.healthCheck()
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
      console.error("API health check failed:", error)
    }
  }, [])

  useEffect(() => {
    checkApiHealth()
  }, [checkApiHealth])

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Convert UI messages to API format
  const convertToApiMessages = (uiMessages: Message[]): ChatMessage[] => {
    return uiMessages
      .filter((msg) => !msg.error) // Exclude error messages from conversation history
      .map((msg) => ({
        role: msg.sender,
        content: msg.content,
      }))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")

    // Re-focus input after sending message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)

    setIsLoading(true)

    try {
      // Get current conversation history including the new user message
      const currentMessages = [...messages, userMessage]
      const apiMessages = convertToApiMessages(currentMessages)

      // Call the API with conversation history
      const response = await apiClient.chat(apiMessages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.answer,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsConnected(true)
    } catch (error) {
      console.error("Chat API error:", error)
      setIsConnected(false)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t("connectionError"),
        sender: "assistant",
        timestamp: new Date(),
        error: true,
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: t("connectionErrorTitle"),
        description: t("connectionErrorDescription"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getConnectionStatus = () => {
    if (isConnected === null) return t("connecting")
    return isConnected ? t("connected") : t("disconnected")
  }

  const isRTL = currentLanguage === "ar"

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 lg:p-6 bg-white">
        <div className="flex items-center justify-between">
          <div className={cn("flex-1", isRTL && "rtl-text")}>
            <h1 className="text-xl lg:text-2xl font-semibold text-slate-900">{t("medicalAssistant")}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("askHealthQuestion")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected === null ? "bg-yellow-400" : isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-xs text-slate-500">{getConnectionStatus()}</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 lg:p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                // Keep consistent layout: assistant always left, user always right
                message.sender === "user" ? "justify-end" : "justify-start",
              )}
            >
              {/* Assistant avatar - always on the left */}
              {message.sender === "assistant" && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.error ? "bg-red-100" : "bg-slate-100",
                  )}
                >
                  {message.error ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3",
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : message.error
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-slate-100 text-slate-900",
                )}
              >
                <p className={cn("text-sm leading-relaxed", isRTL && "text-right")}>{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    message.sender === "user" ? "text-blue-100" : message.error ? "text-red-600" : "text-slate-500",
                    isRTL && "text-right",
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* User avatar - always on the right */}
              {message.sender === "user" && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-slate-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4 lg:p-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("healthQuestionPlaceholder")}
                className={cn(
                  "py-2 lg:py-3 text-sm",
                  // Consistent padding for both languages, with proper spacing for attachment icon
                  isRTL ? "pr-12 pl-3 text-right" : "pl-3 pr-12 text-left",
                )}
                disabled={isLoading || !isConnected}
              />
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-8 w-8 p-0",
                  // Keep attachment icon on the right for both languages
                  "right-1",
                )}
              >
                <Paperclip className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !isConnected}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className={cn("text-xs text-red-600 mt-2 text-center", isRTL && "text-right")}>{t("unableToConnect")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
