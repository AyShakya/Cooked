# 🔥 Cooked: AI Social Media Profiler

**A secure, full-stack application that analyzes public social media profiles (GitHub, Reddit) to generate witty, personalized roasts using Llama 3 AI.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Live-success)
![Security](https://img.shields.io/badge/security-HttpOnly%20Cookies-red)

## 🚀 Live Demo
[**View Live App**](https://your-app-url.vercel.app)  
*(Note: Requires a VIP Access Code. Contact me for a demo key.)*

---

## 🏗️ Architecture & Security
This project was built with a "Security First" and "Zero Cost" mindset. It moves beyond standard JWT implementations by enforcing strict cross-origin policies and browser-native security headers.

### The "Fortress" Security Model
1.  **HttpOnly Cookies:** Authentication tokens are stored in `HttpOnly` cookies, making them invisible to JavaScript and immune to XSS attacks (unlike LocalStorage).
2.  **Strict CORS & SameSite Policies:** * Backend explicitly whitelists the Vercel frontend domain.
    * Cookies are set with `SameSite=None; Secure` to allow secure cross-site credentials while blocking CSRF attempts.
3.  **Anti-Brute Force Rate Limiting:** * **Auth Route:** Limits login attempts to 5 per hour per IP to prevent dictionary attacks.
    * **API Route:** Limits generation requests to 20 per 15 minutes to prevent LLM API abuse and cost spikes.
4.  **VIP Access Gate:** A custom middleware layer that restricts API usage to users with a valid access code, ensuring the free-tier infrastructure is not overwhelmed by bots.

### Tech Stack
* **Frontend:** React (Vite), Framer Motion (Animations), Lucide React (Icons).
* **Backend:** Node.js, Express, Rate-Limit-Express.
* **AI Inference:** Groq Cloud (Llama 3.1-8b-Instant) for sub-second latency.
* **Infrastructure:** Vercel (Frontend), Render (Backend).

---

## ⚖️ Engineering Trade-offs & Constraints
Every architectural decision carries a cost. Here are the specific trade-offs made for this project:

### 1. Stateless Architecture vs. Database
* **Constraint:** The app uses JWTs (JSON Web Tokens) for auth but does not store user sessions in a database.
* **Trade-off:** * *Pro:* **Zero Database Cost** and **Max Privacy**. No user data is ever persisted.
    * *Con:* We cannot invalidate a specific token before it expires (e.g., "Force Logout" functionality relies on client-side cookie clearing or short expiration times).

### 2. Render Free Tier vs. Latency
* **Constraint:** The backend is hosted on Render's free tier.
* **Trade-off:**
    * *Pro:* **$0.00 Monthly Cost.**
    * *Con:* **Cold Starts.** The server "sleeps" after 15 minutes of inactivity, causing the first request to take ~30-50 seconds. (Mitigated by a loading skeleton in the UI).

### 3. Llama 3.1-8b vs. GPT-4
* **Constraint:** Using Groq's open-source model host instead of OpenAI.
* **Trade-off:**
    * *Pro:* **Speed.** Inference is near-instant (<500ms) compared to GPT-4 (~3s).
    * *Con:* **Nuance.** The roasts are slightly less context-heavy than GPT-4, but the speed improves the UX significantly for a "fun" app.

---

## 🛠️ Local Setup

### Prerequisites
* Node.js (v18+)
* Groq API Key (Free)

### 1. Clone the Repo
```bash
git clone [https://github.com/your-username/cooked.git](https://github.com/your-username/cooked.git)
cd cooked

```

### 2. Backend Setup

```bash
cd backend
npm install

```

Create a `.env` file in `/backend`:

```env
PORT=5000
GROQ_API_KEY=your_groq_key_here
VIP_CODE=secret_password
JWT_SECRET=super_long_random_string
CLIENT_URL=http://localhost:5173

```

Start the server:

```bash
npm start

```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api

```

Start the client:

```bash
npm run dev

```

---

## 🔮 Future Improvements

* **Redis Caching:** To cache Reddit/GitHub API responses and reduce external API calls.
* **Text-to-Speech:** Utilizing the Web Speech API to read roasts aloud.
* **Roast History:** LocalStorage-based history of previous roasts.

---

## 👨‍💻 Author

**Ayush Shakya** [GitHub](https://www.google.com/search?q=https://github.com/AyShakya) | [LinkedIn](https://www.google.com/search?q=https://linkedin.com/in/your-linkedin)

```

```
