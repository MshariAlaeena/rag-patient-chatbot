"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ArrowLeft, HelpCircle, TrendingUp, Settings, AlertCircle } from "lucide-react"
import { useTranslations } from "@/components/language-switcher"
import { quickReplies } from "@/src/mocks/dummyData"
import { motion, AnimatePresence } from "framer-motion"
import { apiClient, type ChatMessage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ChatInterfaceProps {
  onBack: () => void
}

interface UIMessage {
  id: number
  message: string
  sender: "user" | "assistant"
  timestamp: Date
  urgency: "low" | "medium" | "high"
  error?: boolean
}

export function ChatInterface({ onBack }: ChatInterfaceProps) {
  const { t, currentLanguage } = useTranslations()
  const isRTL = currentLanguage === "ar"

  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: 1,
      message:
        "Hello! I'm your AI quitting coach. I'm here to support you on your smoke-free journey. How are you feeling today?",
      sender: "assistant",
      timestamp: new Date(),
      urgency: "low",
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await apiClient.healthCheck()
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
        console.error("API health check failed:", error)
      }
    }

    checkApiHealth()
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const convertToApiMessages = (uiMessages: UIMessage[]): ChatMessage[] => {
    return uiMessages
      .filter((msg) => !msg.error)
      .map((msg) => ({
        role: msg.sender,
        content: msg.message,
      }))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: UIMessage = {
      id: Date.now(),
      message: inputValue,
      sender: "user",
      timestamp: new Date(),
      urgency: "low",
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsTyping(true)

    try {
      const currentMessages = [...messages, userMessage]
      const apiMessages = convertToApiMessages(currentMessages)

      const response = await apiClient.chat(apiMessages)

      const assistantMessage: UIMessage = {
        id: Date.now() + 1,
        message: response.data.answer,
        sender: "assistant",
        timestamp: new Date(),
        urgency: "low",
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsConnected(true)
    } catch (error) {
      console.error("Chat API error:", error)
      setIsConnected(false)

      const errorMessage: UIMessage = {
        id: Date.now() + 1,
        message:
          "I'm sorry, I'm having trouble connecting to the server right now. Please check your internet connection and try again.",
        sender: "assistant",
        timestamp: new Date(),
        urgency: "low",
        error: true,
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Connection Error",
        description: "Unable to connect to the AI service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
  }

  const getConnectionStatus = () => {
    if (isConnected === null) return "Connecting..."
    return isConnected ? "Connected" : "Disconnected"
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px-80px)]">
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold">{t("chat")}</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected === null ? "bg-yellow-400" : isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-xs text-slate-500">{getConnectionStatus()}</span>
          </div>
        </div>
        <div className="w-20"></div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {message.sender === "assistant" && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        message.error ? "bg-red-100" : "bg-slate-100"
                      }`}
                    >
                      {message.error ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <span className="text-primary font-bold text-sm">AI</span>
                      )}
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-4 py-3 message-bubble ${
                      message.sender === "user"
                        ? "bg-primary text-white"
                        : message.error
                          ? "bg-red-50 border border-red-200 text-red-900"
                          : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.sender === "user" ? "text-blue-100" : message.error ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* User avatar */}
                  {message.sender === "user" && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">U</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">AI</span>
                  </div>
                  <div className="bg-slate-100 rounded-lg px-4 py-3">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="bg-white border-t p-2 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="whitespace-nowrap bg-transparent"
              onClick={() => handleQuickReply(reply)}
              disabled={isTyping || !isConnected}
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? t("typeMessage") : "Connecting to AI service..."}
              className="flex-1"
              disabled={isTyping || !isConnected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping || !isConnected}
              className="bg-primary hover:bg-primary-600"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">{t("send")}</span>
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Unable to connect to AI service. Please check your connection.
            </p>
          )}
        </div>
      </div>

      <div className="bg-primary text-white p-3 flex justify-around">
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <HelpCircle className="w-5 h-5" />
          <span className="ml-1">{t("helpNow")}</span>
        </Button>
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <TrendingUp className="w-5 h-5" />
          <span className="ml-1">{t("progress")}</span>
        </Button>
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <Settings className="w-5 h-5" />
          <span className="ml-1">{t("settings")}</span>
        </Button>
      </div>
    </div>
  )
}
