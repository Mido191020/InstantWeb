# 🚀 Project "InstantWeb" - Phase 1 Documentation

**Current Status:** Phase 1 (Business Design) - COMPLETE  
**Date:** February 3, 2026

---

## 1. Executive Summary

**"InstantWeb"** is an AI-powered, zero-code landing page generator for micro-businesses in Egypt and the Middle East.

The platform enables small business owners, such as café owners, tailors, and local shops, to create professional landing pages in under 60 seconds by simply describing their business in Arabic or English. Using advanced AI (Google Gemini), the platform transforms natural language prompts into fully functional, mobile-responsive web pages.

---

## 2. Project Vision

### Problem Statement

Micro-businesses in the MENA region struggle to establish an online presence due to:

- **High costs** of traditional web development
- **Technical barriers** (coding knowledge required)
- **Language barriers** (most tools are English-only)
- **Time constraints** (business owners lack time to learn new tools)

### Solution

InstantWeb eliminates these barriers by providing:

- ✅ **Zero-code interface** - No technical knowledge needed
- ✅ **Arabic-first approach** - Full RTL support and Arabic language processing
- ✅ **AI-powered generation** - Describe your business, get a landing page
- ✅ **60-second turnaround** - From prompt to published page in under a minute
- ✅ **Mobile-optimized** - All pages are responsive out of the box

---

## 3. Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TailwindCSS** | Utility-first CSS styling |
| **TypeScript** | Type-safe JavaScript |
| **Axios** | HTTP client for API requests |
| **browser-image-compression** | Client-side image optimization |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database (via Mongoose) |
| **dotenv** | Environment variable management |
| **CORS** | Cross-Origin Resource Sharing |

### AI Integration

| Technology | Purpose |
|------------|---------|
| **Google Gemini API** | Natural language to JSON conversion |

---

## 4. Project Structure

```
/instantweb-monorepo
├── /frontend          # Next.js App Router application
│   ├── /src
│   │   ├── /app       # App Router pages and layouts
│   │   └── ...
│   ├── package.json
│   └── ...
├── /backend           # Node.js + Express API server
│   ├── package.json
│   └── ...
└── README.md          # This file
```

---

## 5. Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or Atlas)
- Google Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mido191020/InstantWeb.git
   cd InstantWeb
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**

   ```bash
   cd ../backend
   npm install
   ```

4. **Configure Environment Variables**
   Create `.env` files in both frontend and backend directories with required variables.

5. **Run Development Servers**

   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev

   # Terminal 2 - Backend
   cd backend && npm start
   ```

---

## 6. Phase Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Business Design & Documentation | ✅ COMPLETE |
| **Phase 2** | Database Schema & API Design | 🔄 PENDING |
| **Phase 3** | AI Integration (Gemini) | 🔄 PENDING |
| **Phase 4** | Frontend Implementation | 🔄 PENDING |
| **Phase 5** | Testing & Deployment | 🔄 PENDING |

---

## 7. Team & Contact

**Repository:** [https://github.com/Mido191020/InstantWeb](https://github.com/Mido191020/InstantWeb)

---

*This documentation will be updated as the project progresses through each phase.*
