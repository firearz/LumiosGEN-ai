"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Edit3, Trash2, Copy, Download } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  isOpen: boolean
  onClose: () => void
  onDelete?: () => void
  onEdit?: () => void
  onCopy?: () => void
  onDownload?: () => void
  type: "chat" | "message" | "image"
}

export function ContextMenu({ x, y, isOpen, onClose, onDelete, onEdit, onCopy, onDownload, type }: ContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("click", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-50 glass-morphism-dark border border-white/20 rounded-lg shadow-xl py-2 min-w-[160px]"
        style={{
          left: x,
          top: y,
          transform: "translate(-50%, -10px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {type === "chat" && (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 h-8 px-3"
                onClick={() => {
                  onEdit()
                  onClose()
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3"
                onClick={() => {
                  onDelete()
                  onClose()
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </>
        )}

        {(type === "message" || type === "image") && (
          <>
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 h-8 px-3"
                onClick={() => {
                  onCopy()
                  onClose()
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
            {type === "image" && onDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 h-8 px-3"
                onClick={() => {
                  onDownload()
                  onClose()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3"
                onClick={() => {
                  onDelete()
                  onClose()
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
