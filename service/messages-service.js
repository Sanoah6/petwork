const MessagesModel = require('../models/messages-model');
const ApiError = require('../exceptions/api-error');

class MessagesService{
    async getMessages(roomType, roomId) {
        if (!roomType || !roomId) {
            throw ApiError.BadRequest('Room type and room ID are required');
        }

        const messages = await MessagesModel.getMessages(roomType, roomId);
        if (!messages) {
            return [];
        }

        return messages
    }
}

module.exports = new MessagesService();