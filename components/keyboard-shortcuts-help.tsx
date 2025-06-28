"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Keyboard } from "lucide-react"

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["Ctrl", "N"], description: "Create new chat" },
        { keys: ["Ctrl", "/"], description: "Focus search" },
        { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
        { keys: ["/"], description: "Focus input" },
      ],
    },
    {
      category: "Chat",
      items: [
        { keys: ["Ctrl", "Enter"], description: "Send message" },
        { keys: ["Esc"], description: "Close dialogs" },
      ],
    },
    {
      category: "General",
      items: [
        { keys: ["?"], description: "Show this help" },
        { keys: ["Right Click"], description: "Context menu" },
      ],
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <Card className="glass-morphism-dark border-white/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Keyboard className="h-5 w-5 mr-2 text-purple-400" />
                    Keyboard Shortcuts
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {shortcuts.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-white/80 font-medium mb-3 text-sm">{category.category}</h3>
                    <div className="space-y-2">
                      {category.items.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">{shortcut.description}</span>
                          <div className="flex items-center space-x-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <Badge
                                key={keyIndex}
                                variant="outline"
                                className="text-xs px-2 py-1 bg-white/10 border-white/20 text-white/90"
                              >
                                {key}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/50 text-xs text-center">
                    Use{" "}
                    <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white/90">
                      Cmd
                    </Badge>{" "}
                    on Mac instead of{" "}
                    <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white/90">
                      Ctrl
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
