<div align="center">
<h1>🚀 CampusGuide AI</h1>
  
  <p><strong>An ultra-modern, high-tech AI platform designed to seamlessly navigate campus resources.</strong></p>

  <img src="docs/assets/hero_banner.png" alt="CampusGuide Hero Banner" width="800" style="border-radius: 10px; margin-top: 15px; margin-bottom: 25px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);" />

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/AI-Groq_&_Gemini-FF6B6B?style=for-the-badge" alt="Groq & Gemini" />
    <img src="https://img.shields.io/badge/SerpApi-Web_Search-4285F4?style=for-the-badge" alt="SerpApi" />
  </p>
</div>

---


## 🌟 Overview

**CampusGuide** is a state-of-the-art AI chatbot interface built to help students effortlessly navigate their university life. From finding the library's operational hours to checking out the latest upcoming events, CampusGuide utilizes cutting-edge Large Language Models (LLMs) to provide real-time, context-aware, and highly accurate responses. 

Step into the future of education management with our sleek, glassmorphism-inspired interface featuring seamless Light and Dark themes, and lightning-fast search capabilities powered by a dedicated knowledge base.

---

## 🎥 Demonstration Interface

Experience the speed and intelligence of CampusGuide in action:

<div align="center">
  <img src="docs/assets/demo_video.webp" alt="CampusGuide Demo Video" width="800" style="border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);" />
</div>

---

## ✨ What's New? (Recent Updates)

- **🍃 Mint Mist Nature UI:** Transformed the application's visual identity to a bright, airy "Mint Mist" light theme with elegant green accents, remapped text to deep mint-charcoal colors, and glassmorphism high-opacity panels.
- **🔐 Secure Identity & Role-based Login:** Implemented a gatekeeper login screen capturing user details (Visitor, Fresher, Student) and validating College IDs.
- **🗃️ Bulletproof Database Init:** Resolved internal SQLite syntax errors for flawless initialization.

---

## ✨ Cutting-Edge Features

- **🧠 Intelligent AI Avatar:** Context-aware conversations powered by the latest Groq/Llama LLM capabilities.
- **🗺️ Interactive Data Retrieval:** Instantly lookup Facilities, Clubs, Upcoming Events, and Admission rules.
- **🎨 Premium Nature-Inspired UI:** Award-winning UX/UI featuring the new Mint Mist theme. Soft glowing accents, sophisticated white glassmorphism, and buttery smooth Framer Motion animations.
- **⚡ Blazing Fast Architecture:** Built on Vite React and powered by an optimized Express and SQLite backend for zero-latency queries.
- **🖼️ Multimodal Support:** Send both text and images to the CampusBrain for contextual assistance (Powered by Llama-3.2-90b-vision-preview).
- **💾 Local Knowledge Graph:** Robust `better-sqlite3` database pre-loaded with comprehensive campus information extending search via intelligent keyword mapping.
- **🌐 Live Web Search Fallback:** Automatically queries live data using `SerpAPI` and integrates answers directly into the chat when the local database doesn't have the answer.
- **🕸️ Content Scraping Tools:** Built-in capability using `Cheerio` and `Axios` to fetch external content.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via `better-sqlite3`) |
| **Web Utilities**| Axios, Cheerio (`scrape_website` utilities) |
| **AI & APIs** | Groq API (Llama 3.2/3.3), Google Gen AI SDK, SerpApi (Live Web Search) |

---

## 🚀 Run Locally

Experience it on your own machine.

### Prerequisites:
- **Node.js** (v18+ recommended)
- **API Keys** for Groq / Gemini

### Installation

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment variables**
   Create a `.env` file (or update `.env.local`) and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   SERPAPI_API_KEY=your_serpapi_api_key_here
   ```

3. **Launch the Engine**
   Fire up the backend and frontend simultaneously:
   ```bash
   npm run dev
   ```
   > 🔗 *The application will instantly boot up at [http://localhost:5000](http://localhost:5000)*
   > 🔗 *The application login dashboard will instantly boot up at [http://localhost:5000/api/users](http://localhost:5000/api/users)*

---
