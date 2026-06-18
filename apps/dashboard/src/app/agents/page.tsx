'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, Activity, Clock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusDot } from '@/components/ui/StatusDot';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  uptime: string;
  namespace: string;
  metrics: {
    tasksCompleted: number;
    memoriesStored: number;
    suiBalance: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setAgents(data.agents);
        setIsLoading(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-heading font-bold text-white">Agent Registry</h1>
        <p className="text-text-secondary">Active autonomous agents governed by Sui object capabilities.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="h-64 bg-bg-elevated animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-semantic-error/30 flex flex-col items-center">
          <Activity className="h-10 w-10 text-semantic-error mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Failed to load agents</h3>
          <p className="text-text-secondary mt-2">Could not fetch registry from Sui RPC.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 flex flex-col h-full hover:border-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-bg-elevated border border-border-default flex items-center justify-center shrink-0 shadow-lg shadow-black/50">
                      <Cpu className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                        {agent.name}
                        <ShieldCheck className="h-4 w-4 text-semantic-success" />
                      </h3>
                      <div className="text-sm text-text-muted font-mono mt-1">{agent.id}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={agent.status === 'active' ? 'success' : agent.status === 'idle' ? 'neutral' : 'error'} className="uppercase text-[10px]">
                      {agent.status === 'active' && <StatusDot status="active" />}
                      {agent.status}
                    </Badge>
                    <Badge className="capitalize">
                      {agent.role}
                    </Badge>
                  </div>
                </div>

                <div className="bg-bg-base rounded-lg p-4 border border-border-default mb-6">
                  <div className="text-xs text-text-muted mb-2 uppercase tracking-wider">Memory Namespace</div>
                  <div className="font-mono text-sm text-code-text">{agent.namespace}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-auto border-t border-border-default pt-6">
                  <div>
                    <div className="text-2xl font-bold text-white">{agent.metrics.tasksCompleted}</div>
                    <div className="text-xs text-text-secondary mt-1">Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{agent.metrics.memoriesStored}</div>
                    <div className="text-xs text-text-secondary mt-1">Memories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{agent.metrics.suiBalance.toFixed(1)}</div>
                    <div className="text-xs text-text-secondary mt-1">SUI Gas</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
