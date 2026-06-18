'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Database, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RestorePage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] ${msg}`]);
  };

  const handleSimulateLoss = () => {
    setIsAnimating(true);
    setLogs([]);
    addLog('CRITICAL: Local database corruption detected.');
    
    setTimeout(() => {
      addLog('WARN: IndexedDB wiped. All local memories lost.');
      setStep(1);
      setIsAnimating(false);
    }, 1500);
  };

  const handleRestore = () => {
    setIsAnimating(true);
    addLog('INFO: Initiating MemWal.restore() across all namespaces...');
    
    setTimeout(() => {
      addLog('INFO: Connecting to Walrus Aggregator (testnet)...');
    }, 1000);

    setTimeout(() => {
      addLog('INFO: Fetching epoch metadata for namespace nexusmind-researcher-v1...');
    }, 2500);

    setTimeout(() => {
      addLog('INFO: Discovered 8,204 blob IDs from onchain registry.');
      addLog('INFO: Downloading and decrypting blobs...');
    }, 4000);

    setTimeout(() => {
      addLog('SUCCESS: Memory graph fully rebuilt from decentralized storage.');
      setStep(2);
      setIsAnimating(false);
    }, 6000);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-heading font-bold text-white mb-4">The Killer Demo: Memory Restore</h1>
        <p className="text-text-secondary leading-relaxed">
          Standard agents lose their mind when the server restarts. NexusMind agents persist memories to Walrus decentralized storage. 
          If local data is destroyed, a single <code className="text-accent bg-accent/10 px-1 rounded">restore()</code> call rebuilds their entire semantic knowledge graph.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-semantic-error/10 flex items-center justify-center mb-6">
            <Trash2 className="h-10 w-10 text-semantic-error" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-white mb-2">1. Destroy Memory</h3>
          <p className="text-text-secondary mb-8 text-sm">
            Simulate a catastrophic server failure by wiping the agent's local IndexedDB vector store.
          </p>
          <Button 
            variant="primary" 
            className="w-full bg-semantic-error hover:bg-semantic-error/80 text-white border-transparent"
            onClick={handleSimulateLoss}
            disabled={step !== 0 || isAnimating}
          >
            Simulate Complete Data Loss
          </Button>
        </Card>

        <Card className="p-8 flex flex-col items-center text-center opacity-50 transition-opacity duration-500" style={{ opacity: step >= 1 ? 1 : 0.5 }}>
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 relative">
            <Database className="h-10 w-10 text-accent relative z-10" />
            {isAnimating && step === 1 && (
              <div className="absolute inset-0 border-2 border-accent rounded-full animate-ping" />
            )}
          </div>
          <h3 className="text-xl font-heading font-semibold text-white mb-2">2. Rebuild from Walrus</h3>
          <p className="text-text-secondary mb-8 text-sm">
            Call the MemWal restore API to fetch blob references from Sui and download the encrypted payloads from Walrus.
          </p>
          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleRestore}
            disabled={step !== 1 || isAnimating}
          >
            {isAnimating && step === 1 ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Execute agent.restore()
          </Button>
        </Card>
      </div>

      {/* Terminal Output */}
      <Card className="bg-code-bg border-border-default/50 p-0 overflow-hidden">
        <div className="bg-[#1A1A24] px-4 py-2 border-b border-border-default/30 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-semantic-error/50" />
            <div className="w-3 h-3 rounded-full bg-semantic-warning/50" />
            <div className="w-3 h-3 rounded-full bg-semantic-success/50" />
          </div>
          <div className="text-xs text-text-muted font-mono ml-4">Agent Console</div>
        </div>
        <div className="p-6 font-mono text-sm h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-text-muted">Waiting for action...</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={
                  log.includes('CRITICAL') || log.includes('WARN') ? 'text-semantic-error' :
                  log.includes('SUCCESS') ? 'text-semantic-success' : 
                  'text-code-text'
                }>
                  {log}
                </div>
              ))}
              {isAnimating && (
                <div className="text-text-muted animate-pulse">_</div>
              )}
            </div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-semantic-success/10 border border-semantic-success/30 p-6 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-semantic-success" />
              <div>
                <h4 className="font-semibold text-white text-lg">System Restored</h4>
                <p className="text-semantic-success text-sm mt-1">12,847 memories successfully recovered from Walrus testnet.</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => { setStep(0); setLogs([]); }}>
              Reset Demo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
