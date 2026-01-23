import RecentBlogPosts from '../components/RecentBlogPosts';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <main className="max-w-none mx-auto px-4 py-16">
        <section className="grid justify-center pt-3 pb-12">
          <div className="flex justify-center items-center gap-6 max-w-7xl mx-auto">
            
            <div
              id="hero-bubble"
              className="relative w-full mx-auto text-center rounded-3xl p-6 md:p-8 ring-1 ring-white/20 backdrop-blur-xl shadow-[0_0_70px_rgba(82,246,197,0.22)] after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:shadow-[0_0_140px_rgba(82,246,197,0.26)] overflow-hidden backdrop-blur-2xl backdrop-saturate-150 z-10 max-w-[820px] md:max-w-[980px] lg:max-w-[1120px] poppins bg-black/10"
            >
              <img
                src="/avatar.png"
                className="mx-auto mb-6 w-36 h-36 md:w-36 md:h-36 rounded-full object-cover ring-1 ring-white/15 shadow-lg"
                alt="Avatar"
              />

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Hello, I'm <span className="text-emerald-300">Amit Singh Bhatti</span>
              </h1>

              <p className="mx-auto max-w-[1200px] lg:max-w-[1240px] text-[16px] md:text-[17px] lg:text-[14px] md:text-[15px] lg:text-[16px] tracking-[0.005em] leading-7 md:leading-7 lg:leading-7">
                A Minimalist Bayesian Sapien contributing to the universe's entropy, being an AI researcher building efficient, sustainable intelligence optimizing models via pruning, distillation, quantization, and routing to deliver lighter and faster systems. I also apply Quantum ML to combinatorial optimization, turning vast search spaces into practical results. My work spans RL, test time compute, Agentic Intelligence Optimization, and reasoning systems.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href="https://bayesiansapien.substack.com/subscribe"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  aria-label="Subscribe by Email on Substack"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="0" y="0" width="24" height="24" rx="3" fill="#FF6719"></rect>
                    <rect x="4" y="6" width="16" height="2" fill="white"></rect>
                    <rect x="4" y="10" width="16" height="2" fill="white"></rect>
                    <rect x="8" y="14" width="8" height="6" fill="white"></rect>
                  </svg>
                  <span>Subscribe by Email</span>
                </a>
                
                <a
                  href="https://bayesiansapien.substack.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition"
                  aria-label="RSS Feed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 11a9 9 0 0 1 9 9"></path>
                    <path d="M4 4a16 16 0 0 1 16 16"></path>
                    <circle cx="5" cy="19" r="1"></circle>
                  </svg>
                  <span>RSS Feed</span>
                </a>
              </div>
            </div>

            <div className="hidden lg:block sticky top-24">
              <div className="relative rounded-2xl p-3 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_0_30px_rgba(82,246,197,0.1)] overflow-hidden backdrop-blur-2xl backdrop-saturate-150 bg-black/5">
                <div className="flex flex-col items-center gap-4">
                  
                  <a href="/resume.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="CV">
                    <span className="text-xs font-medium text-gray-700 group-hover:text-emerald-600 transition">CV</span>
                  </a>

                  <a href="https://github.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="GitHub">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="#000000" className="group-hover:fill-emerald-600 transition">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                    </svg>
                  </a>

                  <a href="https://www.linkedin.com/in/amit-singh-bhatti-278b0a83/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5" className="group-hover:fill-emerald-600 transition">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  <a href="https://x.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="X (Twitter)">
                    <svg width="20" height="20" viewBox="0 0 300 271" fill="#000000" className="group-hover:fill-emerald-600 transition">
                      <path d="M236 0h46L181 115l118 156h-92.6l-72.5-94.8L59 271H13l107-123L0 0h94.9l65.5 86.6L236 0zm-16.1 243h25.5L80.4 26H53.2l166.7 217z"/>
                    </svg>
                  </a>

                  <a href="https://medium.com/@amit02093" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="Medium">
                    <svg width="20" height="20" viewBox="0 0 1770 1000" fill="#000000" className="group-hover:fill-emerald-600 transition">
                      <circle cx="500" cy="500" r="500"/>
                      <ellipse ry="475" rx="250" cy="501" cx="1296"/>
                      <ellipse cx="1682" cy="502" rx="88" ry="424"/>
                    </svg>
                  </a>

                  <a href="https://bayesiansapien.substack.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="Substack">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="#FF6719" className="group-hover:fill-emerald-600 transition">
                      <path d="M15 3.604H1v1.891h14v-1.89ZM1 7.208V16l7-3.926L15 16V7.208zM15 0H1v1.89h14z"/>
                    </svg>
                  </a>

                </div>
              </div>
            </div>

          </div>
        </section>

        <RecentBlogPosts />
      </main>

      <Footer />
    </>
  );
}
