'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { MemoryConstellation } from '@/components/MemoryConstellation';
import { Database, Lock, EyeOff, Code2, Link as LinkIcon, RefreshCcw } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const scrollReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }
  },
};

const PROBLEMS = [
  {
    title: 'Stateless by default',
    icon: LinkIcon,
    description: 'Every agent session starts from zero. Context, decisions, and learned behavior disappear when the process ends.',
    borderAccent: 'border-b-semantic-error/40'
  },
  {
    title: 'Memory is fragmented',
    icon: Database,
    description: 'Memory is locked to a single app, model, or device — impossible to share, export, or verify.',
    borderAccent: 'border-b-semantic-warning/40'
  },
  {
    title: 'No verifiable provenance',
    icon: EyeOff,
    description: "There is no cryptographic proof that an agent's memory is intact, untampered, or authentic.",
    borderAccent: 'border-b-semantic-error/40'
  }
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <div className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] w-full">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden">
        <div className="container-custom relative z-20">
          <div className="hero-grid grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[100svh]">
            
            {/* Left Content (5 cols) */}
            <motion.div 
              className="col-span-1 md:col-span-5 flex flex-col items-start justify-center pt-24 md:pt-0"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={item} className="type-eyebrow mb-6 text-[var(--color-accent)]">
                MULTI-AGENT MEMORY
              </motion.div>
              
              <motion.h1 variants={item} className="type-hero mb-6 text-left">
                Agents that<br />
                <span style={{ color: 'var(--color-accent)' }}>remember</span>
                <span style={{ color: 'var(--color-text-primary)' }}>.</span>
              </motion.h1>
              
              <motion.p variants={item} className="type-body-lg mb-10 max-w-md">
                Persistent. Verifiable. Decentralized.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/explorer" className="btn-primary justify-center">
                  Explore Memory
                </Link>
                <Link href="/restore" className="btn-ghost justify-center">
                  View Demo ↗
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content (7 cols) - 3D Constellation */}
            <div className="col-span-1 md:col-span-7 absolute md:relative inset-0 md:inset-auto h-[400px] md:h-[600px] right-0 translate-x-[10%] md:translate-x-0 opacity-40 md:opacity-100 -z-10 md:z-10 pointer-events-none">
              <MemoryConstellation />
            </div>

          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
          <div className="w-[1px] h-10 bg-[var(--color-text-muted)]/30 relative overflow-hidden">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] absolute left-1/2 -translate-x-1/2 top-0"
              animate={{ y: [0, 40] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>
        </motion.div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="bg-[var(--color-bg-surface)] py-24 md:py-32 border-t border-[var(--color-border-default)]">
        <div className="container-custom">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {PROBLEMS.map((prob, idx) => (
              <motion.div key={idx} variants={item} className={`card card-accent border-b-2 ${prob.borderAccent}`}>
                <prob.icon className="h-8 w-8 text-[var(--color-text-muted)] mb-6" strokeWidth={1.5} />
                <h3 className="type-h4 mb-3">{prob.title}</h3>
                <p className="type-body-sm">{prob.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ARCHITECTURE SECTION */}
      <section className="bg-[var(--color-bg-base)] py-24 md:py-32">
        <div className="container-custom">
          <motion.div 
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16"
          >
            <div className="type-eyebrow mb-4">ARCHITECTURE</div>
            <h2 className="type-h2 mb-4">Memory that outlasts the agent</h2>
            <p className="type-body max-w-2xl">
              By separating the compute layer from the storage layer, NexusMind ensures that an agent's context survives process termination. State is continuously synced to decentralized storage.
            </p>
          </motion.div>

          <motion.div 
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-8 overflow-hidden relative"
          >
            <div className="flex flex-col gap-2 max-w-4xl mx-auto">
              <div className="h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center type-label hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent)] transition-colors cursor-default">Dashboard / Wallet Interface</div>
              <div className="h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center type-label hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent)] transition-colors cursor-default">Agent Layer (Orchestrator / Researcher / Trader / Monitor)</div>
              <div className="h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center type-label hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent)] transition-colors cursor-default">NexusMind SDK (@nexusmind/sdk)</div>
              <div className="h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center type-label hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent)] transition-colors cursor-default">MemWal | Walrus Blobs | Seal | Sui Stack Msg</div>
              <div className="h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center type-label hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent)] transition-colors cursor-default">Sui Blockchain (Provenance + Access Control)</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE DEEP DIVES */}
      <section className="bg-[var(--color-bg-base)] py-12 md:py-24">
        <div className="container-custom flex flex-col gap-24 md:gap-32">
          
          {/* Feature 1 */}
          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center border-b border-[var(--color-border-default)] pb-24 md:pb-32">
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <div className="type-eyebrow mb-4">PERSISTENT MEMORY</div>
              <h2 className="type-h2 mb-4">Memory that persists across every session</h2>
              <p className="type-body mb-6">
                Store context intelligently using the SDK. Every thought, action, and observation is persisted to Walrus and indexed by MemWal, available even if the agent is completely restarted.
              </p>
              <div className="code-block text-[13px]">
                <div className="type-code"><span className="text-[#82AAFF]">remember</span>() → <span className="text-[#82AAFF]">recall</span>() → <span className="text-[#82AAFF]">restore</span>()</div>
              </div>
            </motion.div>
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="bg-[var(--color-bg-surface)] h-64 md:h-80 rounded-xl border border-[var(--color-border-default)] flex items-center justify-center overflow-hidden">
              <RefreshCcw className="w-16 h-16 text-[var(--color-accent)] opacity-50" strokeWidth={1} />
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center md:flex-row-reverse border-b border-[var(--color-border-default)] pb-24 md:pb-32" style={{ direction: 'rtl' }}>
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} style={{ direction: 'ltr' }}>
              <div className="type-eyebrow mb-4">ENCRYPTED SHARING</div>
              <h2 className="type-h2 mb-4">Agents share secrets without exposing them</h2>
              <p className="type-body mb-6">
                Threshold encryption via Seal allows agents to securely share contextual memories with authorized peers. Only agents explicitly added to the allowlist can decrypt the Walrus blobs.
              </p>
              <div className="flex items-center gap-2 type-label text-[var(--color-text-secondary)]">
                <Lock className="w-4 h-4 text-[var(--color-success)]" /> Access governed by onchain policies
              </div>
            </motion.div>
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} style={{ direction: 'ltr' }} className="bg-[var(--color-bg-surface)] h-64 md:h-80 rounded-xl border border-[var(--color-border-default)] flex items-center justify-center">
              <Lock className="w-16 h-16 text-[var(--color-accent)] opacity-50" strokeWidth={1} />
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center border-b border-[var(--color-border-default)] pb-24 md:pb-32">
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <div className="type-eyebrow mb-4">VERIFIABLE ARTIFACT TRAIL</div>
              <h2 className="type-h2 mb-4">Every artifact, recorded onchain</h2>
              <p className="type-body mb-6">
                Agent actions produce artifacts that are instantly hashed and recorded on the Sui blockchain. This provides cryptographic, undeniable proof of what the agent did and when it did it.
              </p>
              <div className="type-code text-[var(--color-code-text)]">
                blob_id: jneof1nyh_beppoda-9936
              </div>
            </motion.div>
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="bg-[var(--color-bg-surface)] h-64 md:h-80 rounded-xl border border-[var(--color-border-default)] flex items-center justify-center">
              <Database className="w-16 h-16 text-[var(--color-accent)] opacity-50" strokeWidth={1} />
            </motion.div>
          </div>

          {/* Feature 4 */}
          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center" style={{ direction: 'rtl' }}>
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} style={{ direction: 'ltr' }}>
              <div className="type-eyebrow mb-4">DEVELOPER SDK</div>
              <h2 className="type-h2 mb-4">One SDK. The entire stack.</h2>
              <p className="type-body mb-6">
                The NexusMind SDK abstracts away the complexities of Sui, Walrus, MemWal, and Seal. It provides a simple, unified interface for memory operations.
              </p>
              <div className="code-block inline-block w-full">
                <span className="text-[#8A8CA8]">$</span> <span className="text-[#F0F0F8]">npm install @nexusmind/sdk</span>
              </div>
            </motion.div>
            <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} style={{ direction: 'ltr' }} className="code-block h-64 md:h-80 overflow-y-auto">
              <pre className="type-code text-[#F0F0F8]">
                <span className="token-keyword">import</span> {'{'} AgentMemory {'}'} <span className="token-keyword">from</span> <span className="token-string">'@nexusmind/sdk'</span>;{'\n\n'}
                <span className="token-keyword">const</span> memory = <span className="token-keyword">new</span> <span className="token-function">AgentMemory</span>({'{'}{'\n'}
                {'  '}agentId: <span className="token-string">'0x123...'</span>,{'\n'}
                {'  '}network: <span className="token-string">'testnet'</span>{'\n'}
                {'}'});{'\n\n'}
                <span className="token-comment">// Retrieve relevant past thoughts</span>{'\n'}
                <span className="token-keyword">const</span> context = <span className="token-keyword">await</span> memory.<span className="token-function">recall</span>(<span className="token-string">"price analysis"</span>);{'\n\n'}
                <span className="token-comment">// Execute logic...</span>{'\n\n'}
                <span className="token-comment">// Store the result</span>{'\n'}
                <span className="token-keyword">await</span> memory.<span className="token-function">remember</span>({'{'}{'\n'}
                {'  '}content: <span className="token-string">"Analyzed SUI price trend..."</span>,{'\n'}
                {'  '}type: <span className="token-string">'observation'</span>{'\n'}
                {'}'});
              </pre>
            </motion.div>
          </div>

        </div>
      </section>

      {/* TECH PROOF SECTION */}
      <section className="bg-[var(--color-bg-surface)] py-24 md:py-32 border-y border-[var(--color-border-default)]">
        <div className="container-custom text-center">
          <h2 className="type-h2 mb-12">Built on</h2>
          
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 mb-16 opacity-80">
            <div className="type-h3">Walrus</div>
            <div className="type-h3">MemWal</div>
            <div className="type-h3">Seal</div>
            <div className="type-h3">Sui</div>
          </div>
          
          <div className="w-full h-[1px] bg-[var(--color-border-default)] mb-16"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 text-left max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">Onchain provenance for every artifact</span></div>
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">Threshold encryption via Seal</span></div>
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">~400ms finality on Sui testnet*</span></div>
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">50MB per artifact on Walrus*</span></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">Semantic memory search via MemWal</span></div>
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">Cross-session memory rebuild</span></div>
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">Agent-to-agent encrypted messaging</span></div>
              <div className="flex items-center gap-3"><span className="text-[var(--color-success)]">✓</span> <span className="type-body">Dashboard deployed as Walrus Site</span></div>
            </div>
          </div>
          
          <p className="type-label mt-12 text-[var(--color-text-muted)]">*Source: official Sui and Walrus documentation</p>
        </div>
      </section>

      {/* RESTORE DEMO PREVIEW */}
      <section className="bg-[var(--color-bg-inset)] py-24 md:py-32">
        <div className="container-custom text-center">
          <div className="type-eyebrow mb-4">THE KILLER FEATURE</div>
          <h2 className="type-h2 mb-4">Wipe the agent. The memory survives.</h2>
          <p className="type-body max-w-2xl mx-auto mb-16">
            If an agent is destroyed, its local memory is gone. Our restore function rebuilds the entire memory index directly from Walrus blobs, proving true decentralized persistence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto mb-12 relative">
            <div className="card text-left h-64 flex flex-col items-center justify-center border-dashed border-2">
              <div className="type-h4 mb-2 text-[var(--color-text-muted)]">Memory index: 0 items</div>
              <div className="type-label">Before</div>
            </div>
            
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-12 h-12 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-full z-10">
              <span className="text-[var(--color-text-muted)]">→</span>
            </div>
            
            <div className="card text-left h-64 flex flex-col justify-center border-[var(--color-accent-border)] bg-[var(--color-accent-dim)]">
              <div className="space-y-3 w-full px-8">
                <div className="h-4 w-full bg-[var(--color-bg-elevated)] rounded"></div>
                <div className="h-4 w-5/6 bg-[var(--color-bg-elevated)] rounded"></div>
                <div className="h-4 w-4/6 bg-[var(--color-bg-elevated)] rounded"></div>
              </div>
              <div className="mt-8 text-center">
                <div className="type-h4 mb-1 text-[var(--color-success)]">Memory index: 1,421 items</div>
                <div className="type-label">After restore()</div>
              </div>
            </div>
          </div>
          
          <Link href="/restore" className="btn-primary">
            See Live Demo →
          </Link>
        </div>
      </section>
    </div>
  );
}
