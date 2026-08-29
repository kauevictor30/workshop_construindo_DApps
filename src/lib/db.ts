import path from 'path';
import fs from 'fs';

export interface SessionRecord {
  id: string;
  title: string;
  presenterToken: string;
  status: 'draft' | 'live' | 'ended';
  currentSlide: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantRecord {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  consentLgpd: number;
  joinedAt: string;
}

export interface SlideRecord {
  id: string;
  sessionId: string;
  orderIndex: number;
  title: string;
  content: string; // JSON string
  notes?: string;
}

interface DbStatement {
  get: (...params: any[]) => any;
  all: (...params: any[]) => any[];
  run: (...params: any[]) => { changes: number };
}

interface DbInterface {
  prepare: (sql: string) => DbStatement;
  exec: (sql: string) => void;
}

function createDb(): DbInterface {
  let sqliteDb: any = null;

  try {
    const Database = require('better-sqlite3');
    // On Vercel/serverless environments, use /tmp directory which is writable
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
    const targetDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const dbPath = path.join(targetDir, 'livedeck.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        presenterToken TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'live',
        currentSlide INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        consentLgpd INTEGER NOT NULL DEFAULT 1,
        joinedAt TEXT NOT NULL,
        UNIQUE(sessionId, email),
        FOREIGN KEY(sessionId) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS slides (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        orderIndex INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY(sessionId) REFERENCES sessions(id) ON DELETE CASCADE
      );
    `);

    return sqliteDb;
  } catch (err) {
    console.warn('[LiveDeck DB] Falling back to resilient in-memory storage:', err);

    // In-memory fallback tables
    const sessionsMap = new Map<string, SessionRecord>();
    const slidesList: SlideRecord[] = [];
    const participantsList: ParticipantRecord[] = [];

    return {
      exec: () => {},
      prepare: (sql: string): DbStatement => {
        const normalized = sql.trim().toLowerCase();

        return {
          get: (...params: any[]) => {
            if (normalized.includes('from sessions')) {
              if (params.length > 0) {
                return sessionsMap.get(params[0]);
              }
              return Array.from(sessionsMap.values())[0];
            }
            if (normalized.includes('from slides')) {
              if (normalized.includes('where sessionid = ?')) {
                return slidesList.find((s) => s.sessionId === params[0]);
              }
            }
            if (normalized.includes('from participants')) {
              return participantsList.find((p) => p.sessionId === params[0] && p.email === params[1]);
            }
            return undefined;
          },
          all: (...params: any[]) => {
            if (normalized.includes('from slides')) {
              const sessionId = params[0];
              return slidesList
                .filter((s) => s.sessionId === sessionId)
                .sort((a, b) => a.orderIndex - b.orderIndex);
            }
            if (normalized.includes('from participants')) {
              const sessionId = params[0];
              return participantsList.filter((p) => p.sessionId === sessionId);
            }
            return [];
          },
          run: (...params: any[]) => {
            if (normalized.includes('insert into sessions')) {
              const [id, title, presenterToken, status, currentSlide, createdAt, updatedAt] = params;
              sessionsMap.set(id, { id, title, presenterToken, status, currentSlide, createdAt, updatedAt });
              return { changes: 1 };
            }
            if (normalized.includes('insert into slides')) {
              const [sessionId, orderIndex, title, content, notes] = params;
              const id = `slide_${orderIndex}_${Math.random().toString(36).substring(2, 6)}`;
              slidesList.push({ id, sessionId, orderIndex, title, content, notes });
              return { changes: 1 };
            }
            if (normalized.includes('insert into participants')) {
              const [id, sessionId, name, email, consentLgpd, joinedAt] = params;
              participantsList.push({ id, sessionId, name, email, consentLgpd, joinedAt });
              return { changes: 1 };
            }
            if (normalized.includes('update sessions set currentslide')) {
              const [slideIndex, updatedAt, sessionId] = params;
              const s = sessionsMap.get(sessionId);
              if (s) {
                s.currentSlide = slideIndex;
                s.updatedAt = updatedAt;
                return { changes: 1 };
              }
            }
            if (normalized.includes('update sessions set status')) {
              const [status, updatedAt, sessionId] = params;
              const s = sessionsMap.get(sessionId);
              if (s) {
                s.status = status;
                s.updatedAt = updatedAt;
                return { changes: 1 };
              }
            }
            if (normalized.includes('update participants')) {
              const [name, consentLgpd, id] = params;
              const p = participantsList.find((item) => item.id === id);
              if (p) {
                p.name = name;
                p.consentLgpd = consentLgpd;
                return { changes: 1 };
              }
            }
            return { changes: 0 };
          },
        };
      },
    };
  }
}

export const db: DbInterface = createDb();
