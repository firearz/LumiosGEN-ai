"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle, Search, X, Clock, ImageIcon, Brain } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { ContextMenu } from "@/components/context-menu"

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  type: "chat" | "research" | "image"
}

interface ChatSidebarProps {
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  chatType: "chat" | "research" | "image"
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({ currentChatId, onChatSelect, onNewChat, chatType, isOpen, onToggle }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    isOpen: boolean
    chatId: string | null
  }>({
    x: 0,
    y: 0,
    isOpen: false,
    chatId: null,
  })
  const { user } = useAuth()

  // Load chat sessions from localStorage
  useEffect(() => {
    const loadChatSessions = () => {
      const storageKey = `${chatType}_sessions_${user?.id || "guest"}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const sessions = JSON.parse(saved).map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
        }))
        setChatSessions(
          sessions.sort((a: ChatSession, b: ChatSession) => b.timestamp.getTime() - a.timestamp.getTime()),
        )
      }
    }

    loadChatSessions()
  }, [chatType, user])

  // Save chat sessions to localStorage
  const saveChatSessions = (sessions: ChatSession[]) => {
    const storageKey = `${chatType}_sessions_${user?.id || "guest"}`
    localStorage.setItem(storageKey, JSON.stringify(sessions))
    setChatSessions(sessions)
  }

  // Create new chat session
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `New ${chatType === "chat" ? "Chat" : chatType === "research" ? "Research" : "Image Generation"}`,
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      type: chatType,
    }

    const updatedSessions = [newSession, ...chatSessions]
    saveChatSessions(updatedSessions)
    onChatSelect(newSession.id)
    onNewChat()

    // Don't close sidebar on desktop
    if (window.innerWidth < 1024) {
      onToggle()
    }
  }

  // Update chat session
  const updateChatSession = (chatId: string, lastMessage: string, title?: string) => {
    const updatedSessions = chatSessions
      .map((session) => {
        if (session.id === chatId) {
          return {
            ...session,
            lastMessage: lastMessage.slice(0, 100),
            timestamp: new Date(),
            messageCount: session.messageCount + 1,
            title: title || session.title,
          }
        }
        return session
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    saveChatSessions(updatedSessions)
  }

  // Delete chat session
  const deleteChatSession = (chatId: string) => {
    const updatedSessions = chatSessions.filter((session) => session.id !== chatId)
    saveChatSessions(updatedSessions)

    if (currentChatId === chatId) {
      onNewChat()
    }
  }

  // Edit chat title
  const startEditing = (session: ChatSession) => {
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      const updatedSessions = chatSessions.map((session) =>
        session.id === editingId ? { ...session, title: editTitle.trim() } : session,
      )
      saveChatSessions(updatedSessions)
    }
    setEditingId(null)
    setEditTitle("")
  }

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      chatId,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, isOpen: false, chatId: null })
  }

  const handleDeleteFromContext = () => {
    if (contextMenu.chatId) {
      deleteChatSession(contextMenu.chatId)
    }
  }

  const handleEditFromContext = () => {
    if (contextMenu.chatId) {
      const session = chatSessions.find((s) => s.id === contextMenu.chatId)
      if (session) {
        startEditing(session)
      }
    }
  }

  // Filter chats based on search
  const filteredChats = chatSessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Group chats by date
  const groupChatsByDate = (chats: ChatSession[]) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const groups = {
      today: [] as ChatSession[],
      yesterday: [] as ChatSession[],
      lastWeek: [] as ChatSession[],
      older: [] as ChatSession[],
    }

    chats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp)
      if (chatDate.toDateString() === today.toDateString()) {
        groups.today.push(chat)
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(chat)
      } else if (chatDate > lastWeek) {
        groups.lastWeek.push(chat)
      } else {
        groups.older.push(chat)
      }
    })

    return groups
  }

  const groupedChats = groupChatsByDate(filteredChats)

  // Expose updateChatSession function globally for use in chat components
  useEffect(() => {
    ;(window as any).updateChatSession = updateChatSession

    // Initialize default chat session if none exists
    if (!currentChatId && chatSessions.length === 0) {
      createNewChat()
    }
  }, [chatSessions, currentChatId])

  const getIcon = () => {
    switch (chatType) {
      case "chat":
        return MessageCircle
      case "research":
        return Brain
      case "image":
        return ImageIcon
      default:
        return MessageCircle
    }
  }

  const Icon = getIcon()

  const getTitle = () => {
    switch (chatType) {
      case "chat":
        return "Chat History"
      case "research":
        return "Research History"
      case "image":
        return "Image History"
      default:
        return "History"
    }
  }

  const getNewButtonText = () => {
    switch (chatType) {
      case "chat":
        return "New Chat"
      case "research":
        return "New Research"
      case "image":
        return "New Image Gen"
      default:
        return "New"
    }
  }

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={onToggle}
            />

            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-80 glass-morphism-dark border-r border-white/10 z-40 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold flex items-center text-sm lg:text-base">
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-purple-400" />
                    {getTitle()}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white h-8 w-8"
                    onClick={onToggle}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* New Chat Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={createNewChat}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mb-4 h-9 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {getNewButtonText()}
                  </Button>
                </motion.div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {Object.entries(groupedChats).map(([period, chats]) => {
                    if (chats.length === 0) return null

                    const periodLabels = {
                      today: "Today",
                      yesterday: "Yesterday",
                      lastWeek: "Last 7 days",
                      older: "Older",
                    }

                    return (
                      <div key={period}>
                        <h3 className="text-white/60 text-xs lg:text-sm font-medium mb-3 flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          {periodLabels[period as keyof typeof periodLabels]}
                        </h3>
                        <div className="space-y-2">
                          {chats.map((session) => (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                                currentChatId === session.id
                                  ? "bg-purple-600/20 border border-purple-500/30"
                                  : "bg-white/5 hover:bg-white/10 border border-transparent"
                              }`}
                              onClick={() => {
                                onChatSelect(session.id)
                                // Close sidebar on mobile after selection
                                if (window.innerWidth < 1024) {
                                  onToggle()
                                }
                              }}
                              onContextMenu={(e) => handleContextMenu(e, session.id)}
                            >
                              {editingId === session.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEdit()
                                      if (e.key === "Escape") {
                                        setEditingId(null)
                                        setEditTitle("")
                                      }
                                    }}
                                    className="bg-white/10 border-white/20 text-white text-sm h-8"
                                    autoFocus
                                  />
                                  <div className="flex space-x-2">
                                    <Button size="sm" onClick={saveEdit} className="h-6 text-xs px-2">
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingId(null)
                                        setEditTitle("")
                                      }}
                                      className="h-6 text-xs px-2"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-white text-sm font-medium truncate">{session.title}</h4>
                                      {session.lastMessage && (
                                        <p className="text-white/60 text-xs mt-1 line-clamp-2">{session.lastMessage}</p>
                                      )}
                                      <div className="flex items-center mt-2 space-x-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-white/20 text-white/70 px-1 py-0"
                                        >
                                          {session.messageCount} {session.type === "image" ? "images" : "messages"}
                                        </Badge>
                                        <span className="text-white/50 text-xs">
                                          {session.timestamp.toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {filteredChats.length === 0 && (
                    <div className="text-center py-8">
                      <Icon className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 text-sm">
                        {searchQuery ? "No conversations found" : "No conversations yet"}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {searchQuery ? "Try a different search term" : "Start a new conversation to see it here"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <div className="text-center text-white/50 text-xs">
                  {chatSessions.length} conversation{chatSessions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        onDelete={handleDeleteFromContext}
        onEdit={handleEditFromContext}
        type="chat"
      />
    </>
  )
}
