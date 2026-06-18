'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  Database,
  Shield,
  Network,
  ArrowRight,
  Zap,
  Lock,
  Workflow as WorkflowIcon,
  Code2,
  MemoryStick,
  AlertTriangle,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Footer } from '@/components/Footer';

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── CountUp Component ─── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Floating Memory Cards ─── */
const FLOAT_CARDS = [
  { label: 'DeFi TVL +34%', delay: 0, x: -60, y: -20 },
  { label: 'Blob: 0x7a8f...', delay: 0.3, x: 40, y: 30 },
  { label: 'SUI/USDT LONG', delay: 0.6, x: -30, y: 60 },
];

/* ─── SDK Code Snippet ─── */
const SDK_CODE = `import { NexusMindAgent } from 'nexusmind-sdk';

// Create an agent with persistent memory
const researcher = new NexusMindAgent({
  role: 'researcher',
  namespace: 'nexusmind-researcher-v1',
  sealPolicy: 'allowlist',
});

// Remember findings — backed by Walrus
await researcher.remember(
  'DeFi TVL increased 34% in Q3. Top protocols: Aave, Compound, Uniswap.'
);

// Recall with semantic search
const context = await researcher.recall(
  'What were the DeFi trends?',
  { limit: 5 }
);

// Store encrypted artifact
const artifact = await researcher.storeArtifact({
  data: reportPdf,
  type: 'report',
  encrypt: true,  // Seal threshold encryption
  allowedAgents: ['trader', 'orchestrator'],
});

// Restore after memory loss — the killer feature
await researcher.restore();  // Rebuilds from Walrus`;

/* ─── Problem Cards ─── */
const PROBLEMS = [
  {
    icon: MemoryStick,
    title: 'Stateless Agents',
    description:
      'AI agents lose all context between sessions. Every conversation starts from zero, wasting time and compute rebuilding understanding.',
  },
  {
    icon: AlertTriangle,
    title: 'Fragmented Context',
    description:
      'Multi-agent systems lack shared memory. Agents cannot build on each other\'s work, leading to duplicated effort and inconsistent outputs.',
  },
  {
    icon: EyeOff,
    title: 'Unverifiable Actions',
    description:
      'Agent decisions are opaque. There\'s no audit trail, no provenance, and no way to verify what an agent did or why it made a choice.',
  },
];

/* ─── Features ─── */
const FEATURES = [
  {
    icon: Database,
    title: 'Persistent Memory',
    subtitle: 'Powered by MemWal + Walrus',
    description:
      'Agents store and recall semantic memories backed by Walrus decentralized storage. Memories survive crashes, restarts, and even complete data loss — just call restore().',
    code: `// Remember with full semantic context
await agent.remember(
  'Q3 DeFi analysis: TVL +34%, Aave leads at $12.4B'
);

// Recall naturally — semantic search, not SQL
const ctx = await agent.recall('DeFi trends');

// The killer feature: restore from Walrus
await agent.restore(); // Full memory rebuilt`,
  },
  {
    icon: Shield,
    title: 'Seal Encryption',
    subtitle: 'Threshold Access Control',
    description:
      'Private agent data is encrypted with Seal threshold encryption before storage on Walrus. Only authorized agents with the correct policy can decrypt — no single point of failure.',
    code: `// Envelope encryption with Seal
const sealed = await seal.encrypt(
  symmetricKey,
  policyId,   // Onchain access policy
  tx           // PTB with sender set
);

// Only allowed agents can decrypt
const key = await seal.decrypt(sealed, tx);
const data = await decryptAES(blob, key);`,
  },
  {
    icon: WorkflowIcon,
    title: 'Artifact Workflows',
    subtitle: 'Onchain Provenance',
    description:
      'Every research report, trading signal, and dataset is stored as a Walrus blob with an onchain provenance record. Agents coordinate through Sui-backed workflow state machines.',
    code: `// Create onchain workflow
const wf = await workflow.create({
  name: 'DeFi Research Pipeline',
  agents: [researcher, trader, orchestrator],
});

// Each task produces verifiable artifacts
await wf.executeTask({
  agent: researcher,
  action: 'analyze',
  output: { blobId, artifactId },
});`,
  },
  {
    icon: Code2,
    title: 'Developer SDK',
    subtitle: 'Build in Minutes',
    description:
      'The NexusMind SDK wraps MemWal, Walrus, Seal, and Sui into a single coherent API. Register agents, store memories, encrypt artifacts, and coordinate workflows with a few lines of TypeScript.',
    code: SDK_CODE,
  },
];

/* ─── Stats ─── */
const STATS = [
  { label: 'Memories Stored', value: 12847, suffix: '+' },
  { label: 'Artifacts Created', value: 3291, suffix: '' },
  { label: 'Workflows Executed', value: 856, suffix: '' },
  { label: 'Agents Active', value: 4, suffix: '' },
];

