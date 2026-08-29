'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Users,
  MonitorPlay,
  Sliders,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  ShieldCheck,
  Download,
  Loader2,
  Globe,
  Radio,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { SlideViewer } from '@/components/SlideViewer';
import { LaserPointer } from '@/components/LaserPointer';

interface SlideItem {
  id: string;
  orderIndex: number;
  title: string;
  content: any;
  notes?: string;
}

export default function StartScreenPage() {
  const [session, setSession] = useState<{ id: string; title: string; currentSlide: number; presenterToken: string } | null>(null);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectedCount, setConnectedCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Fetch Session data on mount with resilient client fallback
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worrkshop-blockchain-vks.vercel.app';
    const fallbackJoinUrl = `${origin}/join/web3-ai-workshop-2026`;

    fetch('/api/session/web3-ai-workshop-2026')
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setSession(data.session);
          setSlides(data.slides || []);
          setCurrentSlideIndex(data.session.currentSlide || 0);

          const finalJoinUrl = data.joinUrl || fallbackJoinUrl;
          setJoinUrl(finalJoinUrl);

          if (data.qrCodeDataUrl) {
            setQrCodeUrl(data.qrCodeDataUrl);
          } else {
            import('qrcode').then((QRCode) => {
              QRCode.default.toDataURL(finalJoinUrl, {
                margin: 2,
                width: 360,
                color: { dark: '#4f46e5', light: '#ffffff' },
              }).then(setQrCodeUrl);
            });
          }
        } else {
          generateClientFallback(fallbackJoinUrl);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load session from API, using client fallback:', err);
        generateClientFallback(fallbackJoinUrl);
        setLoading(false);
      });

    function generateClientFallback(targetJoinUrl: string) {
      setJoinUrl(targetJoinUrl);
      import('qrcode').then((QRCode) => {
        QRCode.default.toDataURL(targetJoinUrl, {
          margin: 2,
          width: 360,
          color: { dark: '#4f46e5', light: '#ffffff' },
        }).then(setQrCodeUrl);
      });
    }
  }, []);

  // Socket sync for real-time spectator count and slide updates
  useEffect(() => {
    if (!session) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!socketUrl) return;

    const socket: Socket = io(socketUrl, {
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.emit('join:room', { sessionId: session.id });

    socket.on('slide:sync', ({ currentSlide }) => {
      setCurrentSlideIndex(currentSlide);
    });

    socket.on('room:stats', ({ connectedCount }) => {
      setConnectedCount(connectedCount || 0);
    });

    socket.on('connect_error', () => {
      // Quiet fail if standalone socket server is not present in serverless mode
    });

    return () => {
      socket.disconnect();
    };
  }, [session]);

  const handleCopyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNavigateSlide = (targetIndex: number) => {
    if (!session || !slides.length) return;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setCurrentSlideIndex(targetIndex);

    // If presenter token available, emit via socket
    if (socketRef.current && session.presenterToken) {
      socketRef.current.emit('slide:navigate', {
        sessionId: session.id,
        token: session.presenterToken,
        targetSlide: targetIndex,
      });
    }
  };

  // Direct PDF Download Handler
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
      <div className="w-screen h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Carregando Tela de Início LiveDeck...</p>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Glowing Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-20 px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Live Deck Workshop
              </span>
              <span className="text-xs text-slate-500 font-mono">Sessão: {session?.id}</span>
            </div>
            <h1 className="text-base font-bold text-white truncate max-w-lg">
              {session?.title || 'Workshop Introdução a Blockchain & Web3'}
            </h1>
          </div>
        </div>

        {/* Header Action Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Espectadores On:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {connectedCount}
            </span>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Download className="w-4 h-4 text-sky-400" />
            )}
            <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
          </button>

          <a
            href={`/presenter/${session?.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Painel do Apresentador</span>
          </a>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* TOP BANNER / HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: SPECTATOR QR CODE CARD (HERO FOCUS) */}
          <div className="lg:col-span-5 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-slate-900/80 to-slate-950 border-2 border-indigo-500/30 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>QR Code do Espectador</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                Escaneie para Assistir no Celular
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Ao escanear o QR Code, o espectador abre a apresentação diretamente no{' '}
                <strong className="text-indigo-400">1º Slide</strong>. Na visão do espectador,{' '}
                <strong className="text-emerald-400">ele apenas assiste em tempo real</strong> sem controles de navegação. Quem controla os slides é você!
              </p>
            </div>

            {/* QR CODE DISPLAY BOX */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
              {qrCodeUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/40">
                  <img src={qrCodeUrl} alt="QR Code do Espectador" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
                </div>
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}

              {/* Link copy & direct open */}
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  title="Copiar Link do Espectador"
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir visão do espectador em nova aba"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shrink-0 flex items-center gap-1 text-xs font-semibold"
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Testar</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sincronização instantânea de slides e ponteiro laser via WebSockets.</span>
            </div>
          </div>

          {/* RIGHT: PRESENTER ACTION DASHBOARD & SLIDE PREVIEW */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* ROLE COMPARISON & QUICK ACTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Espectador Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Visão do Espectador</h3>
                    <span className="text-[10px] text-sky-400 uppercase font-semibold">Somente Leitura</span>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Inicia automaticamente no <strong>Slide 1</strong></li>
                  <li><strong>Apenas assiste</strong> a apresentação</li>
                  <li>Sem botões de passar slide</li>
                  <li>Vê o ponteiro laser do apresentador</li>
                  <li>Recebe o material no e-mail ao final</li>
                </ul>
              </div>

              {/* Apresentador Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Visão do Apresentador</h3>
                    <span className="text-[10px] text-indigo-400 uppercase font-semibold">Você no Controle</span>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Navegação total (Teclas ou Clique)</li>
                  <li>Controle de ponteiro laser na tela</li>
                  <li>Leitura das notas do orador</li>
                  <li>Painel de inscritos e disparo de e-mails</li>
                </ul>
              </div>
            </div>

            {/* ACTION BUTTONS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`/presenter/${session?.id}`}
                className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/20 border border-indigo-400/30 flex items-center justify-between group transition-all cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-mono text-indigo-200 uppercase font-bold block">
                    Painel Principal
                  </span>
                  <span className="text-base font-bold text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                    Abrir Controle do Apresentador
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <Sliders className="w-7 h-7 text-indigo-200 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={`/projector/${session?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-mono text-purple-400 uppercase font-bold block">
                    Modo Projetor (HDMI)
                  </span>
                  <span className="text-base font-bold text-slate-200 group-hover:text-purple-300 transition-colors inline-flex items-center gap-1.5">
                    Abrir Tela Limpa sem Botões
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </span>
                </div>
                <MonitorPlay className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform" />
              </a>
            </div>

            {/* LIVE SLIDE STAGE PREVIEW & QUICK CONTROL */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Pré-visualização do Slide Ativo na Sala</span>
                </div>
                <span className="text-indigo-400 font-bold">
                  Slide {currentSlideIndex + 1} de {slides.length}
                </span>
              </div>

              {/* Slide Preview Aspect ratio box */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-inner">
                {currentSlide ? (
                  <SlideViewer
                    title={currentSlide.title}
                    orderIndex={currentSlide.orderIndex}
                    totalSlides={slides.length}
                    content={currentSlide.content}
                  />
                ) : null}
              </div>

              {/* Quick Presenter Slide Controls on Home Screen */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleNavigateSlide(0)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar no Slide 1</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigateSlide(currentSlideIndex - 1)}
                    disabled={currentSlideIndex === 0}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-indigo-300 px-2">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                  <button
                    onClick={() => handleNavigateSlide(currentSlideIndex + 1)}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* OFFSCREEN DOM FOR CLEAN PDF GENERATION */}
      <div
        id="pdf-export-stage"
        style={{
          position: 'absolute',
          top: '-10000px',
          left: '-10000px',
          width: '1920px',
          backgroundColor: '#020617',
          color: '#f8fafc',
        }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className="pdf-export-slide"
            style={{
              width: '1920px',
              height: '1080px',
              padding: '90px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#020617',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #1e293b',
                paddingBottom: '20px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
                Workshop — Slide {idx + 1} de {slides.length}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>
                LiveDeck Presentation Platform
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 'auto 0' }}>
              <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', margin: 0 }}>
                {slide.title}
              </h2>
              {slide.content?.subtitle && (
                <p style={{ fontSize: '24px', color: '#cbd5e1', fontWeight: '500', lineHeight: '1.4', margin: 0 }}>
                  {slide.content.subtitle}
                </p>
              )}

              {slide.content?.highlights && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '24px' }}>
                  {slide.content.highlights.map((h: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        fontSize: '18px',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '22px' }}>✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.content?.points && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '24px' }}>
                  {slide.content.points.map((p: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        fontSize: '18px',
                        color: '#f1f5f9',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                      }}
                    >
                      <span
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '12px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.content?.cards && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', paddingTop: '24px' }}>
                  {slide.content.cards.map((c: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <h4 style={{ fontWeight: 'bold', fontSize: '20px', color: '#ffffff', margin: 0 }}>
                        {c.title}
                      </h4>
                      <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                        {c.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {slide.content?.code && (
                <div
                  style={{
                    padding: '32px',
                    borderRadius: '24px',
                    backgroundColor: '#020617',
                    border: '1px solid #1e293b',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#7dd3fc',
                    lineHeight: '1.6',
                    marginTop: '24px',
                    overflow: 'hidden',
                  }}
                >
                  <pre style={{ margin: 0 }}>{slide.content.code.snippet}</pre>
                </div>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid #1e293b',
                paddingTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                fontSize: '14px',
                fontWeight: '500',
                color: '#64748b',
              }}
            >
              <span>{session?.title}</span>
              <span>LiveDeck • 2026</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
