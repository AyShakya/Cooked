import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Github, Flame, Music, ArrowLeft, Send, Copy, Check, 
  Lock, Unlock, ArrowRight 
} from "lucide-react";
import { api } from "./api/axios"; 
import "./App.css";


const BRANDS = {
  github: {
    name: "GitHub",
    color: "#238636",
    bg: "#0d1117",
    icon: <Github size={48} />,
    tagline: "Commit crimes exposed.",
    placeholder: "github_username",
  },
  reddit: {
    name: "Reddit",
    color: "#FF4500",
    bg: "#1A1A1B", 
    icon: <Flame size={48} />,
    tagline: "Karma won't save you.",
    placeholder: "u/redditor",
  },
  spotify: {
    name: "Spotify",
    color: "#1DB954",
    bg: "#191414",
    icon: <Music size={48} />,
    tagline: "Bad taste detected.",
    disabled: true,
  },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vipCodeInput, setVipCodeInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [provider, setProvider] = useState(null); 
  const [username, setUsername] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_logged_in");
    if (isLoggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const activeTheme = provider ? BRANDS[provider] : null;
  
  const handleUnlock = async () => {
    if (!vipCodeInput.trim()) return;
    
    setAuthLoading(true);
    setAuthError("");

    try {
      await api.post("/verify-vip", { code: vipCodeInput });
      setIsAuthenticated(true);
      localStorage.setItem("is_logged_in", "true");
      setVipCodeInput("");
    } catch (err) {
      setAuthError("⛔ ACCESS DENIED: Invalid VIP Code.");
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("is_logged_in");
      setIsAuthenticated(false);
      setProvider(null);
      setRoast("");
      setUsername("");
    }
  };

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
        params: { username },
      });
      setRoast(res.data.roast);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setIsAuthenticated(false);
        localStorage.removeItem("is_logged_in");
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
        <motion.div 
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
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              disabled={authLoading}
            />
            <button 
              className="auth-btn" 
              onClick={handleUnlock}
              disabled={authLoading}
            >
              {authLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ⏳
                </motion.div>
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </div>
          
          {authError && <p className="auth-error">{authError}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        backgroundColor: activeTheme ? activeTheme.bg : "#111",
        "--brand-color": activeTheme ? activeTheme.color : "#fff",
      }}
    >
      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        <Unlock size={14} /> Exit VIP
      </button>

      <div className="noise-overlay"></div>

      <div className="content-wrapper">
        <header className="main-header">
          <motion.h1
            layoutId="title"
            className="logo-text"
            style={{ color: activeTheme ? activeTheme.color : "#fff" }}
          >
            {activeTheme ? `${activeTheme.name} Roast` : "Cooked."}
          </motion.h1>
          <motion.p 
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
             {activeTheme ? activeTheme.tagline : "Choose your victim's platform."}
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {!provider ? (
            // --- SELECTION SCREEN ---
            <motion.div
              key="selection"
              className="grid-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {Object.entries(BRANDS).map(([key, brand]) => (
                <motion.button
                  key={key}
                  className={`brand-card ${brand.disabled ? "disabled" : ""}`}
                  onClick={() => !brand.disabled && setProvider(key)}
                  whileHover={!brand.disabled ? { scale: 1.05, y: -5 } : {}}
                  whileTap={!brand.disabled ? { scale: 0.95 } : {}}
                  disabled={brand.disabled}
                >
                  <div className="icon-wrapper" style={{ color: brand.color }}>
                    {brand.icon}
                  </div>
                  <span className="brand-name">{brand.name}</span>
                  {brand.disabled && <span className="tag-soon">Soon</span>}
                </motion.button>
              ))}
            </motion.div>
          ) : (
            // --- INPUT SCREEN ---
            <motion.div
              key="input"
              className="input-stage"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
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
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={loading}
                    style={{ backgroundColor: activeTheme.color }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        Fireee
                      </motion.div>
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </div>
                {error && <p className="error-msg">{error}</p>}
              </form>

              {/* ROAST RESULT CARD */}
              <AnimatePresence>
                {roast && (
                  <motion.div
                    className="roast-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <p className="roast-text">"{roast}"</p>
                    <div className="roast-actions">
                      <button className="icon-btn" onClick={copyRoast}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className="back-btn"
                onClick={resetFlow}
                whileHover={{ x: -5 }}
              >
                <ArrowLeft size={16} /> Change Platform
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}