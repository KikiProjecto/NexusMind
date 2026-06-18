'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

function CodeBlock({
  code,
  language = 'typescript',
  title,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API not available in some contexts */
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl border border-border-default overflow-hidden',
          className,
        ),
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-surface border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          {title && (
            <span className="text-xs text-text-muted font-mono">{title}</span>
          )}
          {!title && language && (
            <span className="text-xs text-text-muted font-mono">{language}</span>
          )}
        </div>
        <button
          id={`copy-btn-${title?.replace(/\s+/g, '-') ?? language}`}
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="bg-code-bg overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="text-code-text font-mono">
            {showLineNumbers
              ? lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none w-8 text-right mr-4 text-text-muted/40 text-xs leading-relaxed">
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}

export { CodeBlock, type CodeBlockProps };
