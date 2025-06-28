"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MessageCircle, Brain, ImageIcon, Clock, User, Settings, LogOut, Sparkles, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ContextMenu } from "@/components/context-menu"

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  type: "chat" | "research" | "image"
  messageCount: number
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
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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
  const { user, signOut } = useAuth()

  // Load sessions for current chat type
  useEffect(() => {
    const loadSessions = () => {
      const storageKey = `${chatType}_sessions_${user?.id || "guest"}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const loadedSessions = JSON.parse(saved).map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
        }))
        setSessions(loadedSessions)
      }
    }

    loadSessions()

    // Set up global function for updating sessions
    ;(window as any).updateChatSession = (chatId: string, lastMessage: string, title?: string) => {
      const storageKey = `${chatType}_sessions_${user?.id || "guest"}`
      const existing = localStorage.getItem(storageKey)
      const existingSessions = existing ? JSON.parse(existing) : []

      const updatedSessions = existingSessions.map((session: ChatSession) => {
        if (session.id === chatId) {
          return {
            ...session,
            lastMessage: lastMessage.slice(0, 100),
            timestamp: new Date(),
            title: title || session.title,
          }
        }
        return session
      })

      localStorage.setItem(storageKey, JSON.stringify(updatedSessions))
      setSessions(
        updatedSessions.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
        })),
      )
    }

    return () => {
      delete (window as any).updateChatSession
    }
  }, [chatType, user])

  // Filter sessions based on search
  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const handleDeleteChat = () => {
    if (contextMenu.chatId) {
      const updatedSessions = sessions.filter((session) => session.id !== contextMenu.chatId)
      setSessions(updatedSessions)

      // Update localStorage
      const storageKey = `${chatType}_sessions_${user?.id || "guest"}`
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions))

      // Clear current chat if it's the one being deleted
      if (currentChatId === contextMenu.chatId) {
        onNewChat()
      }
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

  if (!isOpen) return null

  return (
    <>
      {/* Mobile Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        onClick={onToggle}
      />

      {/* Sidebar */}
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
            <Button variant="ghost" size="icon" onClick={onToggle} className="text-white/70 hover:text-white h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onNewChat}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              New {chatType === "chat" ? "Chat" : chatType === "research" ? "Research" : "Image"}
            </Button>
          </motion.div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white/60 text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recent {chatType === "chat" ? "Chats" : chatType === "research" ? "Research" : "Images"}
            </h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <AnimatePresence>
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="group"
                  >
                    <Button
                      onClick={() => onChatSelect(session.id)}
                      onContextMenu={(e) => handleContextMenu(e, session.id)}
                      variant="ghost"
                      className={`w-full justify-start text-left h-auto p-3 hover:bg-white/10 ${
                        currentChatId === session.id ? "bg-white/10 border border-white/20" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className="flex-shrink-0 mt-1">{getTypeIcon(session.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{session.title}</p>
                          <p className="text-white/60 text-xs mt-1 line-clamp-2">{session.lastMessage}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline" className={`text-xs ${getTypeColor(session.type)}`}>
                              {session.type}
                            </Badge>
                            <span className="text-white/50 text-xs">{session.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredSessions.length === 0 && (
                <div className="text-center py-8">
                  {getTypeIcon(chatType)}
                  <div className="mx-auto mb-4" />
                  <p className="text-white/60 text-sm">No conversations yet</p>
                  <p className="text-white/40 text-xs mt-1">Start a new conversation to see it here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || user?.email || "Guest User"}
                </p>
                <p className="text-white/60 text-xs">{user ? "Premium Plan" : "Free Plan"}</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        onDelete={handleDeleteChat}
        onCopy={() => {}}
        type="chat"
      />
    </>
  )
}
