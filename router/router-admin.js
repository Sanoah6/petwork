const Router = require('express').Router;
const router = new Router();
require('dotenv').config();
const pool = require('../config/db');
const adminController = require('../controllers/admin-controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.get('/orders/count', authMiddleware, adminController.getOrdersQuantity)

module.exports = router;