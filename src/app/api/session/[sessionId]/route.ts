import { NextRequest, NextResponse } from 'next/server';
import { getSession, getOrCreateDefaultSession } from '@/lib/services/session';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a04ccf2d01a04efd79720d1b';

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
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

    // Try fetching latest cloud slide state for multi-instance serverless sync
    try {
      const cloudRes = await fetch(CLOUD_SYNC_URL, { cache: 'no-store' });
      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (typeof cloudData?.data?.currentSlide === 'number') {
          session.currentSlide = cloudData.data.currentSlide;
        }
        if (cloudData?.data?.status) {
          session.status = cloudData.data.status;
        }
      }
    } catch (e) {
      console.warn('[API Session] Could not fetch cloud sync state:', e);
    }

    // Determine absolute dynamic base URL (Vercel / custom domain friendly)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const rawProto = req.headers.get('x-forwarded-proto');
    const protocol = rawProto ? rawProto.split(',')[0] : (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `${protocol}://${host}`;
    
    const joinUrl = `${baseUrl}/join/${session.id}`;
    let qrCodeDataUrl = '';

    try {
      qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
        margin: 2,
        width: 360,
        color: {
          dark: '#4f46e5',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('[API Session] QR Code generation error:', err);
    }

    const parsedSlides = slides.map((s) => ({
      ...s,
      content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
    }));

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        currentSlide: session.currentSlide,
        presenterToken: session.presenterToken,
      },
      slides: parsedSlides,
      qrCodeDataUrl,
      joinUrl,
    });
  } catch (error: any) {
    console.error('[API Session Route Error]:', error);
    
    // Emergency Fallback response so frontend never crashes
    const defaultData = getOrCreateDefaultSession();
    const host = req.headers.get('host') || 'worrkshop-blockchain-vks.vercel.app';
    const joinUrl = `https://${host}/join/${defaultData.session.id}`;

    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(joinUrl, { margin: 2, width: 360, color: { dark: '#4f46e5', light: '#ffffff' } });
    } catch (e) {}

    return NextResponse.json({
      session: defaultData.session,
      slides: defaultData.slides.map((s) => ({ ...s, content: JSON.parse(s.content) })),
      qrCodeDataUrl,
      joinUrl,
    });
  }
}
