require('dotenv').config();
const pool = require('../config/db');

const getMessages = async (roomType, roomId) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE m_room_type = $1 AND m_room_id = $2 ORDER BY m_id ASC',
        [roomType, roomId]
    );
    return result.rows;
};

module.exports = { getMessages };