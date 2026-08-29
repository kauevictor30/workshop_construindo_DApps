'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Globe,
  QrCode,
  Copy,
  Check,
  Eye,
  Maximize2,
  Minimize2,
  Grid,
  BookOpen,
  X,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { SlideViewer } from '@/components/SlideViewer';
import { DEFAULT_SLIDE_ITEMS } from '@/lib/default-slides';

interface SlideItem {
  id?: string;
  orderIndex: number;
  title: string;
  content: any;
  notes?: string;
}

export default function PresentationPage() {
  const [session, setSession] = useState<{ id: string; title: string; presenterToken?: string } | null>(null);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Initialize session & slide deck
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worrkshop-blockchain-vks.vercel.app';
    const fallbackJoinUrl = `${origin}/join/web3-ai-workshop-2026`;

    fetch('/api/session/web3-ai-workshop-2026')
      .then((res) => res.json())
      .then((data) => {
        if (data.session && data.slides?.length) {
          setSession(data.session);
          setSlides(data.slides);
          if (typeof data.session.currentSlide === 'number') {
            setCurrentSlideIndex(data.session.currentSlide);
          }
          const finalJoinUrl = data.joinUrl || fallbackJoinUrl;
          setJoinUrl(finalJoinUrl);
          if (data.qrCodeDataUrl) {
            setQrCodeUrl(data.qrCodeDataUrl);
          } else {
            generateQrCode(finalJoinUrl);
          }
        } else {
          loadFallbackData(fallbackJoinUrl);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API load fallback:', err);
        loadFallbackData(fallbackJoinUrl);
        setLoading(false);
      });

    function loadFallbackData(targetJoinUrl: string) {
      setSession({
        id: 'web3-ai-workshop-2026',
        title: 'Introdução a Blockchain: Construindo DApps na Web3 com Soroban & Agentes de IA',
      });
      setSlides(DEFAULT_SLIDE_ITEMS);
      setJoinUrl(targetJoinUrl);
      generateQrCode(targetJoinUrl);
    }

    function generateQrCode(url: string) {
      import('qrcode').then((QRCode) => {
        QRCode.default.toDataURL(url, {
          margin: 2,
          width: 360,
          color: { dark: '#4f46e5', light: '#ffffff' },
        }).then(setQrCodeUrl);
      });
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        if (slides.length) setCurrentSlideIndex(slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      syncSlideCloud(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
      syncSlideCloud(prevIndex);
    }
  };

  const handleGotoSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
      syncSlideCloud(index);
    }
  };

  const syncSlideCloud = (index: number) => {
    fetch('https://api.restful-api.dev/objects/ff808181a04ccf2d01a04efd79720d1b', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'livedeck-web3-ai-workshop-2026',
        data: { currentSlide: index, status: 'live', updatedAt: new Date().toISOString() },
      }),
    }).catch(() => {});
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const { domToPng } = await import('modern-screenshot');
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      const container = document.getElementById('pdf-export-stage');
      if (!container) return;

      const slideElements = container.querySelectorAll('.pdf-export-slide');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080],
      });

      for (let i = 0; i < slideElements.length; i++) {
        const el = slideElements[i] as HTMLElement;
        const dataUrl = await domToPng(el, {
          width: 1920,
          height: 1080,
          scale: 1.2,
          backgroundColor: '#020617',
        });

        if (i > 0) {
          pdf.addPage([1920, 1080], 'landscape');
        }
        pdf.addImage(dataUrl, 'PNG', 0, 0, 1920, 1080);
      }

      pdf.save('slides_workshop_stellar_phppi.pdf');
    } catch (err) {
      console.error('PDF Generation Failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Carregando Apresentação de Slides...</p>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden relative select-none font-sans">
      {/* Subtle Background Lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP PRESENTATION BAR */}
      <header className="relative z-30 px-6 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white truncate max-w-xl">
              {session?.title || 'Introdução a Blockchain & DApps na Stellar'}
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              Slide <strong className="text-indigo-400">{currentSlideIndex + 1}</strong> de {slides.length}
            </span>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverviewModal(true)}
            title="Ver Grade de Slides"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <Grid className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Grade</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            title="Notas do Apresentador"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showNotes
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Notas</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            title="Compartilhar / QR Code do Espectador"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Download className="w-4 h-4 text-sky-400" />}
            <span className="hidden sm:inline">{isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Modo Tela Cheia (F)"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN SLIDE VIEW CONTAINER */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex flex-col justify-center">
        {currentSlide ? (
          <SlideViewer
            title={currentSlide.title}
            orderIndex={currentSlide.orderIndex}
            totalSlides={slides.length}
            content={currentSlide.content}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            Nenhum slide carregado.
          </div>
        )}

        {/* SPEAKER NOTES DRAWER */}
        <AnimatePresence>
          {showNotes && currentSlide?.notes && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-4 left-6 right-6 z-40 p-4 rounded-2xl bg-amber-950/90 border border-amber-500/30 backdrop-blur-xl text-amber-100 text-xs md:text-sm shadow-2xl flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400 block">
                  💡 Notas do Apresentador:
                </span>
                <p className="leading-relaxed">{currentSlide.notes}</p>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                className="p-1 rounded-lg text-amber-400 hover:bg-amber-900/50 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION TOOLBAR */}
      <footer className="relative z-30 px-6 py-3 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentSlideIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-indigo-400" />
          <span>Anterior</span>
        </button>

        {/* Slide Selector Badges Bar */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-xl scrollbar-none py-1">
          {slides.map((s, index) => (
            <button
              key={index}
              onClick={() => handleGotoSlide(index)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                index === currentSlideIndex
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 scale-110'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentSlideIndex === slides.length - 1}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <span>Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* OVERVIEW GRID MODAL */}
      <AnimatePresence>
        {showOverviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Visão Geral dos Slides</h2>
              </div>
              <button
                onClick={() => setShowOverviewModal(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleGotoSlide(idx);
                    setShowOverviewModal(false);
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold">
                      Slide {idx + 1}
                    </span>
                    {s.content?.badge && (
                      <span className="text-[10px] text-emerald-400">{s.content.badge}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold leading-snug line-clamp-2">{s.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {s.content?.subtitle || s.content?.highlights?.[0] || 'Conteúdo explicativo'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* QR CODE SHARE MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>Acesso do Espectador</span>
                </div>
                <h2 className="text-xl font-bold text-white">Escaneie para Acompanhar</h2>
                <p className="text-xs text-slate-400">
                  Os alunos que escanearem este QR Code assistem a apresentação sincronizada em tempo real no celular!
                </p>
              </div>

              {qrCodeUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/30 inline-block">
                  <img src={qrCodeUrl} alt="QR Code Espectador" className="w-52 h-52 object-contain" />
                </div>
              ) : (
                <div className="w-52 h-52 mx-auto flex items-center justify-center text-slate-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIDDEN STAGE FOR PDF EXPORT */}
      <div id="pdf-export-stage" className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        {slides.map((s, index) => (
          <div
            key={index}
            className="pdf-export-slide w-[1920px] h-[1080px] bg-slate-950 overflow-hidden text-slate-100 p-16"
          >
            <SlideViewer title={s.title} orderIndex={s.orderIndex} totalSlides={slides.length} content={s.content} />
          </div>
        ))}
      </div>
    </div>
  );
}
