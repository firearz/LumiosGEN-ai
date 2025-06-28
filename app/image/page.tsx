"use client"

import type React from "react"
import { Send } from "lucide-react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Home, Sparkles, User, Palette, Lock, LogOut, Zap, Download, Menu } from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { AuthModal } from "@/components/auth-modal"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ContextMenu } from "@/components/context-menu"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"

interface ImageMessage {
  id: string
  role: "user" | "assistant"
  content: string
  imageUrl?: string
  timestamp: Date
}

export default function ImagePage() {
  const [messages, setMessages] = useState<ImageMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to Lumios Image Gen! I'm your AI-powered image generation assistant using Qwen-2.5-VL-3B-Instruct. I can create stunning images from your text descriptions. Describe what you'd like to see and I'll bring it to life! What would you like me to create today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [imageCount, setImageCount] = useState(0)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    isOpen: boolean
    messageId: string | null
    type: "message" | "image"
    imageUrl?: string
    content: string
  }>({
    x: 0,
    y: 0,
    isOpen: false,
    messageId: null,
    type: "message",
    content: "",
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxImages = user ? 100 : 5
  const canGenerateImage = imageCount < maxImages

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Load image count from localStorage
  useEffect(() => {
    const today = new Date().toDateString()
    const storageKey = `image_count_${user?.id || "guest"}_${today}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setImageCount(Number.parseInt(saved))
    }
  }, [user])

  // Load image messages for selected chat
  const loadChatMessages = (chatId: string) => {
    const storageKey = `image_messages_${chatId}_${user?.id || "guest"}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const loadedMessages = JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(loadedMessages)
    } else {
      // New image generation - start with welcome message
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Welcome to Lumios Image Gen! I'm your AI-powered image generation assistant using Qwen-2.5-VL-3B-Instruct. I can create stunning images from your text descriptions. Describe what you'd like to see and I'll bring it to life! What would you like me to create today?",
          timestamp: new Date(),
        },
      ])
    }
  }

  // Save image messages
  const saveChatMessages = (chatId: string, msgs: ImageMessage[]) => {
    if (!chatId) return
    const storageKey = `image_messages_${chatId}_${user?.id || "guest"}`
    localStorage.setItem(storageKey, JSON.stringify(msgs))
  }

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    loadChatMessages(chatId)
  }

  // Handle new image generation
  const handleNewChat = () => {
    setCurrentChatId(null)
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Welcome to Lumios Image Gen! I'm your AI-powered image generation assistant using Qwen-2.5-VL-3B-Instruct. I can create stunning images from your text descriptions. Describe what you'd like to see and I'll bring it to life! What would you like me to create today?",
        timestamp: new Date(),
      },
    ])
  }

  // Handle right-click context menu
  const handleMessageContextMenu = (e: React.MouseEvent, message: ImageMessage) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      messageId: message.id,
      type: message.imageUrl ? "image" : "message",
      imageUrl: message.imageUrl,
      content: message.content,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, isOpen: false, messageId: null, type: "message", content: "" })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!canGenerateImage) {
      toast({
        title: "Image limit reached",
        description: user ? "You've reached your daily limit of 100 images!" : "Sign up for 100 images per day!",
        variant: "destructive",
      })
      if (!user) {
        setIsAuthModalOpen(true)
      }
      return
    }

    const userMessage: ImageMessage = {
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

    // Update image count
    const today = new Date().toDateString()
    const storageKey = `image_count_${user?.id || "guest"}_${today}`
    const newCount = imageCount + 1
    setImageCount(newCount)
    localStorage.setItem(storageKey, newCount.toString())

    // Create new image generation if none selected
    let chatId = currentChatId
    if (!chatId) {
      chatId = Date.now().toString()
      setCurrentChatId(chatId)
    }

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate image")

      const data = await response.json()

      const assistantMessage: ImageMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've generated an image based on your prompt: "${promptText}"`,
        imageUrl: data.imageUrl,
        timestamp: new Date(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Save messages and update image session
      saveChatMessages(chatId, finalMessages)

      // Update image session in sidebar
      if ((window as any).updateChatSession) {
        const title = promptText.slice(0, 50) + (promptText.length > 50 ? "..." : "")
        ;(window as any).updateChatSession(chatId, "Generated image", title)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ImageMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error while generating your image. Please try again.",
        timestamp: new Date(),
      }
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      saveChatMessages(chatId, finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize default image generation on first load
  useEffect(() => {
    if (!currentChatId) {
      const defaultChatId = "default-image-" + Date.now()
      setCurrentChatId(defaultChatId)

      // Create and save the default image session
      const defaultSession = {
        id: defaultChatId,
        title: "Image Generation",
        lastMessage: "Welcome to Lumios Image Gen!",
        timestamp: new Date(),
        messageCount: 1,
        type: "image" as const,
      }

      const storageKey = `image_sessions_${user?.id || "guest"}`
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
      if (input.trim() && canGenerateImage && !isLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <ParticlesBackground />

      {/* Image Sidebar */}
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        chatType="image"
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
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <ImageIcon className="h-6 w-6 text-indigo-400" />
              </motion.div>
              <h1 className="text-xl font-semibold text-white hidden sm:block">Image Generation</h1>
              <h1 className="text-lg font-semibold text-white sm:hidden">Images</h1>
              <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                <Palette className="h-3 w-3 mr-1" />
                Qwen-2.5-VL
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="text-xs lg:text-sm text-white/60">
              {imageCount}/{maxImages} images {user ? "today" : "remaining"}
            </div>

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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs lg:text-sm"
              >
                <span className="hidden sm:inline">Sign Up for 100/day</span>
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

      {/* Image Generation Interface */}
      <div
        className={`relative z-10 container mx-auto px-4 py-6 max-w-6xl transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""}`}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        >
          <Card className="glass-morphism-dark border-indigo-500/30 h-[calc(100vh-200px)] flex flex-col shadow-2xl overflow-hidden">
            <CardHeader className="flex-shrink-0 border-b border-white/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <span className="text-white text-lg lg:text-xl">Lumios Gen - AI Image Creator</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="hidden sm:inline">Image Gen Active</span>
                  </Badge>
                  <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">AI Powered</span>
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
                          className={`flex items-start space-x-3 lg:space-x-4 max-w-[90%] ${
                            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                : "bg-gradient-to-r from-pink-600 to-orange-600"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                            ) : (
                              <Palette className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                            )}
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={`rounded-2xl p-4 lg:p-5 min-w-0 flex-1 ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                : "glass-morphism-dark border border-white/10 text-white"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base break-words word-wrap mb-3">
                              {message.content}
                            </p>

                            {message.imageUrl && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative group"
                              >
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
                              </motion.div>
                            )}

                            <p
                              className={`text-xs mt-3 ${
                                message.role === "user" ? "text-indigo-200" : "text-white/50"
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
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start w-full"
                    >
                      <div className="flex items-start space-x-4 max-w-[90%]">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-orange-600 flex items-center justify-center">
                          <Palette className="h-6 w-6 text-white" />
                        </div>
                        <div className="glass-morphism-dark border border-white/10 rounded-2xl p-5">
                          <div className="flex items-center space-x-2 mb-3">
                            <ImageIcon className="h-4 w-4 text-indigo-400" />
                            <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-300">
                              Generating image...
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            {[0, 1, 2, 3].map((i) => (
                              <motion.div
                                key={i}
                                className="w-3 h-3 bg-indigo-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.4,
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
                {!canGenerateImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-sm flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {user
                      ? "You've reached your daily limit of 100 images. Try again tomorrow!"
                      : "You've reached the 5 image limit. Sign up for 100 images per day!"}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        canGenerateImage
                          ? "Describe the image you want to generate..."
                          : user
                            ? "Daily limit reached. Try again tomorrow!"
                            : "Sign up to continue generating images..."
                      }
                      disabled={isLoading || !canGenerateImage}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pr-12 h-12 lg:h-14 rounded-xl text-sm lg:text-base"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs">
                      {input.length}/500
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || !canGenerateImage || !input.trim()}
                      className="h-12 lg:h-14 px-4 lg:px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </motion.div>
                </form>

                <div className="flex justify-between items-center mt-4 text-xs text-white/50">
                  <span className="hidden sm:inline">AI-powered image generation with Qwen-2.5-VL-3B-Instruct</span>
                  <span className="sm:hidden">AI image generation</span>
                  <span>
                    {imageCount}/{maxImages} images {user ? "used today" : "remaining"}
                  </span>
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
        onDownload={contextMenu.type === "image" ? handleDownloadImage : undefined}
        type={contextMenu.type}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
