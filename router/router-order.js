const Router = require('express').Router;
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const orderController = require('../controllers/order-controller');
const orderRespondController = require('../controllers/order-respond-controller');

router.post('/:category/create-order',
    body('title')
        .notEmpty().withMessage('Title must not be empty!'),
    body('price')
        .notEmpty().withMessage('Input a price!'),
    body('client_id')
        .notEmpty().withMessage('client_id is empty'),
    authMiddleware,
    orderController.createOrder
);
router.get('/:category/orders', orderController.getAllOrders);
router.get('/orders', orderController.getAllOrders);
router.post('/:category/:order-id/editOrder', authMiddleware, orderController.editOrder);
router.post('/:category/:order-id/createRespond',
    body('title')
        .notEmpty().withMessage('Title must not be empty!'),
    body('price')
        .notEmpty().withMessage('Input a price!'),
    body('client_id')
        .notEmpty().withMessage('client_id is empty'),
    authMiddleware,
    orderRespondController.createOrderRespond
);
router.get('/:order-id/orderResponds', orderRespondController.getAllOrderResponds);

module.exports = router;