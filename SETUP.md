# 🚀 Lumios Gen Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- npm or pnpm package manager
- A Supabase account (free)
- OpenRouter API keys (already provided)

## 🔧 Installation Steps

### 1. Install Dependencies

\`\`\`bash
# Using npm
npm install

# OR using pnpm (recommended)
pnpm install
\`\`\`

### 2. Set Up Supabase

#### Step 2.1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub or email
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - Name: `lumios-gen`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
7. Click "Create new project"

#### Step 2.2: Get Your Supabase Keys
1. In your Supabase dashboard, go to Settings → API
2. Copy the following:
   - Project URL (starts with `https://`)
   - Anon public key (starts with `eyJ`)

#### Step 2.3: Update Environment Variables
1. Open `.env.local` file
2. Replace the Supabase placeholders:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

#### Step 2.4: Set Up Database Tables
1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the content from `scripts/create-tables.sql`
3. Click "Run" to create the tables

### 3. Run the Development Server

\`\`\`bash
# Using npm
npm run dev

# OR using pnpm
pnpm dev
\`\`\`

### 4. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔒 Security Notes

### API Key Security
- ✅ API keys are stored in `.env.local` (server-side only)
- ✅ `.env.local` is in `.gitignore` (never committed to Git)
- ✅ Keys are only accessible on the server, not in browser
- ✅ Next.js automatically keeps server environment variables private

### Environment Variables Explained
- `NEXT_PUBLIC_*` = Client-side (visible in browser)
- `OPENROUTER_*` = Server-side only (secure)
- Never put API keys in `NEXT_PUBLIC_*` variables!

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push your code to GitHub (without `.env.local`)
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
4. Deploy!

### Environment Variables for Production
In your deployment platform, add these variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_CHAT_API_KEY=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
OPENROUTER_RESEARCH_API_KEY=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
NEXT_PUBLIC_SITE_URL=https://your-domain.com
\`\`\`

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid URL" Error**
   - Make sure Supabase URL starts with `https://`
   - Check that anon key is complete

2. **API Keys Not Working**
   - Verify keys are exactly as provided
   - Check for extra spaces or characters
   - Restart development server after changing `.env.local`

3. **Database Errors**
   - Run the SQL script in Supabase SQL Editor
   - Check that RLS policies are enabled

### Getting Help
- Check the browser console for errors
- Verify all environment variables are set
- Make sure Supabase project is active

## 📁 Project Structure

\`\`\`
lumios-gen/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (server-side)
│   ├── chat/              # Chat page
│   ├── research/          # Research page
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions
├── scripts/               # Database scripts
├── .env.local            # Environment variables (DO NOT COMMIT)
├── .gitignore            # Git ignore file
└── package.json          # Dependencies
\`\`\`

## ✨ Features

- 🤖 Dual AI modes (Chat & Research)
- 🔐 Secure authentication with Supabase
- 🎨 Advanced animations with Framer Motion
- 📱 Fully responsive design
- 🔒 Message limits for free users
- ♾️ Unlimited access for authenticated users
- 🎭 Glassmorphism UI design
- ⚡ Real-time particle animations

Enjoy your advanced AI platform! 🚀
