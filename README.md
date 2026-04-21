# Cooked

Cooked is a full-stack AI web application that generates playful roasts from public social profile signals.
It is designed as a resume project to demonstrate practical backend security, API design, and polished frontend UX.

## Project Summary

Given a GitHub or Reddit username, Cooked:

1. Fetches public profile/activity data from platform APIs.
2. Converts that data into a compact feature profile.
3. Sends the profile to a hosted LLM (Llama 3.1 via Groq).
4. Returns a stylized 4-line roast in one of multiple tones.

This project intentionally focuses on secure API access, low operational cost, and responsive UI interactions.

## Highlights

- Full-stack JavaScript architecture (React + Express).
- JWT-based access control using HttpOnly cookies.
- VIP gate flow to protect public endpoints from abuse.
- Rate limiting on both authentication and generation routes.
- Multi-style prompt system (Friendly, Savage, Analyst).
- Framer Motion powered UI transitions and stateful UX flow.

## Tech Stack

- Frontend: React 19, Vite, Axios, Framer Motion, Lucide Icons.
- Backend: Node.js, Express 5, cookie-parser, jsonwebtoken, express-rate-limit.
- AI: Groq OpenAI-compatible endpoint, model llama-3.1-8b-instant.
- External Data Sources: GitHub REST API, Reddit public JSON endpoints.

## Architecture

### Frontend Responsibilities

- Handles VIP login flow and session-like UX state.
- Calls backend endpoints with credentials enabled.
- Collects platform + username + roast style and displays results.

### Backend Responsibilities

- Verifies VIP code and issues short-lived JWT token.
- Stores token in secure cookie and validates token on protected routes.
- Applies rate limits to reduce brute-force and API abuse risk.
- Integrates with external profile APIs and AI generation service.

## Security Decisions

- HttpOnly cookie for token transport instead of exposing token to client JavaScript.
- Timing-safe VIP code comparison to reduce side-channel risk.
- CORS restricted to configured client origin with credentials support.
- Auth and API route throttling using express-rate-limit.

Current limiter configuration:

- Auth route: 5 failed attempts per 24 hours per IP (successful attempts are skipped).
- API routes: 20 requests per 15 minutes per IP.

## API Contract

Base URL: /api

- POST /verify-vip
    - Body: { "code": "your_vip_code" }
    - Success: sets vip_token cookie, returns success message.

- POST /logout
    - Clears vip_token cookie.

- POST /github?username=<name>&roastStyle=<friendly|savage|analyst>
    - Protected route.
    - Fetches GitHub profile + repos, returns roast output.

- POST /reddit?username=<name>&roastStyle=<friendly|savage|analyst>
    - Protected route.
    - Fetches Reddit user + comments metadata, returns roast output.

## Repository Structure

.
|- backend
|  |- Routes
|  |- Services
|  |- middlewares
|  |- package.json
|  `- server.js
|- cooked
|  |- src
|  |  |- api
|  |  `- App.jsx
|  |- package.json
|  `- vite.config.js
`- README.md

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Groq API key

### 1) Backend Setup

```bash
cd backend
npm install
```

Create backend/.env:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
VIP_CODE=your_vip_code
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm start
```

### 2) Frontend Setup

```bash
cd cooked
npm install
```

Create cooked/.env:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Open the app at http://localhost:5173.

## Deployment Notes

- Frontend and backend can be deployed independently.
- Ensure CLIENT_URL exactly matches deployed frontend origin.
- Ensure cookies are served securely in production (HTTPS).
- Keep JWT_SECRET and VIP_CODE in secure environment variables.

## Engineering Trade-offs

- Stateless auth keeps infra simple, but token revocation is limited.
- No database lowers cost and complexity, but there is no historical analytics.
- External API dependence may introduce occasional latency or upstream failures.

## What This Demonstrates For Recruiters

- Practical API security implementation in a real product flow.
- Integration of third-party APIs and an LLM service with graceful error handling.
- Clean separation of concerns across middleware, routes, and service layers.
- UI state management for authentication, loading, and error conditions.

## Future Improvements

- Add observability (structured logs + request tracing).
- Add tests (unit tests for services, integration tests for API routes).
- Add caching for repeated profile lookups.
- Add persistence for user roast history and usage analytics.

## Author

Ayush Shakya
