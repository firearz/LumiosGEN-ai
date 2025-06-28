"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Search,
  Sparkles,
  Brain,
  Zap,
  Shield,
  Star,
  Users,
  Infinity,
  ChevronRight,
  AlertCircle,
  ImageIcon,
  Palette,
} from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/components/auth-provider"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, signOut, chatMessageCount, researchMessageCount, isSupabaseEnabled } = useAuth()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard"
    }
  }, [user])

  // Don't render the landing page if user is authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <ParticlesBackground />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        className="relative z-10 border-b border-white/10 glass-morphism-dark sticky top-0"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-purple-400" />
            </motion.div>
            <h1 className="text-xl lg:text-2xl font-bold text-gradient-purple">Lumios Gen</h1>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/chat" className="text-white/70 hover:text-purple-400 transition-colors text-sm lg:text-base">
                Chat
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/research"
                className="text-white/70 hover:text-purple-400 transition-colors text-sm lg:text-base"
              >
                Research
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/image"
                className="text-white/70 hover:text-purple-400 transition-colors text-sm lg:text-base"
              >
                Image Gen
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm lg:text-base"
                size="sm"
              >
                Get Started
              </Button>
            </motion.div>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Supabase Configuration Warning */}
      {!isSupabaseEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-yellow-600/20 border-b border-yellow-500/30"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center space-x-2 text-yellow-300 text-xs lg:text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-center">
                Demo Mode: Authentication is disabled. Configure Supabase for full functionality.
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section
        className="relative z-10 container mx-auto px-4 py-12 lg:py-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants}>
            <Badge className="mb-4 lg:mb-6 bg-purple-600/20 text-purple-300 border-purple-500/30 text-xs lg:text-sm">
              <Star className="h-3 w-3 mr-1" />
              Next Generation AI Platform
            </Badge>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 lg:mb-6 text-gradient-purple leading-tight"
          >
            The Future of
            <br />
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto]"
            >
              AI Interaction
            </motion.span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg lg:text-xl text-white/70 mb-6 lg:mb-8 leading-relaxed max-w-3xl mx-auto px-4"
          >
            Experience revolutionary AI conversations, research capabilities, and image generation. Powered by
            cutting-edge technology with
            {isSupabaseEnabled ? " unlimited possibilities for authenticated users." : " advanced AI models."}
          </motion.p>

          <motion.div variants={itemVariants} className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-xs lg:text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat: {chatMessageCount}/10 messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Research: {researchMessageCount}/10 queries</span>
              </div>
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>Images: 0/5 generated</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center mb-8 lg:mb-12 px-4"
          >
            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl w-full sm:w-auto"
              >
                <Link href="/chat">
                  <MessageCircle className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Start Chatting
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent w-full sm:w-auto"
              >
                <Link href="/research">
                  <Search className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Research Mode
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent w-full sm:w-auto"
              >
                <Link href="/image">
                  <ImageIcon className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Generate Images
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-2xl mx-auto px-4"
          >
            {[
              { icon: Users, label: "Active Users", value: "10K+" },
              { icon: MessageCircle, label: "Messages Sent", value: "1M+" },
              { icon: Brain, label: "AI Models", value: "3" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: `${index * 0.5}s` }}
                className="glass-morphism-dark rounded-lg p-4 text-center"
              >
                <stat.icon className="h-6 w-6 lg:h-8 lg:w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs lg:text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="relative z-10 container mx-auto px-4 py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="text-center mb-8 lg:mb-12">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Triple AI Experience</h3>
          <p className="text-white/70 max-w-2xl mx-auto text-base lg:text-lg">
            Three specialized AI modes designed for different needs - conversations, research, and image generation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Chat Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="glass-morphism-dark border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <MessageCircle className="h-8 w-8 lg:h-10 lg:w-10 text-purple-400" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-white text-lg lg:text-xl">Daily Chat</CardTitle>
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 mt-1 text-xs">
                      Conversational AI
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-white/70 text-sm lg:text-base">
                  Perfect for everyday conversations, quick questions, and casual AI interactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-white/80 mb-6">
                  {[
                    { icon: Zap, text: "Lightning-fast responses", color: "text-yellow-400" },
                    { icon: MessageCircle, text: "Natural conversation flow", color: "text-blue-400" },
                    { icon: Sparkles, text: "Creative assistance", color: "text-purple-400" },
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center"
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <item.icon className={`h-4 w-4 mr-3 ${item.color}`} />
                      {item.text}
                    </motion.li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm"
                  >
                    <Link href="/chat">
                      Start Chatting
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Research Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="glass-morphism-dark border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Brain className="h-8 w-8 lg:h-10 lg:w-10 text-blue-400" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-white text-lg lg:text-xl">Research Mode</CardTitle>
                    <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 mt-1 text-xs">Advanced AI</Badge>
                  </div>
                </div>
                <CardDescription className="text-white/70 text-sm lg:text-base">
                  Advanced AI for in-depth research, analysis, and comprehensive information gathering.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-white/80 mb-6">
                  {[
                    { icon: Search, text: "Deep research capabilities", color: "text-green-400" },
                    { icon: Brain, text: "Advanced analytical thinking", color: "text-blue-400" },
                    { icon: Shield, text: "Fact-based responses", color: "text-purple-400" },
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center"
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <item.icon className={`h-4 w-4 mr-3 ${item.color}`} />
                      {item.text}
                    </motion.li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm"
                  >
                    <Link href="/research">
                      Start Research
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Image Generation Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Card className="glass-morphism-dark border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <ImageIcon className="h-8 w-8 lg:h-10 lg:w-10 text-indigo-400" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-white text-lg lg:text-xl">Image Generation</CardTitle>
                    <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 mt-1 text-xs">AI Art</Badge>
                  </div>
                </div>
                <CardDescription className="text-white/70 text-sm lg:text-base">
                  Create stunning images from text descriptions using advanced AI image generation technology.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-white/80 mb-6">
                  {[
                    { icon: Palette, text: "Creative image generation", color: "text-pink-400" },
                    { icon: Sparkles, text: "High-quality AI art", color: "text-indigo-400" },
                    { icon: Zap, text: "Fast generation speed", color: "text-yellow-400" },
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center"
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <item.icon className={`h-4 w-4 mr-3 ${item.color}`} />
                      {item.text}
                    </motion.li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm"
                  >
                    <Link href="/image">
                      Generate Images
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pricing Section */}
        <motion.div variants={itemVariants} className="mt-16 lg:mt-20 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-white">Simple Pricing</h3>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass-morphism-dark border-white/20 relative">
                <CardHeader>
                  <CardTitle className="text-white text-lg lg:text-xl">Free Tier</CardTitle>
                  <CardDescription className="text-white/70 text-sm lg:text-base">
                    Perfect for trying out our AI capabilities
                  </CardDescription>
                  <div className="text-2xl lg:text-3xl font-bold text-white">
                    $0<span className="text-base lg:text-lg font-normal">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2 text-purple-400" />
                      10 chat messages per session
                    </li>
                    <li className="flex items-center">
                      <Search className="h-4 w-4 mr-2 text-blue-400" />
                      10 research queries per session
                    </li>
                    <li className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2 text-indigo-400" />5 image generations per session
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                      Basic AI responses
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass-morphism-dark border-purple-500/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-semibold">
                  RECOMMENDED
                </div>
                <CardHeader>
                  <CardTitle className="text-white text-lg lg:text-xl">Premium</CardTitle>
                  <CardDescription className="text-white/70 text-sm lg:text-base">
                    {isSupabaseEnabled ? "Unlimited access to all AI features" : "Full access (when auth is enabled)"}
                  </CardDescription>
                  <div className="text-2xl lg:text-3xl font-bold text-white">
                    Free<span className="text-base lg:text-lg font-normal"> with account</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-center">
                      <Infinity className="h-4 w-4 mr-2 text-purple-400" />
                      Unlimited chat messages
                    </li>
                    <li className="flex items-center">
                      <Infinity className="h-4 w-4 mr-2 text-blue-400" />
                      Unlimited research queries
                    </li>
                    <li className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2 text-indigo-400" />
                      100 images per day
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      Priority AI responses
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-400" />
                      Advanced features
                    </li>
                  </ul>
                  <motion.div className="mt-4" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm"
                      disabled={!isSupabaseEnabled}
                    >
                      {isSupabaseEnabled ? "Create Free Account" : "Configure Auth"}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 glass-morphism-dark border-t border-white/10 mt-16 lg:mt-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="text-center">
            <motion.div className="flex items-center justify-center space-x-2 mb-4" whileHover={{ scale: 1.05 }}>
              <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-purple-400" />
              <span className="font-semibold text-white text-base lg:text-lg">Lumios Gen</span>
            </motion.div>
            <p className="text-white/70 mb-4 lg:mb-6 text-sm lg:text-base">
              Powered by advanced AI technology for conversations, research, and image generation.
            </p>
            <div className="flex justify-center space-x-4 lg:space-x-6 text-xs lg:text-sm text-white/60">
              <Link href="#" className="hover:text-purple-400 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </motion.footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
