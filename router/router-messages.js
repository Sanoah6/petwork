const Router = require('express').Router;
const authMiddleware = require('../middlewares/auth-middleware');
const MessagesController = require('../controllers/messages-controller');
const router = new Router();

router.get('/messages/:roomType/:roomId', authMiddleware, MessagesController.getMessages);

module.exports = router;