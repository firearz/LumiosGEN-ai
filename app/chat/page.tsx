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
import { MessageCircle, Send, Home, Sparkles, User, Bot, Zap, Lock, LogOut, Menu } from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { AuthModal } from "@/components/auth-modal"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ContextMenu } from "@/components/context-menu"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your daily chat assistant powered by advanced AI. I'm here to help with everyday questions, casual conversations, and quick tasks. What would you like to talk about?",
      timestamp: new Date(),
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
  const { user, signOut, chatMessageCount, incrementChatCount } = useAuth()
  const { toast } = useToast()
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canSendMessage = user || chatMessageCount < 10

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Check for pending message from dashboard
  useEffect(() => {
    const pendingMessage = sessionStorage.getItem("pendingMessage")
    if (pendingMessage) {
      setInput(pendingMessage)
      sessionStorage.removeItem("pendingMessage")

      // Auto-send the message after a short delay
      setTimeout(() => {
        if (pendingMessage.trim()) {
          handleSubmitWithMessage(pendingMessage)
        }
      }, 500)
    }
  }, [])

  // Initialize default chat on first load
  useEffect(() => {
    if (!currentChatId) {
      const defaultChatId = "default-chat-" + Date.now()
      setCurrentChatId(defaultChatId)

      // Create and save the default chat session
      const defaultSession = {
        id: defaultChatId,
        title: "Daily Chat",
        lastMessage: "Hello! I'm your daily chat assistant...",
        timestamp: new Date(),
        messageCount: 1,
        type: "chat" as const,
      }

      const storageKey = `chat_sessions_${user?.id || "guest"}`
      const existingSessions = localStorage.getItem(storageKey)
      const sessions = existingSessions ? JSON.parse(existingSessions) : []
      const updatedSessions = [defaultSession, ...sessions]
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions))

      // Save the default messages
      saveChatMessages(defaultChatId, messages)
    }
  }, [user])

  // Load chat messages for selected chat
  const loadChatMessages = (chatId: string) => {
    const storageKey = `chat_messages_${chatId}_${user?.id || "guest"}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const loadedMessages = JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(loadedMessages)
    } else {
      // New chat - start with welcome message
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! I'm your daily chat assistant powered by advanced AI. I'm here to help with everyday questions, casual conversations, and quick tasks. What would you like to talk about?",
          timestamp: new Date(),
        },
      ])
    }
  }

  // Save chat messages
  const saveChatMessages = (chatId: string, msgs: Message[]) => {
    if (!chatId) return
    const storageKey = `chat_messages_${chatId}_${user?.id || "guest"}`
    localStorage.setItem(storageKey, JSON.stringify(msgs))
  }

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    loadChatMessages(chatId)
  }

  // Handle new chat
  const handleNewChat = () => {
    setCurrentChatId(null)
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your daily chat assistant powered by advanced AI. I'm here to help with everyday questions, casual conversations, and quick tasks. What would you like to talk about?",
        timestamp: new Date(),
      },
    ])
  }

  // Handle right-click context menu
  const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
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

  const handleSubmitWithMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    if (!canSendMessage) {
      toast({
        title: "Message limit reached",
        description: "Sign up for unlimited messages!",
        variant: "destructive",
      })
      setIsAuthModalOpen(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    if (!user) {
      incrementChatCount()
    }

    // Create new chat if none selected
    let chatId = currentChatId
    if (!chatId) {
      chatId = Date.now().toString()
      setCurrentChatId(chatId)
    }

    try {
      const response = await fetch("/api/chat", {
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Save messages and update chat session
      saveChatMessages(chatId, finalMessages)

      // Update chat session in sidebar
      if ((window as any).updateChatSession) {
        const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : "")
        ;(window as any).updateChatSession(chatId, assistantMessage.content, title)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      saveChatMessages(chatId, finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmitWithMessage(input)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <ParticlesBackground />

      {/* Chat Sidebar */}
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        chatType="chat"
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
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <MessageCircle className="h-6 w-6 text-purple-400" />
              </motion.div>
              <h1 className="text-xl font-semibold text-white hidden sm:block">Daily Chat</h1>
              <h1 className="text-lg font-semibold text-white sm:hidden">Chat</h1>
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Fast AI
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {!user && <div className="text-xs lg:text-sm text-white/60">{chatMessageCount}/10 messages used</div>}

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
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs lg:text-sm"
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
                <Link href="/research">
                  <span className="hidden sm:inline">Research Mode</span>
                  <span className="sm:hidden">🔬</span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Chat Interface */}
      <div
        className={`relative z-10 container mx-auto px-4 py-6 max-w-5xl transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""}`}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        >
          <Card className="glass-morphism-dark border-purple-500/30 h-[calc(100vh-200px)] flex flex-col shadow-2xl overflow-hidden">
            <CardHeader className="flex-shrink-0 border-b border-white/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-white text-lg lg:text-xl">Lumios Gen - Daily Chat</span>
                </div>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="hidden sm:inline">Online</span>
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
                <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, delay: index * 0.05 }}
                        className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        onContextMenu={(e) => handleMessageContextMenu(e, message)}
                      >
                        <div
                          className={`flex items-start space-x-3 max-w-[85%] ${
                            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                : "bg-gradient-to-r from-blue-600 to-cyan-600"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                            )}
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`rounded-2xl p-3 lg:p-4 min-w-0 flex-1 ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "glass-morphism-dark border border-white/10 text-white"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base break-words word-wrap">
                              {message.content}
                            </p>
                            <p
                              className={`text-xs mt-2 ${
                                message.role === "user" ? "text-purple-200" : "text-white/50"
                              }`}
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start w-full"
                    >
                      <div className="flex items-start space-x-3 max-w-[85%]">
                        <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                        <div className="glass-morphism-dark border border-white/10 rounded-2xl p-3 lg:p-4">
                          <div className="flex space-x-2">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.2,
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
                    className="mb-4 p-3 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-sm flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                    You've reached the 10 message limit. Sign up for unlimited access!
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={canSendMessage ? "Type your message..." : "Sign up to continue chatting..."}
                      disabled={isLoading || !canSendMessage}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pr-12 h-10 lg:h-12 rounded-xl text-sm lg:text-base"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs">
                      {input.length}/1000
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || !canSendMessage || !input.trim()}
                      className="h-10 lg:h-12 px-4 lg:px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </form>

                <div className="flex justify-between items-center mt-3 text-xs text-white/50">
                  <span className="hidden sm:inline">Powered by advanced AI technology</span>
                  <span className="sm:hidden">AI powered</span>
                  {user ? (
                    <span className="text-green-400">✓ Unlimited messages</span>
                  ) : (
                    <span>{10 - chatMessageCount} messages remaining</span>
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
