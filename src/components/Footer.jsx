export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto bg-[#0b1220] border-t border-white/10 relative z-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-4">
          <div 
            style={{
              backgroundColor: 'rgb(11, 18, 32)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              position: 'relative',
              zIndex: 21
            }}
            className="w-auto rounded-xl px-3 py-2 ring-1 ring-white/15 shadow-[0_0_30px_rgba(82,246,197,0.1)] overflow-hidden"
          >
            <div className="flex justify-center items-center gap-4">
              <a href="https://github.com/polyrhythML" target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="GitHub">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="#000000" className="group-hover:fill-emerald-600 transition">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/amit-singh-bhatti-278b0a83/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077B5" className="group-hover:fill-emerald-600 transition">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://x.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="X (Twitter)">
                <svg width="18" height="18" viewBox="0 0 300 271" fill="#000000" className="group-hover:fill-emerald-600 transition">
                  <path d="M236 0h46L181 115l118 156h-92.6l-72.5-94.8L59 271H13l107-123L0 0h94.9l65.5 86.6L236 0zm-16.1 243h25.5L80.4 26H53.2l166.7 217z"/>
                </svg>
              </a>
              <a href="https://bayesiansapien.substack.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="Substack">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="#FF6719" className="group-hover:fill-emerald-600 transition">
                  <path d="M15 3.604H1v1.891h14v-1.89ZM1 7.208V16l7-3.926L15 16V7.208zM15 0H1v1.89h14z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500">
          © 2023-{currentYear} Amit Singh Bhatti
        </div>
      </div>
    </footer>
  );
}