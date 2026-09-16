const jwt = require('jsonwebtoken');

const setupGameSocket = (io) => {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.coupleId = decoded.coupleId;
      socket.partnerName = decoded.partnerName;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const roomId = `couple-${socket.coupleId}`;
    socket.join(roomId);

    console.log(`💑 ${socket.partnerName} joined room ${roomId}`);

    // Notify partner that someone connected
    socket.to(roomId).emit('partner-connected', {
      partner: socket.partnerName,
      timestamp: new Date().toISOString(),
    });

    // Mode change — sync across devices
    socket.on('mode-change', (data) => {
      socket.to(roomId).emit('mode-changed', {
        mode: data.mode,
        changedBy: socket.partnerName,
      });
    });

    // Truth or Dare — spin wheel
    socket.on('spin-wheel', (data) => {
      socket.to(roomId).emit('wheel-spinning', {
        ...data,
        spunBy: socket.partnerName,
      });
    });

    socket.on('spin-result', (data) => {
      socket.to(roomId).emit('spin-result', {
        ...data,
        spunBy: socket.partnerName,
      });
    });

    // Would You Rather — card pick
    socket.on('card-pick', (data) => {
      socket.to(roomId).emit('card-picked', {
        ...data,
        pickedBy: socket.partnerName,
      });
    });

    // Personal Q&A — send/receive questions
    socket.on('send-question', (data) => {
      socket.to(roomId).emit('receive-question', {
        ...data,
        sentBy: socket.partnerName,
      });
    });

    socket.on('send-answer', (data) => {
      socket.to(roomId).emit('receive-answer', {
        ...data,
        answeredBy: socket.partnerName,
      });
    });

    // Quiz — score update
    socket.on('quiz-score', (data) => {
      socket.to(roomId).emit('quiz-score-update', {
        ...data,
        partner: socket.partnerName,
      });
    });

    // Coupons — redeem notification
    socket.on('redeem-coupon', (data) => {
      socket.to(roomId).emit('coupon-redeemed', {
        ...data,
        redeemedBy: socket.partnerName,
      });
    });

    // Game navigation — sync which game is open
    socket.on('open-game', (data) => {
      socket.to(roomId).emit('game-opened', {
        ...data,
        openedBy: socket.partnerName,
      });
    });

    socket.on('disconnect', () => {
      console.log(`💔 ${socket.partnerName} left room ${roomId}`);
      socket.to(roomId).emit('partner-disconnected', {
        partner: socket.partnerName,
      });
    });
  });
};

module.exports = setupGameSocket;
