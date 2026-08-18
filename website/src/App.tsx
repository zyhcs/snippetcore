import React, { useState } from 'react';
import { Download, Cloud, Layout, Zap, Image as ImageIcon, Terminal, Star, Globe, CheckCircle2, Copy, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { dict, type Lang } from './dict';

// Custom Github Icon
function Github(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.2 5.2 0 0 0-1.39-3.5 4.8 4.8 0 0 0-.1-3.4s-1.1-.35-3.5 1.2a11.9 11.9 0 0 0-6 0C6.6 2.5 5.5 2.85 5.5 2.85a4.8 4.8 0 0 0-.1 3.4A5.2 5.2 0 0 0 4 9.76c0 5.22 3 6.42 6 6.76-.36.3-.7.82-.8 1.6-1.1.5-3.2.4-4.2-1.2-1-.7-1.5-.6-1.5-.6.7-.1 1.2.3 1.4.6.8 1.4 2.4 1.2 3.2 1 .1-.8.4-1.4.8-1.8v4.2" />
    </svg>
  );
}

function App() {
  const [lang, setLang] = useState<Lang>('zh');
  const d = dict[lang];

  // Reveal Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6} }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen font-sans bg-background selection:bg-primary/30 scroll-smooth">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">SnippetCore</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-textMuted hover:text-white transition-colors">{d.nav.features}</a>
            <a href="#workflow" className="text-textMuted hover:text-white transition-colors">{d.nav.workflow}</a>
            <a href="#faq" className="text-textMuted hover:text-white transition-colors">{d.nav.faq}</a>
            <a href="https://github.com/zyhcs/snippetcore" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-textMuted hover:text-white transition-colors">
              <Github className="w-4 h-4" />
              {d.nav.github}
            </a>
            
            {/* Lang Switcher */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/80 border border-white/10 hover:bg-surface text-textMuted hover:text-white transition-all text-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center min-h-[90vh] justify-center">
        {/* Abstract Backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-sm mb-8 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>{d.hero.badge}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.15]"
          >
            {d.hero.title1}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary relative inline-block">
              {d.hero.highlight}
              <motion.span 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.8}}
                className="absolute bottom-2 left-0 h-3 bg-primary/20 -z-10 -rotate-1"
              ></motion.span>
            </span>
            {d.hero.title2}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-textMuted mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {d.hero.subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="https://github.com/zyhcs/snippetcore/releases/latest" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-1">
              <Download className="w-5 h-5" />
              {d.hero.download}
            </a>
            <a href="https://github.com/zyhcs/snippetcore" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface hover:bg-surface/80 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-1">
              <Github className="w-5 h-5" />
              {d.hero.source}
            </a>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-sm text-textMuted"
          >
            {d.hero.platforms}
          </motion.p>
        </div>

        {/* Floating Code Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5}}
          className="w-full max-w-5xl mx-auto mt-20 relative z-10"
        >
          <div className="rounded-2xl border border-white/10 bg-surface/50 p-2 shadow-2xl backdrop-blur-xl glow-effect group relative overflow-hidden">
            {/* Glossy reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-xl" />
            
            <div className="rounded-xl overflow-hidden bg-[#0F111A] aspect-[16/10] md:aspect-[16/9] flex flex-col relative border border-white/5 shadow-inner">
              {/* Mock Window Header */}
              <div className="h-10 bg-[#1A1E29] flex items-center px-4 gap-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="mx-auto text-xs text-textMuted font-medium flex items-center gap-2">
                  <span className="w-4 h-4 bg-primary/20 text-primary flex items-center justify-center rounded">S</span> SnippetCore
                </div>
              </div>
              
              {/* Mock Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="hidden md:flex w-56 border-r border-white/5 bg-[#141823] p-4 flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-white/90 bg-white/5 px-3 py-2 rounded-lg cursor-pointer">
                    <Layout className="w-4 h-4 text-primary" /> {lang === 'en' ? 'All Snippets' : '全部片段'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-textMuted hover:text-white px-3 py-1 cursor-pointer transition-colors">
                    <Star className="w-4 h-4 text-yellow-500" /> {lang === 'en' ? 'Favorites' : '我的收藏'}
                  </div>
                  
                  <div className="mt-4 text-xs font-semibold text-textMuted uppercase tracking-wider px-2">Tags</div>
                  <div className="flex flex-wrap gap-2 px-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">React</span>
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">Node</span>
                    <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">ABAP</span>
                  </div>
                </div>
                
                {/* Main */}
                <div className="flex-1 p-4 md:p-6 bg-[#0B0F19] flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-full max-w-xs h-9 bg-white/5 rounded-lg border border-white/10 flex items-center px-3 gap-2">
                      <div className="w-3 h-3 border-2 border-textMuted rounded-full"></div>
                      <span className="text-textMuted text-xs">{lang === 'en' ? 'Search snippets (Cmd+K)' : '搜索代码片段 (Cmd+K)'}</span>
                    </div>
                    <div className="hidden sm:flex w-24 h-9 bg-primary hover:bg-blue-600 cursor-pointer rounded-lg items-center justify-center text-xs font-bold text-white shadow-lg transition-colors">
                      + {lang === 'en' ? 'New' : '新建'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Card 1 */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col gap-3 shadow-md group cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-white">useAuth Hook</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-400 font-mono bg-blue-400/10 px-2 py-0.5 rounded">TypeScript</span>
                          <Copy className="w-3.5 h-3.5 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="h-24 bg-[#0B0F19] rounded-lg border border-white/5 p-3 font-mono text-[11px] md:text-xs text-textMuted overflow-hidden relative">
                        <span className="text-purple-400">export function</span> <span className="text-blue-300">useAuth</span>() {'{'}<br/>
                        &nbsp;&nbsp;<span className="text-purple-400">const</span> ctx = <span className="text-blue-300">useContext</span>(AuthContext);<br/>
                        &nbsp;&nbsp;<span className="text-purple-400">if</span> (!ctx) <span className="text-purple-400">throw new</span> <span className="text-yellow-200">Error</span>(<span className="text-green-300">'No Auth'</span>);<br/>
                        &nbsp;&nbsp;<span className="text-purple-400">return</span> ctx;<br/>
                        {'}'}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0B0F19] to-transparent"></div>
                      </div>
                    </motion.div>
                    
                    {/* Card 2 */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col gap-3 shadow-md group cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> API Error Handler
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-yellow-400 font-mono bg-yellow-400/10 px-2 py-0.5 rounded">Python</span>
                          <Copy className="w-3.5 h-3.5 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="h-24 bg-[#0B0F19] rounded-lg border border-white/5 p-3 font-mono text-[11px] md:text-xs text-textMuted overflow-hidden relative">
                        <span className="text-purple-400">def</span> <span className="text-blue-300">handle_error</span>(err: Exception):<br/>
                        &nbsp;&nbsp;<span className="text-purple-400">if</span> <span className="text-blue-300">isinstance</span>(err, HTTPError):<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;logger.<span className="text-blue-300">error</span>(<span className="text-green-300">f"HTTP {"{err.code}"}"</span>)<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> {'{'} <span className="text-green-300">"status"</span>: err.code {'}'}<br/>
                        &nbsp;&nbsp;<span className="text-purple-400">return</span> {'{'} <span className="text-green-300">"status"</span>: <span className="text-orange-300">500</span> {'}'}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0B0F19] to-transparent"></div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 bg-surface/30 border-t border-white/5 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{d.workflow.title}</h2>
            <p className="text-textMuted max-w-2xl mx-auto">{d.workflow.subtitle}</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-secondary/10 -z-10" />
            
            {d.workflow.steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.2 } } }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-24 h-24 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary relative z-10">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background relative border-t border-white/5">
        {/* Glow decoration */}
        <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{d.features.title}</h2>
            <p className="text-textMuted max-w-2xl mx-auto">{d.features.subtitle}</p>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard icon={<Zap className="w-6 h-6 text-yellow-400" />} title={d.features.items[0].title} desc={d.features.items[0].desc} />
            <FeatureCard icon={<Cloud className="w-6 h-6 text-blue-400" />} title={d.features.items[1].title} desc={d.features.items[1].desc} />
            <FeatureCard icon={<Code2 className="w-6 h-6 text-green-400" />} title={d.features.items[2].title} desc={d.features.items[2].desc} />
            <FeatureCard icon={<Terminal className="w-6 h-6 text-purple-400" />} title={d.features.items[3].title} desc={d.features.items[3].desc} />
            <FeatureCard icon={<ImageIcon className="w-6 h-6 text-pink-400" />} title={d.features.items[4].title} desc={d.features.items[4].desc} />
            <FeatureCard icon={<Layout className="w-6 h-6 text-teal-400" />} title={d.features.items[5].title} desc={d.features.items[5].desc} />
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-surface/30 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{d.faq.title}</h2>
          </motion.div>
          
          <div className="space-y-6">
            {d.faq.items.map((item, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-background border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
              >
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" /> {item.q}
                </h3>
                <p className="text-textMuted pl-7 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <footer className="relative bg-background border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-6">S</div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Ready to boost your productivity?</h2>
          <a href="https://github.com/zyhcs/snippetcore/releases/latest" className="px-8 py-4 rounded-xl bg-white text-background hover:bg-gray-200 font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-xl mb-16">
            <Download className="w-5 h-5" /> {d.hero.download}
          </a>
          
          <div className="w-full h-px bg-white/10 mb-8"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center w-full text-sm text-textMuted gap-4">
            <p className="flex items-center gap-1"><Code2 className="w-4 h-4"/> {d.footer.built}</p>
            <div className="flex items-center gap-6">
              <span>{d.footer.license}</span>
              <span>{d.footer.rights}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div variants={itemVariant} className="p-8 rounded-2xl bg-surface/50 border border-white/5 hover:border-primary/40 hover:bg-surface transition-all duration-300 group shadow-lg">
      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-textMuted leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

export default App;
