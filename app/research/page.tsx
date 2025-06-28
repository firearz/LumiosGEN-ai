"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Home, Search, User, FileText, Microscope, Lock, LogOut, Zap, Menu } from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { AuthModal } from "@/components/auth-modal"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ContextMenu } from "@/components/context-menu"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"

interface ResearchMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "research" | "analysis"
}

export default function ResearchPage() {
  const [messages, setMessages] = useState<ResearchMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to Research Mode! I'm your advanced AI research assistant, specialized in providing comprehensive analysis, in-depth research, and detailed explanations. I can help you with academic research, data analysis, complex problem-solving, and thorough investigations. What would you like to research today?",
      timestamp: new Date(),
      type: "research",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    isOpen: boolean
    messageId: string | null
    content: string
  }>({
    x: 0,
    y: 0,
    isOpen: false,
    messageId: null,
    content: "",
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user, signOut, researchMessageCount, incrementResearchCount } = useAuth()
  const { toast } = useToast()
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canSendMessage = user || researchMessageCount < 10

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Load research messages for selected chat
  const loadChatMessages = (chatId: string) => {
    const storageKey = `research_messages_${chatId}_${user?.id || "guest"}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const loadedMessages = JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(loadedMessages)
    } else {
      // New research - start with welcome message
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Welcome to Research Mode! I'm your advanced AI research assistant, specialized in providing comprehensive analysis, in-depth research, and detailed explanations. I can help you with academic research, data analysis, complex problem-solving, and thorough investigations. What would you like to research today?",
          timestamp: new Date(),
          type: "research",
        },
      ])
    }
  }

  // Save research messages
  const saveChatMessages = (chatId: string, msgs: ResearchMessage[]) => {
    if (!chatId) return
    const storageKey = `research_messages_${chatId}_${user?.id || "guest"}`
    localStorage.setItem(storageKey, JSON.stringify(msgs))
  }

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    loadChatMessages(chatId)
  }

  // Handle new research
  const handleNewChat = () => {
    setCurrentChatId(null)
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Welcome to Research Mode! I'm your advanced AI research assistant, specialized in providing comprehensive analysis, in-depth research, and detailed explanations. I can help you with academic research, data analysis, complex problem-solving, and thorough investigations. What would you like to research today?",
        timestamp: new Date(),
        type: "research",
      },
    ])
  }

  // Handle right-click context menu
  const handleMessageContextMenu = (e: React.MouseEvent, message: ResearchMessage) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      messageId: message.id,
      content: message.content,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, isOpen: false, messageId: null, content: "" })
  }

  const handleDeleteMessage = () => {
    if (contextMenu.messageId) {
      const updatedMessages = messages.filter((msg) => msg.id !== contextMenu.messageId)
      setMessages(updatedMessages)
      if (currentChatId) {
        saveChatMessages(currentChatId, updatedMessages)
      }
      toast({
        title: "Message deleted",
        description: "The message has been removed from the conversation.",
      })
    }
  }

  const handleCopyMessage = () => {
    if (contextMenu.content) {
      navigator.clipboard.writeText(contextMenu.content)
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!canSendMessage) {
      toast({
        title: "Research limit reached",
        description: "Sign up for unlimited research capabilities!",
        variant: "destructive",
      })
      setIsAuthModalOpen(true)
      return
    }

    const userMessage: ResearchMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    if (!user) {
      incrementResearchCount()
    }

    // Create new research if none selected
    let chatId = currentChatId
    if (!chatId) {
      chatId = Date.now().toString()
      setCurrentChatId(chatId)
    }

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: ResearchMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        type: "analysis",
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Save messages and update research session
      saveChatMessages(chatId, finalMessages)

      // Update research session in sidebar
      if ((window as any).updateChatSession) {
        const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : "")
        ;(window as any).updateChatSession(chatId, assistantMessage.content, title)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ResearchMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your research request. Please try again.",
        timestamp: new Date(),
      }
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      saveChatMessages(chatId, finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize default research on first load
  useEffect(() => {
    if (!currentChatId) {
      const defaultChatId = "default-research-" + Date.now()
      setCurrentChatId(defaultChatId)

      // Create and save the default research session
      const defaultSession = {
        id: defaultChatId,
        title: "Research Session",
        lastMessage: "Welcome to Research Mode!",
        timestamp: new Date(),
        messageCount: 1,
        type: "research" as const,
      }

      const storageKey = `research_sessions_${user?.id || "guest"}`
      const existingSessions = localStorage.getItem(storageKey)
      const sessions = existingSessions ? JSON.parse(existingSessions) : []
      const updatedSessions = [defaultSession, ...sessions]
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions))

      // Save the default messages
      saveChatMessages(defaultChatId, messages)
    }
  }, [user])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSearch: () => {
      setIsSidebarOpen(true)
    },
    onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    onEscape: () => {
      setShowKeyboardHelp(false)
      closeContextMenu()
    },
    onSend: () => {
      if (input.trim() && canSendMessage && !isLoading) {
        handleSubmit(new Event("submit") as any)
      }
    },
    onFocusInput: () => {
      inputRef.current?.focus()
    },
  })

  // Show keyboard help with ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const isInputFocused =
          document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA"

        if (!isInputFocused) {
          e.preventDefault()
          setShowKeyboardHelp(true)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <ParticlesBackground />

      {/* Research Sidebar */}
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        chatType="research"
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative z-10 border-b border-white/10 glass-morphism-dark sticky top-0"
      >
        <div
          className={`container mx-auto px-4 py-4 flex items-center justify-between transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""}`}
        >
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="text-white/70 hover:text-white h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </motion.div>
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Brain className="h-6 w-6 text-blue-400" />
              </motion.div>
              <h1 className="text-xl font-semibold text-white hidden sm:block">Research Mode</h1>
              <h1 className="text-lg font-semibold text-white sm:hidden">Research</h1>
              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                <Microscope className="h-3 w-3 mr-1" />
                Advanced AI
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {!user && (
              <div className="text-xs lg:text-sm text-white/60">{researchMessageCount}/10 research queries used</div>
            )}

            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="hidden lg:flex items-center space-x-2 text-sm text-white/70">
                  <User className="h-4 w-4" />
                  <span className="hidden xl:inline">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-white/70 hover:text-white">
                  <LogOut className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xs lg:text-sm"
              >
                <span className="hidden sm:inline">Sign Up for Unlimited</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs lg:text-sm"
              >
                <Link href="/chat">
                  <span className="hidden sm:inline">Daily Chat</span>
                  <span className="sm:hidden">💬</span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Research Interface */}
      <div
        className={`relative z-10 container mx-auto px-4 py-6 max-w-6xl transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""}`}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        >
          <Card className="glass-morphism-dark border-blue-500/30 h-[calc(100vh-200px)] flex flex-col shadow-2xl overflow-hidden">
            <CardHeader className="flex-shrink-0 border-b border-white/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-400" />
                  <span className="text-white text-lg lg:text-xl">Lumios Gen - Research Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="hidden sm:inline">Research Mode Active</span>
                  </Badge>
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Advanced Analysis</span>
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
                <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, delay: index * 0.05 }}
                        className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        onContextMenu={(e) => handleMessageContextMenu(e, message)}
                      >
                        <div
                          className={`flex items-start space-x-3 lg:space-x-4 max-w-[85%] ${
                            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                            ) : (
                              <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                            )}
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={`rounded-2xl p-4 lg:p-5 min-w-0 flex-1 ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                : "glass-morphism-dark border border-white/10 text-white"
                            }`}
                          >
                            {message.role === "assistant" && message.type && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center space-x-2 mb-3"
                              >
                                <FileText className="h-4 w-4 text-blue-400" />
                                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                                  {message.type === "research" ? "Research Assistant" : "Deep Analysis"}
                                </Badge>
                              </motion.div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base break-words word-wrap">
                              {message.content}
                            </p>
                            <p
                              className={`text-xs mt-3 ${message.role === "user" ? "text-blue-200" : "text-white/50"}`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start w-full"
                    >
                      <div className="flex items-start space-x-4 max-w-[90%]">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div className="glass-morphism-dark border border-white/10 rounded-2xl p-5">
                          <div className="flex items-center space-x-2 mb-3">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                              Analyzing...
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-3 h-3 bg-blue-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.3,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-white/10 p-4 lg:p-6 glass-morphism-dark flex-shrink-0">
                {!canSendMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-sm flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    You've reached the 10 research query limit. Sign up for unlimited research access!
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        canSendMessage
                          ? "Enter your research question or topic..."
                          : "Sign up to continue researching..."
                      }
                      disabled={isLoading || !canSendMessage}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pr-12 h-12 lg:h-14 rounded-xl text-sm lg:text-base"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs">
                      {input.length}/2000
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || !canSendMessage || !input.trim()}
                      className="h-12 lg:h-14 px-4 lg:px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </motion.div>
                </form>

                <div className="flex justify-between items-center mt-4 text-xs text-white/50">
                  <span className="hidden sm:inline">Advanced AI research capabilities with detailed analysis</span>
                  <span className="sm:hidden">Advanced AI research</span>
                  {user ? (
                    <span className="text-green-400">✓ Unlimited research queries</span>
                  ) : (
                    <span>{10 - researchMessageCount} research queries remaining</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        onDelete={handleDeleteMessage}
        onCopy={handleCopyMessage}
        type="message"
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
