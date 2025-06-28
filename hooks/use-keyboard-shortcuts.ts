"use client"

import type React from "react"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onNewChat: () => void
  onSearch: () => void
  onToggleSidebar: () => void
  onEscape: () => void
  onSend: (e: React.FormEvent) => void
  onFocusInput: () => void
}

export function useKeyboardShortcuts({
  onNewChat,
  onSearch,
  onToggleSidebar,
  onEscape,
  onSend,
  onFocusInput,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA"

      // Ctrl/Cmd + N - New Chat
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        onNewChat()
        return
      }

      // Ctrl/Cmd + / - Search
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        onSearch()
        return
      }

      // Ctrl/Cmd + B - Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        onToggleSidebar()
        return
      }

      // Escape - Close modals/menus
      if (e.key === "Escape") {
        onEscape()
        return
      }

      // / - Focus input (when not already focused)
      if (e.key === "/" && !isInputFocused && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onFocusInput()
        return
      }

      // Ctrl/Cmd + Enter - Send message (when input is focused)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isInputFocused) {
        e.preventDefault()
        onSend(e as any)
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onNewChat, onSearch, onToggleSidebar, onEscape, onSend, onFocusInput])
}
