import { NextRequest, NextResponse } from 'next/server';
import { updateSessionSlide, getSession } from '@/lib/services/session';

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
    return NextResponse.json({ success: updated, currentSlide: slideIndex });
  } catch (error: any) {
    console.error('[API Slide Update Error]:', error);
    return NextResponse.json({ error: 'Falha ao atualizar slide' }, { status: 500 });
  }
}
