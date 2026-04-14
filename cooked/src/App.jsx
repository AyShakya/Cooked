import { useState, useEffect, useCallback } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  Github,
  Flame,
  Music,
  ArrowLeft,
  Send,
  Copy,
  Check,
  Lock,
  Unlock,
  ArrowRight,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { api } from "./api/axios";
const _MOTION = m;
import "./App.css";

const BRANDS = {
  github: {
    name: "GitHub",
    color: "#238636",
    bg: "#0d1117",
    icon: <Github size={44} />,
    tagline: "Commit crimes exposed.",
    placeholder: "github_username",
  },
  reddit: {
    name: "Reddit",
    color: "#FF4500",
    bg: "#1A1A1B",
    icon: <Flame size={44} />,
    tagline: "Karma won't save you.",
    placeholder: "u/redditor",
  },
  spotify: {
    name: "Spotify",
    color: "#1DB954",
    bg: "#191414",
    icon: <Music size={44} />,
    tagline: "Bad taste detected.",
    disabled: true,
  },
};

const ROAST_STYLES = [
  {
    id: "friendly",
    label: "Friendly Burn",
    description: "Clever and playful, safe for sharing.",
    icon: <Sparkles size={18} />,
  },
  {
    id: "savage",
    label: "Savage",
    description: "Sharper jokes and extra spice.",
    icon: <Zap size={18} />,
  },
  {
    id: "analyst",
    label: "Tech Analyst",
    description: "Roasts like a product teardown report.",
    icon: <WandSparkles size={18} />,
  },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vipCodeInput, setVipCodeInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [provider, setProvider] = useState(null);
  const [username, setUsername] = useState("");
  const [roastStyle, setRoastStyle] = useState(ROAST_STYLES[0].id);
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_logged_in");
    const lastActivity = parseInt(localStorage.getItem("last_activity") || "0");
    const now = Date.now();
    const INACTIVITY_LIMIT = 15 * 60 * 1000;

    if (isLoggedIn && (now - lastActivity < INACTIVITY_LIMIT)) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("is_logged_in");
      localStorage.removeItem("last_activity");
      setIsAuthenticated(false);
    }
  }, []);

  const activeTheme = provider ? BRANDS[provider] : null;

  const handleUnlock = async () => {
    if (!vipCodeInput.trim()) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      await api.post("/verify-vip", { code: vipCodeInput });
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("last_activity", Date.now().toString());
      setIsAuthenticated(true);
      setVipCodeInput("");
    } catch {
      setAuthError("⛔ ACCESS DENIED: Invalid VIP Code.");
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    // 1. Optimistic UI update: Immediate transition
    setIsAuthenticated(false);
    setProvider(null);
    setRoast("");
    setUsername("");
    
    // 2. Local Storage Cleanup
    localStorage.removeItem("is_logged_in");
    localStorage.removeItem("last_activity");

    // 3. Fire and forget logout request to server
    api.post("/logout").catch((err) => {
      console.warn("Server logout failed, but local session cleared.", err);
    });
  }, []);

  // Auto-Logout Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const lastActivity = parseInt(localStorage.getItem("last_activity") || "0");
      const now = Date.now();
      
      if (now - lastActivity > INACTIVITY_LIMIT) {
        handleLogout();
        return;
      }

      timeoutId = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_LIMIT);
    };

    const handleActivity = () => {
      localStorage.setItem("last_activity", Date.now().toString());
      resetTimer();
    };

    resetTimer();

    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [isAuthenticated, handleLogout]);

  const handleRoast = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("We need a target, captain.");
      return;
    }

    setLoading(true);
    setError("");
    setRoast("");
    setCopied(false);

    try {
      const res = await api.post(`/${provider}`, null, {
        params: { username, roastStyle },
      });
      setRoast(res.data.roast);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setIsAuthenticated(false);
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("last_activity");
        setAuthError("Session expired. Please re-enter VIP Code.");
      } else if (err.response && err.response.status === 429) {
        setError("You're roasting too fast! Cool down.");
      } else {
        setError("Subject un-roastable (or API error).");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setProvider(null);
    setUsername("");
    setRoast("");
    setError("");
    setCopied(false);
  };

  const copyRoast = () => {
    if (roast) {
      navigator.clipboard.writeText(roast);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ background: "#050505" }}>
        <m.div
          className="auth-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="lock-icon">
            <Lock size={40} color="#ff3333" />
          </div>
          <h1 className="auth-title">Restricted Access</h1>
          <p className="auth-subtitle">Enter VIP Clearance Code</p>

          <div className="auth-input-wrapper">
            <input
              type="password"
              className="auth-input"
              placeholder="PASSCODE"
              value={vipCodeInput}
              onChange={(e) => setVipCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              disabled={authLoading}
            />
            <button className="auth-btn" onClick={handleUnlock} disabled={authLoading}>
              {authLoading ? (
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ⏳
                </m.div>
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </div>

          {authError && <p className="auth-error">{authError}</p>}
        </m.div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        backgroundColor: activeTheme ? activeTheme.bg : "#0d0f16",
        "--brand-color": activeTheme ? activeTheme.color : "#8f9bb3",
      }}
    >
      <button className="logout-btn" onClick={handleLogout}>
        <Unlock size={14} /> Exit VIP
      </button>

      <div className="noise-overlay" />

      <div className="content-wrapper site-shell">
        <header className="hero-header">
          <span className="eyebrow">AI Roast Studio</span>
          <m.h1
            layoutId="title"
            className="logo-text"
            style={{ color: activeTheme ? activeTheme.color : "#fff" }}
          >
            {activeTheme ? `${activeTheme.name} Roast` : "Cooked."}
          </m.h1>
          <m.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeTheme
              ? activeTheme.tagline
              : "Pick a platform, choose a roast personality, and generate a custom burn in seconds."}
          </m.p>
        </header>

        <div className="feature-strip">
          <span>⚡ instant punchlines</span>
          <span>🧠 style-aware prompts</span>
          <span>📋 one-click copy</span>
        </div>

        <AnimatePresence mode="wait">
          {!provider ? (
            <m.div
              key="selection"
              className="grid-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {Object.entries(BRANDS).map(([key, brand]) => (
                <m.button
                  key={key}
                  className={`brand-card ${brand.disabled ? "disabled" : ""}`}
                  onClick={() => !brand.disabled && setProvider(key)}
                  whileHover={!brand.disabled ? { scale: 1.03, y: -4 } : {}}
                  whileTap={!brand.disabled ? { scale: 0.98 } : {}}
                  disabled={brand.disabled}
                >
                  <div className="icon-wrapper" style={{ color: brand.color }}>
                    {brand.icon}
                  </div>
                  <span className="brand-name">{brand.name}</span>
                  {brand.disabled && <span className="tag-soon">Soon</span>}
                </m.button>
              ))}
            </m.div>
          ) : (
            <m.div
              key="input"
              className="input-stage"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <section className="style-panel">
                <h3>Roast personality</h3>
                <div className="style-grid">
                  {ROAST_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      className={`style-option ${roastStyle === style.id ? "active" : ""}`}
                      onClick={() => setRoastStyle(style.id)}
                    >
                      <span className="style-label">{style.icon} {style.label}</span>
                      <small>{style.description}</small>
                    </button>
                  ))}
                </div>
              </section>

              <form onSubmit={handleRoast} className="roast-form">
                <div className="input-group">
                  <input
                    autoFocus
                    type="text"
                    className="grand-input"
                    placeholder={activeTheme.placeholder}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                  />
                  <m.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.92 }}
                    disabled={loading}
                    style={{ backgroundColor: activeTheme.color }}
                  >
                    {loading ? "..." : <Send size={20} />}
                  </m.button>
                </div>
                {error && <p className="error-msg">{error}</p>}
              </form>

              <AnimatePresence>
                {roast && (
                  <m.div
                    className="roast-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <p className="roast-meta">Style: {ROAST_STYLES.find((x) => x.id === roastStyle)?.label}</p>
                    <p className="roast-text">"{roast}"</p>
                    <div className="roast-actions">
                      <button className="icon-btn" onClick={copyRoast}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              <m.button className="back-btn" onClick={resetFlow} whileHover={{ x: -5 }}>
                <ArrowLeft size={16} /> Change Platform
              </m.button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
