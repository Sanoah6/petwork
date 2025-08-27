const Router = require('express').Router;
const PaymentController = require('../controllers/payment-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/payment', PaymentController.createPayment) // 2202474301322987 12 31 123 - тестовая карта
router.post('/payment/notifications', PaymentController.paymentNotification)
router.put('/topUpBalance', PaymentController.topUpBalance)
router.put('/withdrawBalance', PaymentController.withdrawBalance)

module.exports = router;