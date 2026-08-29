'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { io, Socket } from 'socket.io-client';
import throttle from 'lodash.throttle';
import { SlideViewer } from '@/components/SlideViewer';
import { LaserPointer } from '@/components/LaserPointer';
import {
  ChevronLeft,
  ChevronRight,
  MonitorPlay,
  Users,
  QrCode,
  Send,
  Lock,
  MousePointer2,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import Image from 'next/image';

interface SlideItem {
  id: string;
  orderIndex: number;
  title: string;
  content: any;
  notes?: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export default function PresenterControlPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);

  const [session, setSession] = useState<{ id: string; title: string; status: string; presenterToken: string } | null>(null);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [presenterToken, setPresenterToken] = useState<string>('');
  
  const [connectedCount, setConnectedCount] = useState(0);
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [pointer, setPointer] = useState<{ xPct: number; yPct: number; visible: boolean }>({ xPct: 50, yPct: 50, visible: false });
  const [isPointerActive, setIsPointerActive] = useState(true);
  const [endingSession, setEndingSession] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Fetch session data
  useEffect(() => {
    fetch(`/api/session/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setSession(data.session);
        setSlides(data.slides);
        setCurrentSlideIndex(data.session.currentSlide);
        setQrCodeUrl(data.qrCodeDataUrl);
        setJoinUrl(data.joinUrl);
        if (data.session.status === 'ended') {
          setSessionEnded(true);
        }

        // Check token in URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const storedToken = localStorage.getItem(`livedeck_presenter_token_${sessionId}`);

        const activeToken = tokenFromUrl || storedToken;
        if (activeToken) {
          setPresenterToken(activeToken);
          setIsAuthenticated(true);
        }

        setLoading(false);
      })
      .catch((err) => console.error('Presenter fetch error:', err));
  }, [sessionId]);

  // Connect to Socket.IO as Presenter
  useEffect(() => {
    if (!isAuthenticated || !presenterToken || !session) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket: Socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join:room', {
      sessionId,
      token: presenterToken,
    });

    socket.on('auth:success', () => {
      console.log('[Presenter Socket] Authenticated as Presenter');
    });

    socket.on('slide:sync', ({ currentSlide, status }) => {
      setCurrentSlideIndex(currentSlide);
      if (status === 'ended') {
        setSessionEnded(true);
      }
    });

    socket.on('room:stats', ({ connectedCount, participantsList }) => {
      setConnectedCount(connectedCount || 0);
      if (participantsList) {
        setParticipantsList(participantsList);
      }
    });

    socket.on('error:unauthorized', ({ message }) => {
      alert(`[Erro de Segurança]: ${message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, isAuthenticated, presenterToken, session]);

  // Throttled Pointer Emission (RF-06 & RF-07)
  const emitPointerThrottled = useRef(
    throttle((xPct: number, yPct: number, visible: boolean) => {
      if (socketRef.current && presenterToken) {
        socketRef.current.emit('pointer:update', {
          sessionId,
          token: presenterToken,
          xPct,
          yPct,
          visible,
        });
      }
    }, 50)
  ).current;

  const handleMouseMovePreview = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPointerActive || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setPointer({ xPct, yPct, visible: true });
    emitPointerThrottled(xPct, yPct, true);
  };

  const handleMouseLeavePreview = () => {
    setPointer((prev) => ({ ...prev, visible: false }));
    emitPointerThrottled(0, 0, false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, currentSlideIndex, slides.length]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setPresenterToken(tokenInput.trim());
    localStorage.setItem(`livedeck_presenter_token_${sessionId}`, tokenInput.trim());
    setIsAuthenticated(true);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1 && socketRef.current) {
      const target = currentSlideIndex + 1;
      socketRef.current.emit('slide:navigate', {
        sessionId,
        token: presenterToken,
        targetSlide: target,
      });
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0 && socketRef.current) {
      const target = currentSlideIndex - 1;
      socketRef.current.emit('slide:navigate', {
        sessionId,
        token: presenterToken,
        targetSlide: target,
      });
    }
  };

  const handleGotoSlide = (index: number) => {
    if (socketRef.current && index >= 0 && index < slides.length) {
      socketRef.current.emit('slide:navigate', {
        sessionId,
        token: presenterToken,
        targetSlide: index,
      });
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Deseja realmente encerrar a sessão? Todos os alunos cadastrados receberão o material por e-mail imediatamente.')) {
      return;
    }

    setEndingSession(true);
    try {
      if (socketRef.current) {
        socketRef.current.emit('session:end', {
          sessionId,
          token: presenterToken,
        });
      }

      await fetch(`/api/session/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presenterToken }),
      });

      setSessionEnded(true);
      alert('Sessão encerrada com sucesso! Disparo de e-mails em processamento.');
    } catch (err) {
      console.error('End session error:', err);
      alert('Erro ao encerrar sessão.');
    } finally {
      setEndingSession(false);
    }
  };

  const handleCopyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Carregando Painel do Instrutor...</p>
      </div>
    );
  }

  // Authentication Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Painel do Instrutor</h2>
            <p className="text-xs text-slate-400">Informe a chave secreta do apresentador para controlar o LiveDeck.</p>
          </div>

          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Chave secreta do apresentador..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition-all cursor-pointer"
            >
              Autenticar e Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Header Bar */}
      <header className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            LiveDeck Presenter
          </span>
          <h1 className="text-sm md:text-base font-bold text-slate-200 truncate max-w-md">
            {session?.title}
          </h1>
        </div>

        {/* Live Audience Monitor Badge (RF-12) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowParticipantsModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Alunos Conectados:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              {connectedCount}
            </span>
          </button>

          {/* QR Code Trigger Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Exibir QR Code</span>
          </button>

          {/* Clean HDMI Display View */}
          <a
            href={`/projector/${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-colors"
          >
            <MonitorPlay className="w-4 h-4" />
            <span>Abrir View Projetor (HDMI Limpa)</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            disabled={endingSession || sessionEnded}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sessionEnded
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sessionEnded ? 'Sessão Encerrada' : 'Encerrar & Disparar E-mails'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Interactive Slide Preview & Pointer Control Canvas (US-03) */}
        <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-between border-r border-slate-800 bg-slate-950/80">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-red-400" />
              <span>Canvas do Ponteiro Laser (Mova o mouse sobre a imagem)</span>
            </div>
            <button
              onClick={() => setIsPointerActive(!isPointerActive)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                isPointerActive
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Ponteiro: {isPointerActive ? 'ATIVO' : 'DESATIVADO'}
            </button>
          </div>

          {/* Preview Container with Mouse Tracking */}
          <div
            ref={previewRef}
            onMouseMove={handleMouseMovePreview}
            onMouseLeave={handleMouseLeavePreview}
            className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl relative cursor-crosshair group bg-slate-900"
          >
            {currentSlide ? (
              <SlideViewer
                title={currentSlide.title}
                orderIndex={currentSlide.orderIndex}
                totalSlides={slides.length}
                content={currentSlide.content}
              />
            ) : null}

            {/* Local Preview of Pointer */}
            <LaserPointer xPct={pointer.xPct} yPct={pointer.yPct} visible={pointer.visible} />
          </div>

          {/* Navigation Controls Bar */}
          <div className="w-full flex items-center justify-between mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 font-bold text-xs text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Pular para:</span>
              <select
                value={currentSlideIndex}
                onChange={(e) => handleGotoSlide(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-mono font-bold focus:outline-none"
              >
                {slides.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    Slide {idx + 1}: {s.title.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 font-bold text-xs text-white transition-all cursor-pointer"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Speaker Notes & Slide Thumbnails */}
        <div className="w-full md:w-96 p-4 md:p-6 bg-slate-900/60 border-t md:border-t-0 border-slate-800 flex flex-col justify-between space-y-6">
          {/* Speaker Notes */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
              <BookOpen className="w-4 h-4" />
              <span>Notas do Apresentador</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-300 leading-relaxed min-h-[160px] font-sans">
              {currentSlide?.notes ? (
                <p>{currentSlide.notes}</p>
              ) : (
                <p className="text-slate-500 italic text-xs">Nenhuma nota para este slide.</p>
              )}
            </div>
          </div>

          {/* Quick Slide Grid Thumbnails */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grade de Slides ({slides.length})
            </h4>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleGotoSlide(idx)}
                  className={`p-2 rounded-xl text-center font-mono text-xs font-bold border transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white">QR Code para os Alunos</h3>
            <p className="text-xs text-slate-400">
              Exiba na tela ou imprima para que a audiência escaneie com o celular.
            </p>

            {qrCodeUrl && (
              <div className="p-4 rounded-2xl bg-white inline-block shadow-xl mx-auto">
                <img src={qrCodeUrl} alt="QR Code Workshop" className="w-56 h-56" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300"
              />
              <button
                onClick={handleCopyJoinLink}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition-all cursor-pointer"
            >
              Fechar Modal
            </button>
          </div>
        </div>
      )}

      {/* PARTICIPANTS MODAL */}
      {showParticipantsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Alunos Cadastrados ({participantsList.length})
              </h3>
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {participantsList.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">Nenhum aluno cadastrado até o momento.</p>
              ) : (
                participantsList.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-slate-400 font-mono">{p.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(p.joinedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
