import { NextRequest, NextResponse } from 'next/server';
import { getSession, getOrCreateDefaultSession } from '@/lib/services/session';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let { session, slides } = getSession(sessionId);

  if (!session) {
    const defaultData = getOrCreateDefaultSession();
    session = defaultData.session;
    slides = defaultData.slides;
  }

  if (!session) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
  }

  const joinUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'}/join/${session.id}`;
  let qrCodeDataUrl = '';

  try {
    qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
      margin: 2,
      width: 320,
      color: {
        dark: '#4f46e5',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR Code error:', err);
  }

  const parsedSlides = slides.map((s) => ({
    ...s,
    content: JSON.parse(s.content),
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      status: session.status,
      currentSlide: session.currentSlide,
    },
    slides: parsedSlides,
    qrCodeDataUrl,
    joinUrl,
  });
}
