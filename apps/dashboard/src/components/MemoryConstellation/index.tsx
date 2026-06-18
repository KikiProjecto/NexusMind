'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { StaticConstellationSVG } from './StaticFallback';

const ThreeConstellation = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => <div className="constellation-placeholder w-full h-full" />,
});

export function MemoryConstellation() {
  const prefersReduced = useReducedMotion();

  // Check WebGL support
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    const hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    if (!hasWebGL || prefersReduced) {
      return <StaticConstellationSVG />;
    }
  }

  return <ThreeConstellation />;
}
