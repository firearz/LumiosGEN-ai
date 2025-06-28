"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Search,
  Sparkles,
  Brain,
  ImageIcon,
  Plus,
  Settings,
  User,
  LogOut,
  Library,
  Zap,
  Palette,
  Microscope,
  Clock,
  ChevronRight,
  Mic,
  Paperclip,
  Send,
  Bot,
  FileText,
  Download,
  Lock,
  Menu,
  X,
} from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ContextMenu } from "@/components/context-menu"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { useRouter } from "next/navigation"

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  type: "chat" | "research" | "image"
  messageCount: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  imageUrl?: string
  type?: "research" | "analysis"
}

export default function DashboardPage() {
  const [input, setInput] = useState("")
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMode, setActiveMode] = useState<"chat" | "research" | "image" | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imageCount, setImageCount] = useState(0)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    isOpen: boolean
    messageId: string | null
    chatId: string | null
    type: "message" | "image" | "chat"
    imageUrl?: string
    content?: string
  }>({
    x: 0,
    y: 0,
    isOpen: false,
    messageId: null,
    chatId: null,
    type: "message",
  })
  const { user, signOut, chatMessageCount, researchMessageCount, incrementChatCount, incrementResearchCount } =
    useAuth()
  const { toast } = useToast()

  // Load recent chats from all types
  useEffect(() => {
    const loadRecentChats = () => {
      const allChats: ChatSession[] = []
      const chatTypes = ["chat", "research", "image"]

      chatTypes.forEach((type) => {
        const storageKey = `${type}_sessions_${user?.id || "guest"}`
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const sessions = JSON.parse(saved).map((session: any) => ({
            ...session,
            timestamp: new Date(session.timestamp),
            type,
          }))
          allChats.push(...sessions)
        }
      })

      // Sort by timestamp and take the most recent 15
      const sortedChats = allChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15)
      setRecentChats(sortedChats)
    }

    loadRecentChats()

    // Load image count
    const today = new Date().toDateString()
    const storageKey = `image_count_${user?.id || "guest"}_${today}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setImageCount(Number.parseInt(saved))
    }
  }, [user])

  // Load chat messages for selected chat
  const loadChatMessages = (chatId: string, type: string) => {
    const storageKey = `${type}_messages_${chatId}_${user?.id || "guest"}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const loadedMessages = JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(loadedMessages)
    } else {
      // Set welcome message based on type
      const welcomeMessages = {
        chat: "Hello! I'm your daily chat assistant powered by advanced AI. I'm here to help with everyday questions, casual conversations, and quick tasks. What would you like to talk about?",
        research:
          "Welcome to Research Mode! I'm your advanced AI research assistant, specialized in providing comprehensive analysis, in-depth research, and detailed explanations. What would you like to research today?",
        image:
          "Welcome to Lumios Image Gen! I'm your AI-powered image generation assistant using Qwen-2.5-VL-3B-Instruct. Describe what you'd like to see and I'll bring it to life!",
      }

      setMessages([
        {
          id: "1",
          role: "assistant",
          content: welcomeMessages[type as keyof typeof welcomeMessages],
          timestamp: new Date(),
        },
      ])
    }
  }

  // Save chat messages
  const saveChatMessages = (chatId: string, type: string, msgs: Message[]) => {
    if (!chatId) return
    const storageKey = `${type}_messages_${chatId}_${user?.id || "guest"}`
    localStorage.setItem(storageKey, JSON.stringify(msgs))
  }

  // Save chat sessions
  const saveChatSessions = (type: string, sessions: ChatSession[]) => {
    const storageKey = `${type}_sessions_${user?.id || "guest"}`
    localStorage.setItem(storageKey, JSON.stringify(sessions))
  }

  // Handle mode selection and auto-send message
  const handleModeSelect = (mode: "chat" | "research" | "image") => {
    if (input.trim()) {
      // If there's input, navigate to the specific page and send the message
      const routes = {
        chat: "/chat",
        research: "/research",
        image: "/image",
      }

      // Store the message to be sent
      sessionStorage.setItem("pendingMessage", input)

      // Navigate to the specific page
      router.push(routes[mode])
    } else {
      // If no input, just set the mode
      setActiveMode(mode)
      setCurrentChatId(null)
      setMessages([])

      // Set welcome message
      const welcomeMessages = {
        chat: "Hello! I'm your daily chat assistant powered by advanced AI. I'm here to help with everyday questions, casual conversations, and quick tasks. What would you like to talk about?",
        research:
          "Welcome to Research Mode! I'm your advanced AI research assistant, specialized in providing comprehensive analysis, in-depth research, and detailed explanations. What would you like to research today?",
        image:
          "Welcome to Lumios Image Gen! I'm your AI-powered image generation assistant using Qwen-2.5-VL-3B-Instruct. Describe what you'd like to see and I'll bring it to life!",
      }

      setMessages([
        {
          id: "1",
          role: "assistant",
          content: welcomeMessages[mode],
          timestamp: new Date(),
        },
      ])
    }
  }

  // Handle chat selection
  const handleChatSelect = (chat: ChatSession) => {
    setActiveMode(chat.type)
    setCurrentChatId(chat.id)
    loadChatMessages(chat.id, chat.type)
  }

  // Create new chat
  const createNewChat = (type: "chat" | "research" | "image") => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `New ${type === "chat" ? "Chat" : type === "research" ? "Research" : "Image Generation"}`,
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      type: type,
    }

    // Get existing sessions
    const storageKey = `${type}_sessions_${user?.id || "guest"}`
    const existing = localStorage.getItem(storageKey)
    const existingSessions = existing ? JSON.parse(existing) : []

    const updatedSessions = [newSession, ...existingSessions]
    saveChatSessions(type, updatedSessions)

    // Update recent chats
    setRecentChats((prev) => [newSession, ...prev].slice(0, 15))

    setActiveMode(type)
    setCurrentChatId(newSession.id)

    // Set welcome message
    const welcomeMessages = {
      chat: "Hello! I'm your daily chat assistant powered by advanced AI. I'm here to help with everyday questions, casual conversations, and quick tasks. What would you like to talk about?",
      research:
        "Welcome to Research Mode! I'm your advanced AI research assistant, specialized in providing comprehensive analysis, in-depth research, and detailed explanations. What would you like to research today?",
      image:
        "Welcome to Lumios Image Gen! I'm your AI-powered image generation assistant using Qwen-2.5-VL-3B-Instruct. Describe what you'd like to see and I'll bring it to life!",
    }

    setMessages([
      {
        id: "1",
        role: "assistant",
        content: welcomeMessages[type],
        timestamp: new Date(),
      },
    ])
  }

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !activeMode) return

    // Check limits for non-authenticated users
    if (!user) {
      if (activeMode === "chat" && chatMessageCount >= 10) {
        toast({
          title: "Message limit reached",
          description: "Sign up for unlimited messages!",
          variant: "destructive",
        })
        return
      }
      if (activeMode === "research" && researchMessageCount >= 10) {
        toast({
          title: "Research limit reached",
          description: "Sign up for unlimited research!",
          variant: "destructive",
        })
        return
      }
      if (activeMode === "image" && imageCount >= 5) {
        toast({
          title: "Image limit reached",
          description: "Sign up for 100 images per day!",
          variant: "destructive",
        })
        return
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    const promptText = input
    setInput("")
    setIsLoading(true)

    // Increment counters for non-authenticated users
    if (!user) {
      if (activeMode === "chat") incrementChatCount()
      if (activeMode === "research") incrementResearchCount()
      if (activeMode === "image") {
        const today = new Date().toDateString()
        const storageKey = `image_count_${user?.id || "guest"}_${today}`
        const newCount = imageCount + 1
        setImageCount(newCount)
        localStorage.setItem(storageKey, newCount.toString())
      }
    }

    // Create new chat if none selected
    let chatId = currentChatId
    if (!chatId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: promptText.slice(0, 50) + (promptText.length > 50 ? "..." : ""),
        lastMessage: "",
        timestamp: new Date(),
        messageCount: 0,
        type: activeMode,
      }

      chatId = newSession.id
      setCurrentChatId(chatId)

      // Save new session
      const storageKey = `${activeMode}_sessions_${user?.id || "guest"}`
      const existing = localStorage.getItem(storageKey)
      const existingSessions = existing ? JSON.parse(existing) : []
      const updatedSessions = [newSession, ...existingSessions]
      saveChatSessions(activeMode, updatedSessions)
      setRecentChats((prev) => [newSession, ...prev].slice(0, 15))
    }

    try {
      let response, data

      if (activeMode === "image") {
        response = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText }),
        })
        data = await response.json()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've generated an image based on your prompt: "${promptText}"`,
          imageUrl: data.imageUrl,
          timestamp: new Date(),
        }

        const finalMessages = [...newMessages, assistantMessage]
        setMessages(finalMessages)
        saveChatMessages(chatId, activeMode, finalMessages)
      } else {
        const apiEndpoint = activeMode === "chat" ? "/api/chat" : "/api/research"
        response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })
        data = await response.json()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
          type: activeMode === "research" ? "analysis" : undefined,
        }

        const finalMessages = [...newMessages, assistantMessage]
        setMessages(finalMessages)
        saveChatMessages(chatId, activeMode, finalMessages)
      }

      // Update chat session
      const storageKey = `${activeMode}_sessions_${user?.id || "guest"}`
      const existing = localStorage.getItem(storageKey)
      const existingSessions = existing ? JSON.parse(existing) : []
      const updatedSessions = existingSessions.map((session: ChatSession) => {
        if (session.id === chatId) {
          return {
            ...session,
            lastMessage: data.content || "Generated image",
            timestamp: new Date(),
            messageCount: session.messageCount + 1,
            title:
              session.title ===
              `New ${activeMode === "chat" ? "Chat" : activeMode === "research" ? "Research" : "Image Generation"}`
                ? promptText.slice(0, 50) + (promptText.length > 50 ? "..." : "")
                : session.title,
          }
        }
        return session
      })

      saveChatSessions(activeMode, updatedSessions)
      setRecentChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, lastMessage: data.content || "Generated image", timestamp: new Date() }
            : chat,
        ),
      )
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
      saveChatMessages(chatId, activeMode, finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle right-click context menu for messages
  const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      messageId: message.id,
      chatId: null,
      type: message.imageUrl ? "image" : "message",
      imageUrl: message.imageUrl,
      content: message.content,
    })
  }

  // Handle right-click context menu for chat sessions
  const handleChatContextMenu = (e: React.MouseEvent, chat: ChatSession) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      messageId: null,
      chatId: chat.id,
      type: "chat",
      content: chat.title,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, isOpen: false, messageId: null, chatId: null, type: "message" })
  }

  const handleDeleteMessage = () => {
    if (contextMenu.messageId) {
      const updatedMessages = messages.filter((msg) => msg.id !== contextMenu.messageId)
      setMessages(updatedMessages)
      if (currentChatId && activeMode) {
        saveChatMessages(currentChatId, activeMode, updatedMessages)
      }
      toast({
        title: "Message deleted",
        description: "The message has been removed from the conversation.",
      })
    }
  }

  const handleDeleteChat = () => {
    if (contextMenu.chatId) {
      const chatToDelete = recentChats.find((chat) => chat.id === contextMenu.chatId)
      if (chatToDelete) {
        // Remove from recent chats
        setRecentChats((prev) => prev.filter((chat) => chat.id !== contextMenu.chatId))

        // Remove from storage
        const storageKey = `${chatToDelete.type}_sessions_${user?.id || "guest"}`
        const existing = localStorage.getItem(storageKey)
        if (existing) {
          const sessions = JSON.parse(existing).filter((session: ChatSession) => session.id !== contextMenu.chatId)
          localStorage.setItem(storageKey, JSON.stringify(sessions))
        }

        // Clear current chat if it's the one being deleted
        if (currentChatId === contextMenu.chatId) {
          setCurrentChatId(null)
          setActiveMode(null)
          setMessages([])
        }

        toast({
          title: "Chat deleted",
          description: "The conversation has been removed.",
        })
      }
    }
  }

  const handleCopyMessage = () => {
    if (contextMenu.content) {
      navigator.clipboard.writeText(contextMenu.content)
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied.",
      })
    }
  }

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `lumios-gen-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadImage = () => {
    if (contextMenu.imageUrl && contextMenu.content) {
      downloadImage(contextMenu.imageUrl, contextMenu.content)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageCircle className="h-4 w-4 text-purple-400" />
      case "research":
        return <Brain className="h-4 w-4 text-blue-400" />
      case "image":
        return <ImageIcon className="h-4 w-4 text-indigo-400" />
      default:
        return <MessageCircle className="h-4 w-4 text-purple-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "chat":
        return "bg-purple-600/20 text-purple-300 border-purple-500/30"
      case "research":
        return "bg-blue-600/20 text-blue-300 border-blue-500/30"
      case "image":
        return "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
      default:
        return "bg-purple-600/20 text-purple-300 border-purple-500/30"
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: () => createNewChat(activeMode || "chat"),
    onSearch: () => {
      setIsSidebarOpen(true)
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    },
    onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    onEscape: () => {
      setShowKeyboardHelp(false)
      closeContextMenu()
    },
    onSend: handleSubmit,
    onFocusInput: () => {
      const inputElement = document.querySelector(
        'input[placeholder*="Ask anything"], input[placeholder*="Type your message"], input[placeholder*="research"], input[placeholder*="image"]',
      ) as HTMLInputElement
      inputElement?.focus()
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

      <div className="flex h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />

              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 h-full w-80 glass-morphism-dark border-r border-white/10 z-40 flex flex-col"
              >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Sparkles className="h-8 w-8 text-purple-400" />
                      </motion.div>
                      <h1 className="text-xl font-bold text-gradient-purple">Lumios Gen</h1>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-white/70 hover:text-white h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => createNewChat(activeMode || "chat")}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mb-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </motion.div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search chats"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-4 border-b border-white/10">
                  <div className="space-y-2">
                    <motion.div whileHover={{ scale: 1.02, x: 5 }}>
                      <Button
                        onClick={() => handleModeSelect("chat")}
                        variant={activeMode === "chat" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeMode === "chat"
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Daily Chat
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02, x: 5 }}>
                      <Button
                        onClick={() => handleModeSelect("research")}
                        variant={activeMode === "research" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeMode === "research"
                            ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Brain className="h-4 w-4 mr-3" />
                        Research Mode
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02, x: 5 }}>
                      <Button
                        onClick={() => handleModeSelect("image")}
                        variant={activeMode === "image" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeMode === "image"
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <ImageIcon className="h-4 w-4 mr-3" />
                        Image Generation
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02, x: 5 }}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Library className="h-4 w-4 mr-3" />
                        Library
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Recent Chats - Scrollable */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white/60 text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Chats
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {recentChats.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="group"
                          >
                            <Button
                              onClick={() => handleChatSelect(chat)}
                              onContextMenu={(e) => handleChatContextMenu(e, chat)}
                              variant="ghost"
                              className={`w-full justify-start text-left h-auto p-3 hover:bg-white/10 ${
                                currentChatId === chat.id ? "bg-white/10 border border-white/20" : ""
                              }`}
                            >
                              <div className="flex items-start space-x-3 w-full">
                                <div className="flex-shrink-0 mt-1">{getTypeIcon(chat.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{chat.title}</p>
                                  <p className="text-white/60 text-xs mt-1 line-clamp-2">{chat.lastMessage}</p>
                                  <div className="flex items-center mt-2 space-x-2">
                                    <Badge variant="outline" className={`text-xs ${getTypeColor(chat.type)}`}>
                                      {chat.type}
                                    </Badge>
                                    <span className="text-white/50 text-xs">{chat.timestamp.toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {recentChats.length === 0 && (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                          <p className="text-white/60 text-sm">No conversations yet</p>
                          <p className="text-white/40 text-xs mt-1">Start a new conversation to see it here</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* User Profile - Fixed at bottom */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {user?.user_metadata?.full_name || user?.email || "User"}
                        </p>
                        <p className="text-white/60 text-xs">Premium Plan</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/70 hover:text-white"
                        onClick={signOut}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""}`}>
          {/* Header */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-b border-white/10 glass-morphism-dark p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!isSidebarOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-white/70 hover:text-white"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h2 className="text-2xl font-bold text-white">
                  {activeMode
                    ? `Lumios ${activeMode === "chat" ? "Chat" : activeMode === "research" ? "Research" : "Image Gen"}`
                    : "Lumios Gen"}
                </h2>
                {activeMode && (
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    {activeMode === "chat" ? "Chat Mode" : activeMode === "research" ? "Research Mode" : "Image Mode"}
                  </Badge>
                )}
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Plus
              </Button>
            </div>
          </motion.header>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!activeMode ? (
              /* Welcome Screen */
              <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-full max-w-4xl"
                >
                  <div className="text-center mb-8">
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                      What's on the agenda today?
                    </motion.h1>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/70 text-lg"
                    >
                      Choose your AI experience: Chat, Research, or Image Generation
                    </motion.p>
                  </div>

                  {/* Quick Action Cards */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid md:grid-cols-3 gap-6 mb-8"
                  >
                    <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                      <Card
                        className="glass-morphism-dark border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                        onClick={() => handleModeSelect("chat")}
                      >
                        <CardContent className="p-6 text-center">
                          <MessageCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                          <h3 className="text-white font-semibold mb-2">Daily Chat</h3>
                          <p className="text-white/60 text-sm mb-4">Quick conversations and everyday assistance</p>
                          <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                            <Zap className="h-3 w-3 mr-1" />
                            Fast AI
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                      <Card
                        className="glass-morphism-dark border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
                        onClick={() => handleModeSelect("research")}
                      >
                        <CardContent className="p-6 text-center">
                          <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                          <h3 className="text-white font-semibold mb-2">Research Mode</h3>
                          <p className="text-white/60 text-sm mb-4">In-depth analysis and comprehensive research</p>
                          <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                            <Microscope className="h-3 w-3 mr-1" />
                            Advanced AI
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                      <Card
                        className="glass-morphism-dark border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer"
                        onClick={() => handleModeSelect("image")}
                      >
                        <CardContent className="p-6 text-center">
                          <ImageIcon className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                          <h3 className="text-white font-semibold mb-2">Image Generation</h3>
                          <p className="text-white/60 text-sm mb-4">Create stunning AI-generated images</p>
                          <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                            <Palette className="h-3 w-3 mr-1" />
                            Qwen-2.5-VL
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>

                  {/* Main Input */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="relative"
                  >
                    <Card className="glass-morphism-dark border-white/20">
                      <CardContent className="p-6">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (input.trim()) {
                              handleModeSelect("chat")
                            }
                          }}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex-1 relative">
                            <Input
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Ask anything"
                              className="bg-transparent border-none text-white placeholder:text-white/50 text-lg h-12 pr-20"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white">
                                <Mic className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Tools
                            </Button>
                            {input.trim() && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  type="submit"
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              /* Chat Interface */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          onContextMenu={(e) => handleMessageContextMenu(e, message)}
                        >
                          <div
                            className={`flex items-start space-x-3 max-w-[85%] ${
                              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                message.role === "user"
                                  ? activeMode === "chat"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                    : activeMode === "research"
                                      ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                                      : "bg-gradient-to-r from-indigo-600 to-purple-600"
                                  : "bg-gradient-to-r from-slate-600 to-slate-700"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="h-5 w-5 text-white" />
                              ) : activeMode === "chat" ? (
                                <Bot className="h-5 w-5 text-white" />
                              ) : activeMode === "research" ? (
                                <Brain className="h-5 w-5 text-white" />
                              ) : (
                                <Palette className="h-5 w-5 text-white" />
                              )}
                            </div>

                            <div
                              className={`rounded-2xl p-4 ${
                                message.role === "user"
                                  ? activeMode === "chat"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                    : activeMode === "research"
                                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                  : "glass-morphism-dark border border-white/10 text-white"
                              }`}
                            >
                              {message.role === "assistant" && message.type && (
                                <div className="flex items-center space-x-2 mb-3">
                                  <FileText className="h-4 w-4 text-blue-400" />
                                  <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                                    {message.type === "research" ? "Research Assistant" : "Deep Analysis"}
                                  </Badge>
                                </div>
                              )}

                              <p className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>

                              {message.imageUrl && (
                                <div className="mt-4 relative group">
                                  <img
                                    src={message.imageUrl || "/placeholder.svg"}
                                    alt="Generated image"
                                    className="rounded-lg max-w-full h-auto shadow-lg"
                                    style={{ maxHeight: "400px", width: "100%", objectFit: "contain" }}
                                  />
                                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      onClick={() => downloadImage(message.imageUrl!, message.content)}
                                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <p
                                className={`text-xs mt-3 ${message.role === "user" ? "text-white/70" : "text-white/50"}`}
                              >
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-3 max-w-[85%]">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                            {activeMode === "chat" ? (
                              <Bot className="h-5 w-5 text-white" />
                            ) : activeMode === "research" ? (
                              <Brain className="h-5 w-5 text-white" />
                            ) : (
                              <Palette className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="glass-morphism-dark border border-white/10 rounded-2xl p-4">
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

                {/* Input Area */}
                <div className="border-t border-white/10 p-6 glass-morphism-dark">
                  {!user && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 text-sm">
                      <Lock className="h-4 w-4 mr-2 inline" />
                      {activeMode === "chat" && `${10 - chatMessageCount} messages remaining`}
                      {activeMode === "research" && `${10 - researchMessageCount} research queries remaining`}
                      {activeMode === "image" && `${5 - imageCount} images remaining`}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                          activeMode === "chat"
                            ? "Type your message..."
                            : activeMode === "research"
                              ? "Enter your research question..."
                              : "Describe the image you want to generate..."
                        }
                        disabled={isLoading}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pr-12 h-12 rounded-xl"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs">
                        {input.length}/{activeMode === "research" ? "2000" : activeMode === "image" ? "500" : "1000"}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={`h-12 px-6 disabled:opacity-50 ${
                        activeMode === "chat"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : activeMode === "research"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>

                  <div className="flex justify-between items-center mt-3 text-xs text-white/50">
                    <span>
                      {activeMode === "chat" && "Powered by advanced AI technology"}
                      {activeMode === "research" && "Advanced AI research capabilities"}
                      {activeMode === "image" && "AI-powered image generation with Qwen-2.5-VL"}
                    </span>
                    {user ? (
                      <span className="text-green-400">✓ Unlimited access</span>
                    ) : (
                      <span>
                        {activeMode === "chat" && `${10 - chatMessageCount} messages remaining`}
                        {activeMode === "research" && `${10 - researchMessageCount} queries remaining`}
                        {activeMode === "image" && `${5 - imageCount} images remaining`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        onDelete={contextMenu.type === "chat" ? handleDeleteChat : handleDeleteMessage}
        onCopy={handleCopyMessage}
        onDownload={contextMenu.type === "image" ? handleDownloadImage : undefined}
        type={contextMenu.type}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  )
}
