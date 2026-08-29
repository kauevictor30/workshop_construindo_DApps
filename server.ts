import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';
import { getOrCreateDefaultSession, getSession, updateSessionSlide, updateSessionStatus, getParticipants, addParticipant } from './src/lib/services/session';
import { sendWorkshopMaterialEmail } from './src/lib/services/email';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  // Ensure default session & slides exist in DB
  const { session: defaultSession } = getOrCreateDefaultSession();
  console.log(`[LiveDeck DB Initialized] Session ID: ${defaultSession.id}`);
  console.log(`[Presenter Secret Token]: ${defaultSession.presenterToken}`);

  const expressApp = express();
  const httpServer = createServer(expressApp);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Track room counts
  const roomParticipantCounts: Record<string, number> = {};

  io.on('connection', (socket) => {
    let currentRoomId: string | null = null;
    let isPresenter = false;

    // Student / Viewer or Presenter joining a session room
    socket.on('join:room', ({ sessionId, token, participantInfo }) => {
      currentRoomId = sessionId;
      socket.join(sessionId);

      const { session, slides } = getSession(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Sessão não encontrada' });
        return;
      }

      // Check if user is presenter
      if (token && token === session.presenterToken) {
        isPresenter = true;
        socket.emit('auth:success', { role: 'presenter' });
      } else {
        // Save participant if info provided
        if (participantInfo && participantInfo.name && participantInfo.email) {
          addParticipant(sessionId, participantInfo.name, participantInfo.email, participantInfo.consent ?? true);
        }
      }

      // Count active room sockets
      const clientCount = io.sockets.adapter.rooms.get(sessionId)?.size || 0;
      roomParticipantCounts[sessionId] = clientCount;

      // Send initial state to joining client
      socket.emit('slide:sync', {
        currentSlide: session.currentSlide,
        totalSlides: slides.length,
        status: session.status,
      });

      // Broadcast updated count to room (especially for presenter panel RF-12)
      io.to(sessionId).emit('room:stats', {
        connectedCount: clientCount,
        participantsList: isPresenter ? getParticipants(sessionId) : undefined,
      });

      console.log(`[Socket] Client ${socket.id} joined room ${sessionId}. Total active: ${clientCount}`);
    });

    // SERVER-SIDE AUTHORIZATION FOR SLIDE NAVIGATION (RF-04)
    socket.on('slide:navigate', ({ sessionId, token, targetSlide }) => {
      const { session, slides } = getSession(sessionId);
      if (!session) return;

      // SECURITY CHECK: Reject if not presenter token
      if (!token || token !== session.presenterToken) {
        console.warn(`[SECURITY ALERT] Unauthorized slide navigation attempt from socket ${socket.id}`);
        socket.emit('error:unauthorized', { message: 'Apenas o instrutor pode navegar nos slides.' });
        return;
      }

      if (targetSlide < 0 || targetSlide >= slides.length) return;

      // Update source of truth in DB (RF-05)
      updateSessionSlide(sessionId, targetSlide);

      // Broadcast synced state to everyone in session
      io.to(sessionId).emit('slide:sync', {
        currentSlide: targetSlide,
        totalSlides: slides.length,
        status: session.status,
      });
    });

    // SERVER-SIDE AUTHORIZATION FOR POINTER MOVEMENT (RF-06 & RF-07)
    socket.on('pointer:update', ({ sessionId, token, xPct, yPct, visible }) => {
      const { session } = getSession(sessionId);
      if (!session) return;

      // SECURITY CHECK: Only presenter can move pointer
      if (!token || token !== session.presenterToken) {
        return; // Silently ignore unauthorized pointer attempts
      }

      // Broadcast normalized relative pointer to all connected viewers in room
      socket.to(sessionId).emit('pointer:move', {
        xPct,
        yPct,
        visible,
      });
    });

    // SERVER-SIDE AUTHORIZATION FOR SESSION END (RF-09 & US-04)
    socket.on('session:end', async ({ sessionId, token }) => {
      const { session, slides } = getSession(sessionId);
      if (!session) return;

      // SECURITY CHECK
      if (!token || token !== session.presenterToken) {
        socket.emit('error:unauthorized', { message: 'Apenas o instrutor pode encerrar a sessão.' });
        return;
      }

      // Update status in DB
      updateSessionStatus(sessionId, 'ended');

      // Broadcast session ended event
      io.to(sessionId).emit('session:ended', {
        message: 'A sessão foi encerrada pelo instrutor. O material foi enviado para o seu e-mail!',
      });

      // Dispatch emails in background to all participants
      const participants = getParticipants(sessionId);
      console.log(`[Session End] Triggering email dispatch to ${participants.length} registered participants...`);

      // Fire & forget background promises
      Promise.all(participants.map((p) => sendWorkshopMaterialEmail(p, session, slides.length)))
        .then((results) => {
          console.log(`[Session End] All ${results.length} email dispatch tasks completed.`);
        })
        .catch((err) => {
          console.error(`[Session End] Email dispatch error:`, err);
        });
    });

    socket.on('disconnect', () => {
      if (currentRoomId) {
        const clientCount = io.sockets.adapter.rooms.get(currentRoomId)?.size || 0;
        roomParticipantCounts[currentRoomId] = clientCount;

        io.to(currentRoomId).emit('room:stats', {
          connectedCount: clientCount,
          participantsList: getParticipants(currentRoomId),
        });
      }
    });
  });

  // Handle all HTTP Requests via Next.js
  expressApp.use((req: express.Request, res: express.Response) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> LiveDeck Server ready on http://localhost:${port}`);
  });
});
