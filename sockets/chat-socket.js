require('dotenv').config();
const pool = require('../config/db');

module.exports = async (io) => {
  const result = await pool.query('SELECT u_id, u_last_time_seen FROM users');
  const usersStatus = {};

  result.rows.forEach(user => {
    usersStatus[user.u_id] = {
      status: 'offline',
      lastSeen: user.u_last_time_seen,
      socketIds: []
    };
  });

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('user-online', async (userId) => {
      let lastSeen = null
      if (!usersStatus[userId]) {
        const result = await pool.query(`SELECT u_last_time_seen FROM users WHERE u_id = $1`, [userId])
        lastSeen = result.rows[0]?.u_last_time_seen || null
        usersStatus[userId] = { status: 'online', lastSeen: lastSeen, socketIds: [] };
      } else {
        usersStatus[userId].status = 'online'
        lastSeen = usersStatus[userId].lastSeen
      }
      usersStatus[userId].socketIds.push(socket.id);
      io.emit('update-online-status', { userId: userId, status: 'online', lastSeen: lastSeen });
      socket.emit('all-users-status', usersStatus);
      console.log(`${userId} is now Online`)
      console.log(usersStatus)
    });

    socket.on('join-room', (name, roomType, roomId) => {
      socket.join(roomId);

      console.log(`${name} has joined the room: ${roomType} - ${roomId}`);
    });

    socket.on('chat:message', async ({ roomType, roomId, senderId, senderType, text, files }) => {
      const result = await pool.query(
        `INSERT INTO messages (m_room_type, m_room_id, m_sender_id, m_sender_type, m_text, m_files)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [roomType, roomId, senderId, senderType, text || null, JSON.stringify(files || [])]
      );


      const message = result.rows[0];
      socket.broadcast.to(roomId).emit('chat:message', message);
      console.log(`${senderId} sended a message ${text} to ${roomType} ${roomId}`)
    });

    socket.on('user-offline', async (userId) => {
      if (usersStatus[userId]) {
        usersStatus[userId].status = 'offline';
        const lastSeen = new Date();
        usersStatus[userId].lastSeen = lastSeen;
        usersStatus[userId].socketIds = usersStatus[userId].socketIds.filter(id => id !== socket.id);
        await pool.query(`UPDATE users SET u_last_time_seen = $1 WHERE u_id = $2`, [lastSeen, userId]);
        io.emit('update-online-status', { userId, status: 'offline', lastSeen });
        console.log(`${userId} is now offline (user-offline event), last time seen - ${lastSeen}`);
      }
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected', socket.id);

      const userId = Object.keys(usersStatus).find(key => usersStatus[key].socketIds.includes(socket.id));
      if (userId) {
        usersStatus[userId].socketIds = usersStatus[userId].socketIds.filter(id => id !== socket.id);
        if (usersStatus[userId].socketIds.length === 0) {
          usersStatus[userId].status = 'offline';
          const lastSeen = new Date();
          usersStatus[userId].lastSeen = lastSeen
          await pool.query(`UPDATE users SET u_last_time_seen = $1 WHERE u_id = $2`, [lastSeen, userId])
          io.emit('update-online-status', { userId, status: 'offline', lastSeen: usersStatus[userId].lastSeen });
          console.log(`${userId} is now offline, last time seen - ${lastSeen}`)
        }
      }
      console.log(usersStatus)
    });
  });
};