'use client';

import React, { useEffect, useState, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { SlideViewer } from '@/components/SlideViewer';
import { LaserPointer } from '@/components/LaserPointer';
import { RefreshCw, MonitorPlay } from 'lucide-react';

interface SlideItem {
  id: string;
  orderIndex: number;
  title: string;
  content: any;
}

export default function CleanProjectorPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);

  const [session, setSession] = useState<{ id: string; title: string } | null>(null);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pointer, setPointer] = useState<{ xPct: number; yPct: number; visible: boolean }>({ xPct: 50, yPct: 50, visible: false });

  useEffect(() => {
    fetch(`/api/session/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setSession(data.session);
        setSlides(data.slides);
        setCurrentSlideIndex(data.session.currentSlide);
        setLoading(false);
      })
      .catch((err) => console.error('Projector load error:', err));
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket: Socket = io(socketUrl);

    socket.emit('join:room', { sessionId });

    socket.on('slide:sync', ({ currentSlide }) => {
      setCurrentSlideIndex(currentSlide);
    });

    socket.on('pointer:move', ({ xPct, yPct, visible }) => {
      setPointer({ xPct, yPct, visible });
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, session]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400 font-mono">Iniciando View Limpa do Projetor...</p>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 flex flex-col relative select-none">
      {/* Main Slide Display without Controls */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {currentSlide ? (
          <SlideViewer
            title={currentSlide.title}
            orderIndex={currentSlide.orderIndex}
            totalSlides={slides.length}
            content={currentSlide.content}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <MonitorPlay className="w-12 h-12 animate-pulse" />
          </div>
        )}

        {/* Realtime Laser Pointer Overlay */}
        <LaserPointer xPct={pointer.xPct} yPct={pointer.yPct} visible={pointer.visible} />
      </div>
    </div>
  );
}
