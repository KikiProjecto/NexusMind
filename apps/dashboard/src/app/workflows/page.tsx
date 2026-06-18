'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, Activity, ChevronDown, CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusDot } from '@/components/ui/StatusDot';
import { useWorkflows } from '@/hooks/useWorkflows';

export default function WorkflowsPage() {
  const { workflows } = useWorkflows();
  const wfList = workflows.status === 'success' ? workflows.data : undefined;
  const isLoading = workflows.status === 'loading';
  const error = workflows.status === 'error';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-semantic-success" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-semantic-error" />;
      case 'running': return <StatusDot status="active" />;
      default: return <Circle className="h-5 w-5 text-text-muted" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'failed': return <Badge variant="error">Failed</Badge>;
      case 'running': return <Badge variant="info">Running</Badge>;
      default: return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-heading font-bold text-white">Workflow Debugger</h1>
        <p className="text-text-secondary">Monitor onchain state machines and multi-agent coordination.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Card key={i} className="p-6 h-24 bg-bg-elevated animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-semantic-error/30 flex flex-col items-center">
          <Activity className="h-10 w-10 text-semantic-error mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Failed to load workflows</h3>
          <p className="text-text-secondary mt-2">Could not fetch state from Sui RPC.</p>
        </Card>
      ) : !wfList || wfList.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center">
          <Workflow className="h-10 w-10 text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">No active workflows</h3>
          <p className="text-text-secondary mt-2">Create a new task to see workflow execution.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {wfList?.map((wf: any) => (
            <Card 
              key={wf.id} 
              className={`overflow-hidden transition-all duration-300 hover:border-border-accent ${expandedId === wf.id ? 'border-border-accent bg-bg-elevated/30' : ''}`}
            >
              {/* Header (Clickable) */}
              <div 
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === wf.id ? null : wf.id)}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(wf.status)}
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-white">{wf.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span className="font-mono">{wf.id}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(wf.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-4 text-sm text-text-secondary">
                    <div><span className="text-white font-medium">{wf.agentCount}</span> Agents</div>
                    <div><span className="text-white font-medium">{wf.artifactCount}</span> Artifacts</div>
                  </div>
                  {getStatusBadge(wf.status)}
                  <ChevronDown className={`h-5 w-5 text-text-muted transition-transform duration-300 ${expandedId === wf.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Timeline (Expandable) */}
              <AnimatePresence>
                {expandedId === wf.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border-default bg-bg-base/50"
                  >
                    <div className="p-6 pt-8 pl-10 relative">
                      {/* Vertical line connecting tasks */}
                      <div className="absolute left-[47px] top-8 bottom-8 w-px bg-border-default" />
                      
                      <div className="space-y-8 relative">
                        {wf.tasks.map((task: any, idx: number) => (
                          <div key={task.id} className="flex gap-6 items-start relative z-10">
                            <div className="bg-bg-base p-1 rounded-full">
                              {getStatusIcon(task.status)}
                            </div>
                            <div className="flex-1 bg-bg-elevated border border-border-default rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-white">{task.name}</h4>
                                <Badge className="text-xs">{task.agentRole}</Badge>
                              </div>
                              <div className="text-sm text-text-secondary font-mono text-xs">
                                Task ID: {task.id}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {wf.error && (
                        <div className="mt-8 bg-semantic-error/10 border border-semantic-error/20 rounded-lg p-4 flex gap-3 text-sm">
                          <AlertCircle className="h-5 w-5 text-semantic-error shrink-0" />
                          <div className="text-semantic-error/90">{wf.error}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