/* ─── Architecture Layers ─── */
const ARCH_LAYERS = [
  { name: 'AI Agents', desc: 'Researcher • Trader • Monitor • Orchestrator', color: 'from-purple-500 to-accent' },
  { name: 'NexusMind SDK', desc: 'Memory • Artifacts • Workflows • Messaging', color: 'from-accent to-blue-500' },
  { name: 'Seal', desc: 'Threshold encryption • Access policies • Envelope pattern', color: 'from-blue-500 to-cyan-500' },
  { name: 'MemWal', desc: 'Remember • Recall • Restore • Semantic search', color: 'from-cyan-500 to-emerald-500' },
  { name: 'Walrus', desc: 'Blob storage • Content-addressed • Erasure coded', color: 'from-emerald-500 to-green-500' },
  { name: 'Sui', desc: 'Smart contracts • Objects • PTBs • Events', color: 'from-blue-400 to-indigo-500' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {/* Constellation BG */}
        <div className="absolute inset-0 -z-10">
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            {Array.from({ length: 60 }, (_, i) => (
              <circle
                key={`star-${i}`}
                cx={`${(i * 17 + 23) % 100}%`}
                cy={`${(i * 13 + 7) % 100}%`}
                r={i % 3 === 0 ? 2 : 1}
                fill="var(--color-accent)"
                opacity={0.3 + (i % 5) * 0.12}
              >
                <animate
                  attributeName="opacity"
                  values={`${0.2 + (i % 4) * 0.1};${0.6 + (i % 3) * 0.1};${0.2 + (i % 4) * 0.1}`}
                  dur={`${3 + (i % 4)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
            {Array.from({ length: 20 }, (_, i) => (
              <line
                key={`line-${i}`}
                x1={`${(i * 23 + 10) % 100}%`}
                y1={`${(i * 17 + 5) % 100}%`}
                x2={`${((i + 3) * 23 + 10) % 100}%`}
                y2={`${((i + 2) * 17 + 5) % 100}%`}
                stroke="var(--color-accent)"
                strokeWidth="0.5"
                opacity="0.08"
              />
            ))}
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-transparent to-bg-base" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            {/* Status badge */}
            <motion.div variants={fadeUp as any} className="flex justify-center">
              <Badge variant="info" dot>
                <Zap className="h-3 w-3" /> System Online — All Agents Active
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp as any}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading tracking-tight"
            >
              <span className="font-light text-white/90">NEXUS</span>
              <span className="font-bold text-gradient">MIND</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              variants={fadeUp as any}
              className="mx-auto max-w-2xl text-lg sm:text-xl text-text-secondary leading-relaxed"
            >
              Where AI agents{' '}
              <span className="text-accent font-medium">remember</span>,
              reason, and persist across the decentralized web.
              Powered by Walrus, Sui, and Seal.
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp as any}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/explorer" id="hero-explore-btn">
                <Button variant="primary" size="lg">
                  Explore Memories <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/restore" id="hero-restore-btn">
                <Button variant="secondary" size="lg">
                  See Restore Demo
                </Button>
              </Link>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              variants={fadeUp as any}
              className="relative h-24 mt-8 hidden md:block"
            >
              {FLOAT_CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                    x: card.x,
                  }}
                  transition={{
                    delay: card.delay + 0.8,
                    duration: 0.5,
                    y: {
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className="absolute left-1/2 glass-panel rounded-lg px-4 py-2 text-xs font-mono text-code-text"
                  style={{ top: card.y }}
                >
                  {card.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ PROBLEM SECTION ═══════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp as any} className="text-sm font-medium text-accent uppercase tracking-widest mb-3">
              The Problem
            </motion.div>
            <motion.h2 variants={fadeUp as any} className="text-3xl sm:text-4xl font-heading font-bold text-white">
              AI Agents Are Fundamentally Broken
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {PROBLEMS.map((problem) => (
              <motion.div key={problem.title} variants={fadeUp as any}>
                <Card className="h-full">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <problem.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-3">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {problem.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ ARCHITECTURE ═══════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-surface/30">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp as any} className="text-sm font-medium text-accent uppercase tracking-widest mb-3">
              Architecture
            </motion.div>
            <motion.h2 variants={fadeUp as any} className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Full-Stack Decentralized Intelligence
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="space-y-3"
          >
            {ARCH_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.name}
                variants={{
                  hidden: { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.5, delay: i * 0.1 },
                  },
                }}
                className="relative glass-panel rounded-xl p-5 overflow-hidden group hover:border-border-accent transition-colors"
              >
                <div
                  className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b ${layer.color} opacity-60 group-hover:opacity-100 transition-opacity`}
                />
                <div className="flex items-center justify-between pl-4">
                  <div>
                    <h3 className="font-heading font-semibold text-white text-sm sm:text-base">
                      {layer.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      {layer.desc}
                    </p>
                  </div>
                  <div className="text-text-muted text-xs font-mono hidden sm:block">
                    Layer {ARCH_LAYERS.length - i}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp as any} className="text-sm font-medium text-accent uppercase tracking-widest mb-3">
              Features
            </motion.div>
            <motion.h2 variants={fadeUp as any} className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Everything Agents Need to Operate Autonomously
            </motion.h2>
          </motion.div>

          <div className="space-y-24">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={stagger}
                className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center`}
              >
                {/* Text */}
                <motion.div variants={fadeUp as any} className="flex-1 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-text-muted">{feature.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>

                {/* Code */}
                <motion.div variants={fadeUp as any} className="flex-1 w-full">
                  <CodeBlock
                    code={feature.code}
                    language="typescript"
                    title={`${feature.title.toLowerCase().replace(/\s+/g, '-')}.ts`}
                    showLineNumbers
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-surface/30">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-xl p-6 text-center"
              >
                <div className="text-3xl sm:text-4xl font-heading font-bold text-gradient mb-2">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DEVELOPER SECTION ═══════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp as any} className="text-sm font-medium text-accent uppercase tracking-widest mb-3">
              For Developers
            </motion.div>
            <motion.h2 variants={fadeUp as any} className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              Ship Intelligent Agents in Minutes
            </motion.h2>
            <motion.div variants={fadeUp as any} className="text-text-secondary max-w-xl mx-auto">
              The NexusMind SDK gives you persistent memory, encrypted storage, and onchain provenance in a single TypeScript package.
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CodeBlock
              code={SDK_CODE}
              language="typescript"
              title="getting-started.ts"
              showLineNumbers
            />
          </motion.div>

          <div className="mt-8 flex justify-center">
            <Link href="/explorer" id="dev-explore-btn">
              <Button variant="primary" size="lg">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <Footer />
    </div>
  );
}
