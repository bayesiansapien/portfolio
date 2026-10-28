import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import Ask from "./pages/Ask.jsx";

function IconLink({ href, title, children }) {
  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noreferrer"
      className="opacity-80 hover:opacity-100 transition-transform duration-150 hover:scale-110 hover:drop-shadow-md"
      aria-label={title}
    >
      {children}
    </a>
  );
}

function Nav() {
  return (
    <header className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" className="text-lg font-semibold">
        <span className="text-slate-200">Amit Singh</span>{" "}
        <span className="text-cyan-300">Bhatti</span>
      </a>

      <nav className="flex items-center gap-4 text-sm">
        {/* quick text links (optional) */}
        <a href="/resume.pdf" className="hover:underline hidden sm:inline">Resume</a>

        {/* Substack */}
        <IconLink href="https://bayesiansapien.substack.com/" title="Substack">
          <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <rect x="0" y="0" width="24" height="24" rx="3" fill="#FF6719"></rect>
            <rect x="4" y="6" width="16" height="2" fill="white"></rect>
            <rect x="4" y="10" width="16" height="2" fill="white"></rect>
            <rect x="8" y="14" width="8" height="6" fill="white"></rect>
          </svg>
        </IconLink>

        {/* Medium */}
        <IconLink href="https://medium.com/@amit02093" title="Medium">
          <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="black"></circle>
            <!-- simple white "M" glyph -->
            <path d="M6.8 7.5h1.9l2.2 6.1h.1l2.2-6.1h1.9l.7 8.9h-1.8l-.4-5.8h-.1l-2.1 5.8h-1.1l-2.1-5.8h-.1l-.4 5.8H6.1l.7-8.9Z" fill="white"></path>
          </svg>
        </IconLink>

        {/* X / Twitter */}
        <IconLink href="https://x.com/bayesiansapien" title="X (Twitter)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
            <path d="M18.244 2H21l-6.54 7.48L22 22h-6.9l-4.51-6.2L5.3 22H2.54l7.08-8.1L2 2h6.9l4.2 5.74L18.24 2Zm-2.41 18h1.86L8.25 4H6.43l9.4 16Z"/>
          </svg>
        </IconLink>

        {/* LinkedIn */}
        <IconLink href="https://www.linkedin.com/in/amit-singh-bhatti-278b0a83/" title="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
            <path d="M6.94 8.5H4V20h2.94V8.5ZM5.47 7.26A1.73 1.73 0 1 0 5.46 3.8a1.73 1.73 0 0 0 .01 3.46ZM20 20h-2.93v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.62-2.39 3.28V20H9.69V8.5h2.81v1.57h.04a3.08 3.08 0 0 1 2.77-1.52c2.96 0 3.5 1.95 3.5 4.49V20Z"/>
          </svg>
        </IconLink>

        {/* GitHub */}
        <IconLink href="https://github.com/polyrhythML" title="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
            <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.57v-2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.22.09 1.87 1.26 1.87 1.26 1.08 1.85 2.84 1.32 3.53 1.01.11-.8.42-1.33.77-1.64-2.66-.3-5.46-1.33-5.46-5.9 0-1.3.46-2.36 1.23-3.19-.12-.3-.53-1.52.11-3.17 0 0 1-.32 3.3 1.22a11.5 11.5 0 0 1 6 0c2.3-1.54 3.29-1.22 3.29-1.22.65 1.65.24 2.87.12 3.17.77.83 1.23 1.89 1.23 3.19 0 4.59-2.8 5.6-5.47 5.9.43.38.82 1.12.82 2.27v3.36c0 .31.22.67.83.56A12 12 0 0 0 12 .5Z"/>
          </svg>
        </IconLink>

        {/* CTA */}
        <Link to="/ask" className="ml-1 px-3 py-1 rounded bg-white/10 hover:bg-white/20">Ask me</Link>
      </nav>
    </header>
  );
}

function App() {
  return (
    <div className="min-h-screen text-slate-100" style={{background:"#0b1220"}}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ask" element={<Ask />} />
      </Routes>
      <footer className="max-w-5xl mx-auto px-4 py-10 text-xs text-slate-400">
        © {new Date().getFullYear()} Amit Singh Bhatti · bayesiansapien.com
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
