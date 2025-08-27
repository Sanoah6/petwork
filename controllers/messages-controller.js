const messagesService = require('../service/messages-service');
const ApiError = require('../exceptions/api-error');

class MessagesController{
    async getMessages(req, res, next) {
        try {
            const roomType = req.params.roomType;
            const roomId = req.params.roomId;
            const messages = await messagesService.getMessages(roomType, roomId);
            return res.json(messages);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new MessagesController();