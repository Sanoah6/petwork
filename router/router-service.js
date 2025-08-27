const Router = require('express').Router;
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const serviceController = require('../controllers/service-controller');

router.post('/:category/createService',
    body('title')
        .notEmpty().withMessage('Title must not be empty!'),
    body('price')
        .notEmpty().withMessage('Input a price!'),
    body('freelancer_id')
        .notEmpty().withMessage('freelancer_id is empty'),
    body('deliveryTime')
        .notEmpty().withMessage('deliveryTime is empty'),
    authMiddleware,
    serviceController.createService
);
router.get('/services', serviceController.getAllServices);
router.put('/:service_id/editService', authMiddleware, serviceController.editService);
router.delete('/:service_id/deleteService', authMiddleware, serviceController.deleteService);


module.exports = router;