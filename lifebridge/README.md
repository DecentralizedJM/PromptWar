# LifeBridge

> **A universal bridge between messy human intent and structured life-serving actions.**

LifeBridge is a Next.js web application powered by **Gemini 3**. It targets a specific, high-friction problem: navigating confusing real-world information (prescription details, legal letters, dense utility bills). By photographing, dragging, or dictating this raw data to LifeBridge, the application instantly structures, categorizes, and provides single-tap executable actions (e.g., adding a deadline to a calendar, drafting an email response) strictly via local, secure processes.

## 🎯 Core Problem Statement
The modern world runs on systems that require expertise to navigate, yet present that information chaotically to the end user. LifeBridge eliminates that friction entirely. 
**Success State:** Users throw a mess of photos or voice notes at the UI, and within 3 seconds, they receive beautifully categorized Next Steps securely.

## ⚡ Tech Stack & Architecture

- **Frontend:** Next.js 15 (App Router), React 19, Vanilla Tailwind CSS
- **AI Processing:** `@google/genai` (Gemini 3 Flash Preview) with strict JSON Schema enforced structured outputs.
- **Multimodal Inputs:** Native HTML5 Drag and Drop API, Web Speech API for voice dictation.
- **Data Persistence:** LocalStorage (zero-latency, absolute privacy for history logs).
- **Icons & UI:** `lucide-react`, Custom CSS Keyframe Animations (Neural Bridge effect).

### 💳 Google Services & Free Tiers
*This application relies on the Google Gemini API to operate. You must provide your own API key.*
- **Gemini API:** Utilizes the Free Tier (Up to 15 Requests Per Minute / 1 million tokens per minute limit). Absolutely free of charge for prototyping. No credit card required.

## 🚀 Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/DecentralizedJM/PromptWar.git
cd PromptWar/lifebridge
```

2. **Install all dependencies:**
```bash
npm install
```

3. **Configure the Environment:**
Copy the placeholder `.env.example` file to create your own localized `.env`:
```bash
cp .env.example .env.local
```
Inside `.env.local`, set your Gemini API Data Key:
```text
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can obtain a free key at [Google AI Studio](https://aistudio.google.com/apikey))*

4. **Run the local development server:**
```bash
npm run dev
```
Open `http://localhost:3000` to view the app.

## ☁️ Deployment (Vercel)

This application is structurally optimized and pre-configured for a zero-friction Vercel deployment. Wait times on cold boots have been preemptively minimized.

### One-Command Deploy:
Ensure you have the Vercel CLI installed globally (`npm i -g vercel`), then run:
```bash
npm run deploy
```
*(Alias for `vercel --prod`)*

### Vercel Dashboard Method:
1. Connect your GitHub repository to Vercel.
2. Under "Environment Variables", assign `GEMINI_API_KEY` and `NEXT_PUBLIC_GEMINI_API_KEY` to your generated Google AI Studio API key.
3. Click **Deploy**.

**Custom Domain Instructions:**
Once deployed on Vercel, navigate to **Settings > Domains**. Enter your custom domain (e.g., `lifebridge.app`), and Vercel will automatically provision specific A Records or CNAME configurations for you to add to your DNS provider (e.g., Cloudflare or Namecheap). SSL provisioning is handled automatically.

## 🔒 Security & Privacy Guarantees
- The Gemini generation executes entirely on a Next.js Server Action (`src/lib/gemini.ts`), shielding your `GEMINI_API_KEY` from the client.
- Your timeline data and generated documents are stored exclusively in the browser's `localStorage` — no databases are exposed or retained in the backend.

---
*Built with speed, precision, and obsession for the end-user by [PromptSmith / Antigravity Agent].*
