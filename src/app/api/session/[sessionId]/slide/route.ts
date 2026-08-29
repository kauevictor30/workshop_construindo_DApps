import { NextRequest, NextResponse } from 'next/server';
import { updateSessionSlide, getSession } from '@/lib/services/session';

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a04ccf2d01a04efd79720d1b';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { slideIndex, token } = body;

    const { session } = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    // Verify presenter token
    if (session.presenterToken && token !== session.presenterToken) {
      return NextResponse.json({ error: 'Token de apresentador inválido' }, { status: 401 });
    }

    if (typeof slideIndex !== 'number') {
      return NextResponse.json({ error: 'slideIndex inválido' }, { status: 400 });
    }

    const updated = updateSessionSlide(sessionId, slideIndex);

    // Sync to global persistent cloud store for Vercel lambdas
    try {
      await fetch(CLOUD_SYNC_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'livedeck-web3-ai-workshop-2026',
          data: {
            currentSlide: slideIndex,
            status: session.status || 'live',
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    } catch (e) {
      console.warn('[API Slide] Failed to push cloud sync state:', e);
    }

    return NextResponse.json({ success: updated, currentSlide: slideIndex });
  } catch (error: any) {
    console.error('[API Slide Update Error]:', error);
    return NextResponse.json({ error: 'Falha ao atualizar slide' }, { status: 500 });
  }
}
