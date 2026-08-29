import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'livedeck.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
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
