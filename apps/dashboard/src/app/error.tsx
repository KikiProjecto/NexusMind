'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-semantic-error/30 p-8 text-center flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-semantic-error/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-semantic-error" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-text-secondary mb-8">
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </p>
        <Button variant="primary" onClick={reset} className="w-full">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </Card>
    </div>
  );
}
