const Router = require('express').Router;
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const orderController = require('../controllers/order-controller');
const orderRespondController = require('../controllers/order-respond-controller');
const reviewController = require('../controllers/reviews-controller');

router.post('/:category/createOrder',
    body('title')
        .notEmpty().withMessage('Title must not be empty!'),
    body('price')
        .notEmpty().withMessage('Input a price!'),
    body('client_id')
        .notEmpty().withMessage('client_id is empty'),
    authMiddleware,
    orderController.createOrder
);
router.get('/orders', orderController.getAllOrders);
router.put('/:order_id/editOrder', authMiddleware, orderController.editOrder);
router.delete('/:order_id/deleteOrder', authMiddleware, orderController.deleteOrder);
router.post('/:order_id/createRespond',
    body('description')
        .notEmpty().withMessage('description must not be empty!'),
    body('price')
        .notEmpty().withMessage('Input a price!'),
    body('client_id')
        .notEmpty().withMessage('client_id is empty'),
    authMiddleware,
    orderRespondController.createOrderRespond
);
router.get('/orderResponds', authMiddleware, orderRespondController.getAllOrderResponds);
router.put('/:order_respond_id/editRespond', authMiddleware, orderRespondController.editOrderRespond);
router.post('/:order_respond_id/RespondIsRead', authMiddleware, orderRespondController.setRespondStatusRead);
router.post('/:order_respond_id/RespondIsRejected', authMiddleware, orderRespondController.setRespondStatusRejected);
router.post('/:order_respond_id/RespondIsAccepted', authMiddleware, orderRespondController.setRespondStatusAccepted);
router.delete('/:order_respond_id/deleteOrderRespond', authMiddleware, orderRespondController.deleteOrderRespond);
router.post('/order_id/createReview', authMiddleware, reviewController.createReview);
router.get('/reviews', reviewController.getAllReviews);
router.delete('/review_id/deleteReview', authMiddleware, reviewController.deleteReview);

module.exports = router;