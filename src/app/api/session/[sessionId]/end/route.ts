import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionStatus, getParticipants } from '@/lib/services/session';
import { sendWorkshopMaterialEmail } from '@/lib/services/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { presenterToken } = body;

    const { session, slides } = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    if (!presenterToken || presenterToken !== session.presenterToken) {
      return NextResponse.json({ error: 'Acesso negado: token de instrutor inválido' }, { status: 403 });
    }

    updateSessionStatus(sessionId, 'ended');
    const participants = getParticipants(sessionId);

    // Trigger emails in background
    Promise.all(participants.map((p) => sendWorkshopMaterialEmail(p, session, slides.length))).catch((e) =>
      console.error('Email error:', e)
    );

    return NextResponse.json({
      success: true,
      message: 'Sessão encerrada com sucesso! E-mails em fila de disparo.',
      participantCount: participants.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao encerrar sessão' }, { status: 500 });
  }
}
