'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaserPointerProps {
  xPct: number;
  yPct: number;
  visible: boolean;
}

export const LaserPointer: React.FC<LaserPointerProps> = ({ xPct, yPct, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${xPct}%`,
            top: `${yPct}%`,
          }}
        >
          {/* Outer Pulsing Glow */}
          <div className="w-8 h-8 rounded-full bg-red-500/40 animate-ping absolute -inset-2" />
          
          {/* Middle Radial Glow */}
          <div className="w-6 h-6 rounded-full bg-red-500/60 blur-xs absolute -inset-1" />
          
          {/* Core Laser Dot */}
          <div className="w-4 h-4 rounded-full bg-red-400 border-2 border-white shadow-[0_0_15px_#f87171] relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
