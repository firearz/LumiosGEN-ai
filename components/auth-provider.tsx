"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient, isSupabaseEnabled } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  chatMessageCount: number
  researchMessageCount: number
  incrementChatCount: () => void
  incrementResearchCount: () => void
  resetCounts: () => void
  isSupabaseEnabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [chatMessageCount, setChatMessageCount] = useState(0)
  const [researchMessageCount, setResearchMessageCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      if (!isSupabaseEnabled) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.warn("Supabase auth error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    if (isSupabaseEnabled) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === "SIGNED_IN") {
          resetCounts()
        }
      })

      // Load message counts from localStorage
      const savedChatCount = localStorage.getItem("chatMessageCount")
      const savedResearchCount = localStorage.getItem("researchMessageCount")

      if (savedChatCount) setChatMessageCount(Number.parseInt(savedChatCount))
      if (savedResearchCount) setResearchMessageCount(Number.parseInt(savedResearchCount))

      return () => subscription.unsubscribe()
    } else {
      // Load message counts from localStorage when Supabase is not enabled
      const savedChatCount = localStorage.getItem("chatMessageCount")
      const savedResearchCount = localStorage.getItem("researchMessageCount")

      if (savedChatCount) setChatMessageCount(Number.parseInt(savedChatCount))
      if (savedResearchCount) setResearchMessageCount(Number.parseInt(savedResearchCount))
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      throw new Error("Authentication is not available. Please configure Supabase.")
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseEnabled) {
      throw new Error("Authentication is not available. Please configure Supabase.")
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (!isSupabaseEnabled) {
      throw new Error("Authentication is not available. Please configure Supabase.")
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
    resetCounts()
  }

  const incrementChatCount = () => {
    const newCount = chatMessageCount + 1
    setChatMessageCount(newCount)
    localStorage.setItem("chatMessageCount", newCount.toString())
  }

  const incrementResearchCount = () => {
    const newCount = researchMessageCount + 1
    setResearchMessageCount(newCount)
    localStorage.setItem("researchMessageCount", newCount.toString())
  }

  const resetCounts = () => {
    setChatMessageCount(0)
    setResearchMessageCount(0)
    localStorage.removeItem("chatMessageCount")
    localStorage.removeItem("researchMessageCount")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        chatMessageCount,
        researchMessageCount,
        incrementChatCount,
        incrementResearchCount,
        resetCounts,
        isSupabaseEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
