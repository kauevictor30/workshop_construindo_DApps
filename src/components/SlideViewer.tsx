'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContent } from '@/lib/services/session';
import {
  CheckCircle2,
  Code2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Terminal,
  XCircle,
  HelpCircle,
  Zap,
  Cpu,
  Layout,
  Key,
  Info,
  Clock,
  Layers,
  Bot,
} from 'lucide-react';

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

  const getCardIcon = (iconName?: string) => {
    switch (iconName) {
      case 'layout':
        return <Layout className="w-5 h-5" />;
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'key':
        return <Key className="w-5 h-5" />;
      case 'bot':
        return <Bot className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-10 relative overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Background Ambience & Lighting Effects */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Slide Header */}
      <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {content.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              {content.category}
            </span>
          )}
          {content.badge && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {content.badge}
            </span>
          )}
        </div>
        <div className="text-xs font-mono font-medium text-slate-400 bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 shadow-inner">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Slide</span>
          <span className="text-indigo-400 font-bold text-sm">{orderIndex + 1}</span>
          <span className="text-slate-600">/</span>
          <span>{totalSlides}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 my-auto py-4 flex flex-col justify-center max-w-6xl mx-auto w-full">
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
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {title}
              </h1>
              {content.subtitle && (
                <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed">
                  {content.subtitle}
                </p>
              )}
            </div>

            {/* Render Timeline / Didactic Step Progression */}
            {content.timeline && content.timeline.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {content.timeline.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between relative group shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {step.year}
                        </span>
                        <Clock className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    {step.highlight && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-400">
                        <span>{step.highlight}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Render Comparison (Mito vs Realidade) */}
            {content.comparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left Card (Mitos / Web2) */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
                    <h3 className="text-lg font-bold text-rose-300 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-400" />
                      {content.comparison.leftTitle}
                    </h3>
                    {content.comparison.leftBadge && (
                      <span className="text-xs px-2.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-900/50">
                        {content.comparison.leftBadge}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {content.comparison.leftItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Right Card (Realidade / Web3) */}
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                    <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      {content.comparison.rightTitle}
                    </h3>
                    {content.comparison.rightBadge && (
                      <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
                        {content.comparison.rightBadge}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {content.comparison.rightItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            )}

            {/* Render Cards Grid */}
            {content.cards && content.cards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {content.cards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {getCardIcon(card.icon)}
                        </div>
                        {card.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
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

            {/* Render Highlights */}
            {content.highlights && content.highlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {content.highlights.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 transition-colors shadow-lg"
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
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:bg-slate-900 transition-all shadow-md"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed">
                      {pt}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Render Code Block */}
            {content.code && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl space-y-0">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono text-slate-400 uppercase font-bold">
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
                <div className="p-4 overflow-x-auto font-mono text-xs md:text-sm text-indigo-200 leading-relaxed bg-slate-950/90">
                  <pre>{content.code.snippet}</pre>
                </div>
                {content.code.explanation && (
                  <div className="px-4 py-3 bg-indigo-950/30 border-t border-slate-800 text-xs text-indigo-300 font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{content.code.explanation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Render Tip Box / Callout */}
            {content.tipBox && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 flex items-start gap-3.5 shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-indigo-200">{content.tipBox.title}</h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{content.tipBox.desc}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Footer */}
      <div className="relative z-10 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>LiveDeck Sincronizado • Stellar Ambassador 2026</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400">Ao vivo na sala</span>
        </div>
      </div>
    </div>
  );
};
