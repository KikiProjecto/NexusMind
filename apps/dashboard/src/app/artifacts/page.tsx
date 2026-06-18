'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Lock, Unlock, Download, ExternalLink, Activity, Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useArtifacts } from '@/hooks/useArtifacts';

export default function ArtifactsPage() {
  const { artifacts, formatSize } = useArtifacts();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const artifactList = artifacts.status === 'success' ? artifacts.data : [];
  const isLoading = artifacts.status === 'loading';
  const error = artifacts.status === 'error';

  const selectedArtifact = artifactList?.find((a: any) => a.id === selectedId);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-heading font-bold text-white">Artifact Viewer</h1>
        <p className="text-text-secondary">Inspect onchain artifact records and Walrus-stored blobs.</p>
      </div>

      {isLoading ? (
        <Card className="p-0 overflow-hidden">
          <div className="h-12 bg-bg-elevated border-b border-border-default" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex p-4 border-b border-border-default/50 gap-4">
              <div className="h-5 w-32 bg-bg-elevated rounded animate-pulse" />
              <div className="h-5 w-24 bg-bg-elevated rounded animate-pulse" />
              <div className="h-5 flex-1 bg-bg-elevated rounded animate-pulse" />
            </div>
          ))}
        </Card>
      ) : error ? (
        <Card className="p-12 text-center border-semantic-error/30 flex flex-col items-center">
          <Activity className="h-10 w-10 text-semantic-error mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Failed to load artifacts</h3>
          <p className="text-text-secondary mt-2">Could not fetch records from Sui RPC.</p>
        </Card>
      ) : !artifactList || artifactList.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center">
          <Package className="h-10 w-10 text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">No artifacts found</h3>
          <p className="text-text-secondary mt-2">Agents have not produced any artifacts yet.</p>
        </Card>
      ) : (
        <div className="flex gap-6 h-[600px]">
          {/* Main Table */}
          <Card className={`p-0 overflow-hidden flex flex-col transition-all duration-300 ${selectedId ? 'w-2/3 hidden md:flex' : 'w-full'}`}>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-bg-elevated/50 border-b border-border-default sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-medium">Blob ID</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Agent Role</th>
                    <th className="px-6 py-4 font-medium text-right">Size</th>
                    <th className="px-6 py-4 font-medium text-center">Encrypted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/50">
                  {artifactList.map((item: any) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedId(item.id)}
                      className={`hover:bg-accent/5 cursor-pointer transition-colors ${selectedId === item.id ? 'bg-accent/10 border-l-2 border-l-accent' : 'border-l-2 border-l-transparent'}`}
                    >
                      <td className="px-6 py-4 font-mono text-text-primary">
                        {item.blobId.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="capitalize">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{item.agentRole}</td>
                      <td className="px-6 py-4 text-right text-text-secondary">
                        {formatSize(item.sizeBytes)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.isEncrypted ? (
                          <Lock className="h-4 w-4 mx-auto text-semantic-warning" />
                        ) : (
                          <Unlock className="h-4 w-4 mx-auto text-semantic-success" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Slide-out Detail Panel */}
          <AnimatePresence>
            {selectedId && selectedArtifact && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="w-full md:w-1/3 h-full"
              >
                <Card className="h-full p-6 flex flex-col relative overflow-y-auto">
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="absolute top-6 right-6 text-text-muted hover:text-white"
                  >
                    ✕
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6 pr-6">
                    <div className="h-12 w-12 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-white capitalize">{selectedArtifact.artifactType} Artifact</h3>
                      <p className="text-xs text-text-secondary">{new Date(selectedArtifact.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div>
                      <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Walrus Blob ID</div>
                      <div className="font-mono text-sm break-all bg-bg-base p-3 rounded border border-border-default text-code-text">
                        {selectedArtifact.blobId}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Sui Object ID</div>
                      <div className="font-mono text-sm break-all text-text-secondary">
                        {selectedArtifact.id}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-bg-elevated p-3 rounded">
                        <div className="text-xs text-text-muted mb-1">Producer</div>
                        <div className="text-sm text-white">{selectedArtifact.agentRole}</div>
                      </div>
                      <div className="bg-bg-elevated p-3 rounded">
                        <div className="text-xs text-text-muted mb-1">Workflow Task</div>
                        <div className="text-sm font-mono text-white">{selectedArtifact.taskId}</div>
                      </div>
                    </div>

                    {selectedArtifact.encrypted && (
                      <div className="bg-semantic-warning/10 border border-semantic-warning/20 p-4 rounded-lg flex gap-3">
                        <Lock className="h-5 w-5 text-semantic-warning shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-semantic-warning mb-1">Seal Encrypted</div>
                          <div className="text-xs text-semantic-warning/80">
                            This artifact is encrypted with a Seal threshold policy. Your wallet must have the required capability to decrypt.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-2 pt-6 border-t border-border-default">
                    <Button variant="primary" className="w-full">
                      {selectedArtifact.encrypted ? (
                        <><Lock className="mr-2 h-4 w-4" /> Decrypt & View</>
                      ) : (
                        <><Eye className="mr-2 h-4 w-4" /> View Content</>
                      )}
                    </Button>
                    <Button variant="secondary" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" /> View on Sui Explorer
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Dummy Eye component since lucide-react import above missed it
function Eye(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
