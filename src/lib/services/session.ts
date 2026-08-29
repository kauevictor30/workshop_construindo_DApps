import { db, SessionRecord, SlideRecord, ParticipantRecord } from '../db';
import crypto from 'crypto';
import { DEFAULT_RAW_SLIDES, SlideContent } from '../default-slides';

export type { SlideContent };

export function getOrCreateDefaultSession(): { session: SessionRecord; slides: SlideRecord[] } {
  const existingSession = db.prepare('SELECT * FROM sessions ORDER BY createdAt ASC LIMIT 1').get() as SessionRecord | undefined;

  if (existingSession) {
    const slides = db.prepare('SELECT * FROM slides WHERE sessionId = ? ORDER BY orderIndex ASC').all(existingSession.id) as SlideRecord[];
    return { session: existingSession, slides };
  }

  // Create new Session
  const sessionId = 'web3-ai-workshop-2026';
  const presenterToken = 'pres_secret_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  const session: SessionRecord = {
    id: sessionId,
    title: 'Introdução a Blockchain: Construindo DApps na Web3 com Soroban & Agentes de IA',
    presenterToken,
    status: 'live',
    currentSlide: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO sessions (id, title, presenterToken, status, currentSlide, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(session.id, session.title, session.presenterToken, session.status, session.currentSlide, session.createdAt, session.updatedAt);

  // Default Rich & Didactic Slide Deck Content
  DEFAULT_RAW_SLIDES.forEach((slide, index) => {
    db.prepare(`
      INSERT INTO slides (sessionId, orderIndex, title, content, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, index, slide.title, JSON.stringify(slide.content), slide.notes || '');
  });

  const createdSlides = db.prepare('SELECT * FROM slides WHERE sessionId = ? ORDER BY orderIndex ASC').all(sessionId) as SlideRecord[];
  return { session, slides: createdSlides };
}

export function getSession(sessionId: string): { session: SessionRecord | null; slides: SlideRecord[] } {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRecord | undefined;
  if (!session) return { session: null, slides: [] };
  const slides = db.prepare('SELECT * FROM slides WHERE sessionId = ? ORDER BY orderIndex ASC').all(sessionId) as SlideRecord[];
  return { session, slides };
}

export function addParticipant(sessionId: string, name: string, email: string, consentLgpd: boolean): ParticipantRecord {
  const existing = db.prepare('SELECT * FROM participants WHERE sessionId = ? AND email = ?').get(sessionId, email) as ParticipantRecord | undefined;
  if (existing) {
    db.prepare('UPDATE participants SET name = ?, consentLgpd = ? WHERE id = ?').run(name, consentLgpd ? 1 : 0, existing.id);
    return { ...existing, name, consentLgpd: consentLgpd ? 1 : 0 };
  }

  const id = 'part_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO participants (id, sessionId, name, email, consentLgpd, joinedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, sessionId, name, email, consentLgpd ? 1 : 0, now);

  return { id, sessionId, name, email, consentLgpd: consentLgpd ? 1 : 0, joinedAt: now };
}

export function updateSessionSlide(sessionId: string, slideIndex: number): boolean {
  const result = db.prepare('UPDATE sessions SET currentSlide = ?, updatedAt = ? WHERE id = ?').run(slideIndex, new Date().toISOString(), sessionId);
  return result.changes > 0;
}

export function updateSessionStatus(sessionId: string, status: 'live' | 'ended'): boolean {
  const result = db.prepare('UPDATE sessions SET status = ?, updatedAt = ? WHERE id = ?').run(status, new Date().toISOString(), sessionId);
  return result.changes > 0;
}

export function getParticipants(sessionId: string): ParticipantRecord[] {
  return db.prepare('SELECT * FROM participants WHERE sessionId = ? ORDER BY joinedAt DESC').all(sessionId) as ParticipantRecord[];
}
