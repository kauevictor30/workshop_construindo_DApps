'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContent } from '@/lib/services/session';
import { CheckCircle2, Code2, Sparkles, Copy, Check, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

interface SlideViewerProps {
  title: string;
  orderIndex: number;
  totalSlides: number;
  content: SlideContent;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ title, orderIndex, totalSlides, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-12 relative overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Slide Header */}
      <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {content.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {content.category}
            </span>
          )}
          {content.badge && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {content.badge}
            </span>
          )}
        </div>
        <div className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
          Slide <span className="text-indigo-400 font-bold">{orderIndex + 1}</span> / {totalSlides}
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="relative z-10 my-auto py-6 flex flex-col justify-center max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={orderIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {title}
              </h1>
              {content.subtitle && (
                <p className="text-lg md:text-xl text-slate-400 font-medium">
                  {content.subtitle}
                </p>
              )}
            </div>

            {/* Render Highlights */}
            {content.highlights && content.highlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {content.highlights.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors shadow-lg shadow-black/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base font-medium text-slate-200 leading-relaxed">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Render Points List */}
            {content.points && content.points.length > 0 && (
              <div className="space-y-3 pt-2">
                {content.points.map((pt, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:bg-slate-900 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                      {pt}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Render Cards Grid */}
            {content.cards && content.cards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {content.cards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Render Code Block */}
            {content.code && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      {content.code.language}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(content.code!.snippet)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto font-mono text-xs md:text-sm text-indigo-200 leading-relaxed bg-slate-950/80">
                  <pre>{content.code.snippet}</pre>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Footer */}
      <div className="relative z-10 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>LiveDeck Realtime Sync • Web3 Workshop</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Acompanhando ao vivo</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>
      </div>
    </div>
  );
};
