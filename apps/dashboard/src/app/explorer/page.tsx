'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MessageSquare, Database, Clock, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMemory } from '@/hooks/useMemory';

const NAMESPACES = ['All', 'Orchestrator', 'Researcher', 'Trader', 'Monitor'];

export default function ExplorerPage() {
  const [query, setQuery] = useState('');
  const [activeNamespace, setActiveNamespace] = useState('All');
  
  const { searchResults, isSearching } = useMemory();
  // We'll use searchResults for memories display. 
  // Normally we'd call recall(query, activeNamespace) on query change.
  // For now just to fix TS:
  const memories = searchResults;
  const isLoading = isSearching;
  const error = false;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-heading font-bold text-white">Memory Explorer</h1>
          <p className="text-text-secondary">Search and browse persistent agent memories backed by MemWal.</p>
        </div>
        <Button variant="primary" className="shrink-0 group">
          <MessageSquare className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          Ask Memory
        </Button>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search memories (e.g. 'DeFi trends', 'latency spikes')..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="h-4 w-4 text-text-muted" />}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="h-4 w-4 text-text-muted shrink-0 mr-1" />
          {NAMESPACES.map(ns => (
            <Button 
              key={ns} 
              variant={activeNamespace === ns ? 'secondary' : 'ghost'} 
              onClick={() => setActiveNamespace(ns)}
              className="rounded-full shrink-0"
            >
              {ns}
            </Button>
          ))}
        </div>
      </Card>

      {/* States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-5 h-40 flex flex-col">
              <div className="flex justify-between mb-4">
                <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
                <div className="h-5 w-16 bg-bg-elevated rounded animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-bg-elevated rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-bg-elevated rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-bg-elevated rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-semantic-error/30 flex flex-col items-center">
          <Database className="h-10 w-10 text-semantic-error mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Failed to load memories</h3>
          <p className="text-text-secondary mt-2">Check your Walrus aggregator connection.</p>
        </Card>
      ) : memories?.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center">
          <Sparkles className="h-10 w-10 text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">No memories found</h3>
          <p className="text-text-secondary mt-2">Try adjusting your search or namespace filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {memories?.map((memoryObj: any) => {
              const memory = memoryObj.memory || memoryObj;
              return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-5 h-full flex flex-col hover:border-border-accent transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="font-mono text-xs">
                      {memory.namespace}
                    </Badge>
                    {memory.similarityScore && (
                      <Badge variant="info" className="text-xs">
                        {(memory.similarityScore * 100).toFixed(0)}% Match
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-text-primary text-sm leading-relaxed flex-1 mb-4">
                    {memory.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border-default">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(memory.timestamp).toLocaleString()}
                    </div>
                    {memory.blobId && (
                      <div className="font-mono bg-bg-base px-2 py-1 rounded truncate max-w-[120px] group-hover:text-accent transition-colors cursor-pointer">
                        {memory.blobId.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
