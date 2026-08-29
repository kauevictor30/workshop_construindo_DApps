import { NextRequest, NextResponse } from 'next/server';
import { addParticipant, getSession } from '@/lib/services/session';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { name, email, consentLgpd } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome inválido. Informe seu nome completo.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'E-mail inválido. Por favor forneça um e-mail válido.' }, { status: 400 });
    }

    if (!consentLgpd) {
      return NextResponse.json({ error: 'É necessário concordar com os termos de consentimento LGPD.' }, { status: 400 });
    }

    const { session } = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
    }

    if (session.status === 'ended') {
      return NextResponse.json({ error: 'Esta sessão de workshop já foi encerrada.' }, { status: 400 });
    }

    const participant = addParticipant(sessionId, name.trim(), email.trim().toLowerCase(), true);

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao registrar participante' }, { status: 500 });
  }
}
