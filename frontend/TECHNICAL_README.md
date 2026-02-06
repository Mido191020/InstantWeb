# InstantWeb 🚀

**AI-Powered Website Builder for Micro-Businesses**

> *InstantWeb transforms a simple chat conversation into a fully functional, deployed website in seconds. Built for the Egyptian market with strict local validation and Arabic-first design.*

![InstantWeb Demo](https://placehold.co/1200x600/14b8a6/ffffff?text=InstantWeb+Preview)

## 📋 Project Overview

InstantWeb is a Next.js 15 application that leverages a **Generative UI** architecture. It acts as an intelligent "Concierge" that interviews business owners via a WhatsApp-style chat, extracts structured business data (Business Name, Phone, Services) using an LLM, and instantly injects this data into a live, responsive website preview.

**Key Features:**

- **🤖 AI Extraction Engine**: Powered by Groq (Llama 3 70B) with few-shot prompting for high-fidelity JSON extraction.
- **🇪🇬 Localization Core**: Specialized handling for Arabic extraction, RTL layouts, and Egyptian phone number validation.
- **🛡️ Sycophancy Prevention**: Rigorous `Zod` schema validation ensures no hallucinated data breaks the UI.
- **⚡ Live Preview**: Real-time DOM injection into a standalone Landing Page template (Landwind).

---

## 🏗️ Technical Architecture

### 1. The Generative Service (`/src/lib/services/generative-service.ts`)

The core extraction logic is decoupled from the UI. It features:

- **Arabic Digit Normalization**: Automatically converts `٠١٢` to `012` before validation.
- **Retry Strategy**: Implements exponential backoff (wait 2s) for HTTP 429 Rate Limits from the LLM provider.
- **Mock Fallback**: A robust Regex-based fallback system ensures the app works even if the AI API is down.

### 2. The Extraction Bridge (`/src/app/api/extract/route.ts`)

A server-side Next.js API route that proxies requests to Groq, securing the `GROQ_API_KEY`.

- **Timeout Management**: Enforces a strict 10s timeout using `AbortController` to prevent hanging requests.
- **Strict JSON Mode**: System prompts leverage "JSON Mode" principles to guarantee parseable output.

### 3. The Injection Engine (`/src/lib/utils/template-injector.ts`)

We don't use React state for the Preview to avoid re-rendering the entire app. Instead, we use `cheerio` (server-side) or direct DOM manipulation methodologies to inject content into the static HTML template, maintaining 100% SEO integrity and performance.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Groq API Key (for Live AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/instantweb.git

# Install dependencies
cd instantweb/frontend
npm install

# Setup Environment
echo "GROQ_API_KEY=your_key_here" > .env.local
```

### Running Locally

```bash
npm run dev
# Visit http://localhost:3000
```

---

## 🧪 Verification & Testing

The project includes a suite of automated and manual verification steps:

- **Linting**: Strict ESLint configuration (`npm run lint`).
- **Unit Tests**: Generative Service logic verification.
- **Thumb Rule**: All interactive elements verified to be min. 44px height for mobile accessibility.

### Manual Verification Flow

1. **Login**: Use dummy credentials (`test@example.com` / `password`).
2. **Chat**: Enter an Arabic business description (e.g., "مطعم كشري التحرير...").
3. **Observe**: The "Extraction Indicator" badge activates.
4. **Success**: The Live Preview updates instantly with the extracted data.

---

## 📦 Deployment

Optimized for **Vercel** with `output: 'standalone'` in `next.config.ts`.

1. Push to GitHub.
2. Import project in Vercel.
3. Add `GROQ_API_KEY` to Environment Variables.
4. Deploy!

---

## 🛠️ Built With

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS / Lucide React
- **AI**: Groq SDK / Llama 3
- **Validation**: Zod
- **Auth**: Custom JWT-ready structure

---

*Built with ❤️ for the Open Source Community.*
