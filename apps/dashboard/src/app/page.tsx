'use client';

import { motion } from 'framer-motion';
import { Network, Database, Shield, Activity, RefreshCw } from 'lucide-react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export default function Home() {
  const account = useCurrentAccount();

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexus-panel/50 via-nexus-dark to-nexus-dark blur-3xl"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs text-nexus-cyan mb-6">
            <Activity className="w-4 h-4" /> System Online • All Agents Active
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-balance">
            Decentralized <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-nexus-light/80 max-w-2xl mx-auto mb-10 text-balance">
            NexusMind coordinates specialized AI agents using persistent memory, 
            threshold encryption, and onchain provenance.
          </p>
          {!account ? (
            <div className="p-[2px] rounded-lg bg-gradient-to-r from-nexus-cyan to-nexus-teal inline-block">
              <ConnectButton className="!bg-nexus-dark !text-white !font-body !px-8 !py-3 !rounded-md hover:!bg-nexus-panel transition-colors !border-none" />
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-center">
              <div className="px-6 py-3 rounded-lg glass-panel font-mono text-sm">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </div>
              <button className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium">
                View Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Agents Grid */}
      <section id="agents" className="scroll-mt-24">
        <h2 className="text-3xl font-heading font-semibold mb-8 flex items-center gap-3">
          <Network className="text-nexus-cyan" /> Active Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { role: 'Orchestrator', desc: 'Coordinates tasks and delegates sub-goals to specialists.', status: 'Idle', color: 'from-purple-500/20' },
            { role: 'Researcher', desc: 'Analyzes Web3 market data and stores semantic memories.', status: 'Running', color: 'from-nexus-cyan/20' },
            { role: 'Trader', desc: 'Executes simulated trades based on decrypting research reports.', status: 'Waiting', color: 'from-green-500/20' },
            { role: 'Monitor', desc: 'Monitors Walrus network health and agent latencies.', status: 'Running', color: 'from-yellow-500/20' },
          ].map((agent, i) => (
            <motion.div
              key={agent.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-nexus-cyan/30 transition-colors"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${agent.color} to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-heading font-medium text-lg">{agent.role}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${agent.status === 'Running' ? 'bg-nexus-cyan/20 text-nexus-cyan' : 'bg-white/10 text-nexus-light'}`}>
                  {agent.status}
                </span>
              </div>
              <p className="text-sm text-nexus-light/70">{agent.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Memory Explorer */}
      <section id="memory" className="scroll-mt-24">
        <h2 className="text-3xl font-heading font-semibold mb-8 flex items-center gap-3">
          <Database className="text-nexus-teal" /> MemWal Explorer
        </h2>
        <div className="glass-panel rounded-xl p-6 min-h-[400px] flex flex-col items-center justify-center text-center border-white/5">
          <div className="w-16 h-16 rounded-full bg-nexus-panel flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-nexus-cyan animate-spin-slow" />
          </div>
          <h3 className="text-xl font-heading mb-2">Connect to View Agent Memories</h3>
          <p className="text-nexus-light/60 max-w-md">
            The Memory Explorer visualizes the persistent context shared among agents. Connect your wallet to access the namespace.
          </p>
        </div>
      </section>
      
      {/* Architecture Features */}
      <section className="py-12 border-t border-white/5 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-nexus-panel flex items-center justify-center text-nexus-cyan">
              <Database />
            </div>
            <h3 className="font-heading font-semibold text-lg">Walrus Storage</h3>
            <p className="text-sm text-nexus-light/70">All artifacts, logs, and datasets are permanently stored on Walrus decentralized storage as blobs.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-nexus-panel flex items-center justify-center text-nexus-teal">
              <Shield />
            </div>
            <h3 className="font-heading font-semibold text-lg">Seal Encryption</h3>
            <p className="text-sm text-nexus-light/70">Private agent thoughts and strategies are protected by threshold encryption, unlocked only for allowed peers.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-nexus-panel flex items-center justify-center text-purple-400">
              <Network />
            </div>
            <h3 className="font-heading font-semibold text-lg">Sui Provenance</h3>
            <p className="text-sm text-nexus-light/70">Every action, workflow state, and capability is recorded on the Sui blockchain for verifiable execution.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
