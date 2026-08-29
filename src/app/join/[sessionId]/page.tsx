'use client';

import React, { useEffect, useState, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { RegistrationForm } from '@/components/RegistrationForm';
import { SlideViewer } from '@/components/SlideViewer';
import { LaserPointer } from '@/components/LaserPointer';
import confetti from 'canvas-confetti';
import { Sparkles, MailCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface SlideItem {
  id: string;
  orderIndex: number;
  title: string;
  content: any;
  notes?: string;
}

export default function StudentJoinPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);

  const [session, setSession] = useState<{ id: string; title: string; status: string } | null>(null);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<{ name: string; email: string } | null>(null);
  const [pointer, setPointer] = useState<{ xPct: number; yPct: number; visible: boolean }>({ xPct: 50, yPct: 50, visible: false });
  const [sessionEnded, setSessionEnded] = useState(false);

  // Fetch session details on mount
  useEffect(() => {
    fetch(`/api/session/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Sessão não encontrada.');
        return res.json();
      })
      .then((data) => {
        setSession(data.session);
        setSlides(data.slides);
        setCurrentSlideIndex(data.session.currentSlide);
        if (data.session.status === 'ended') {
          setSessionEnded(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Check localStorage for saved participant (RF-08)
    const stored = localStorage.getItem(`livedeck_user_${sessionId}`);
    if (stored) {
      try {
        setParticipant(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, [sessionId]);

  // Connect to Socket.IO once participant is verified
  useEffect(() => {
    if (!participant || !session) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket: Socket = io(socketUrl);

    socket.emit('join:room', {
      sessionId,
      participantInfo: participant,
    });

    socket.on('slide:sync', ({ currentSlide, status }) => {
      setCurrentSlideIndex(currentSlide);
      if (status === 'ended') {
        setSessionEnded(true);
      }
    });

    socket.on('pointer:move', ({ xPct, yPct, visible }) => {
      setPointer({ xPct, yPct, visible });
    });

    socket.on('session:ended', ({ message }) => {
      setSessionEnded(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, participant, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Carregando sala de apresentação...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Erro ao Carregar Sessão</h2>
          <p className="text-sm text-slate-400">{error || 'A sessão solicitada não existe ou foi removida.'}</p>
        </div>
      </div>
    );
  }

  // STEP 1: Registration Gate Form (US-01)
  if (!participant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#4f46e520,transparent_50%)] pointer-events-none" />
        <RegistrationForm
          sessionId={session.id}
          sessionTitle={session.title}
          onSuccess={(p) => setParticipant(p)}
        />
      </div>
    );
  }

  // STEP 2: Live Slide View + Laser Pointer (US-01, US-03, RF-08)
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 flex flex-col relative select-none">
      {/* Session Ended Banner/Modal */}
      {sessionEnded && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-[90%] p-4 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-slate-900/90 border border-indigo-500/50 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-white">
          <MailCheck className="w-7 h-7 text-emerald-400 shrink-0" />
          <div className="text-xs md:text-sm">
            <p className="font-bold text-white">Sessão Encerrada pelo Instrutor!</p>
            <p className="text-indigo-200">
              Os slides e materiais completos do workshop foram enviados para <strong className="text-white">{participant.email}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Slide Screen Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {currentSlide ? (
          <SlideViewer
            title={currentSlide.title}
            orderIndex={currentSlide.orderIndex}
            totalSlides={slides.length}
            content={currentSlide.content}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            Aguardando início dos slides...
          </div>
        )}

        {/* Realtime Synchronized Laser Pointer Overlay */}
        <LaserPointer xPct={pointer.xPct} yPct={pointer.yPct} visible={pointer.visible} />
      </div>
    </div>
  );
}
