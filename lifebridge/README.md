# LifeBridge

A Gemini-powered web app that acts as a universal bridge between messy human intent and structured life-serving actions.

## 🌉 Overview
Real-world information is chaotic — prescription bottles, insurance forms, school notices, utility bills — and navigating the systems behind them requires expertise most people don't have. LifeBridge eliminates that friction. Throw ANY unstructured input at it (photos of medical records, voice memos, screenshots of bills, news articles, weather conditions, traffic maps) and LifeBridge instantly parses, structures, verifies, and converts them into clear, actionable next steps.

## ✨ Features
1. **Multimodal Input Zone:** Drag-and-drop images, paste text, or record voice memos (Web Speech API).
2. **Neural Bridge Processing:** A beautiful CSS-animated visualization showing raw data being structured.
3. **Structured Domain Cards:** Outputs categorized into Health, Finance, Logistics, and Government/Legal with a confidence score.
4. **Action Engine:** One-tap action buttons on cards (e.g. "Add to Calendar", "Draft Email").
5. **Timeline History:** LocalStorage-based timeline for all your past structured data.

## 🏗 Architecture
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  User Input     ├──────►│  Next.js Server ├──────►│  Gemini API     │
│  (Text/Voice/   │       │  Action wrapper │       │ (gemini-2.0-fl) │
│   Images)       │       │                 │       │                 │
└─────────────────┘       └────────┬────────┘       └────────┬────────┘
                                   │                         │
                                   ◄─────────────────────────┘
                                   │ (Enforced JSON Schema)
                                   ▼
┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │
│ Action Engine   │◄──────┤ Structured UI   │
│ (.ics, drafts,  │       │ (Cards & Warn)  │
│  reminders)     │       │                 │
└─────────────────┘       └─────────────────┘
```

## 🚀 Setup & Installation

1. **Clone the repo** and navigate into the directory
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file based off `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API key: `NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here`
4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📸 Demo Screenshots
> *Placeholder: Add screenshots of the interface here*
- [Input Zone]()
- [Processing Stage]()
- [Structured Outputs]()

## ☁️ Deployment (Vercel)
This app is ready to deploy on Vercel.
1. Connect your repository to Vercel.
2. In the Vercel dashboard, assign the `NEXT_PUBLIC_GEMINI_API_KEY` Environment Variable.
3. Deploy! (Alternatively use the CLI: `vercel --prod`)
