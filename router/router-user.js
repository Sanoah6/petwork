const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/registration', 
    body('name')
        .notEmpty().withMessage('Input username')
        .isLength({min: 3, max: 40}).withMessage('username must have length between 3 and 40 symbols')
        .toLowerCase(),
    body('email')
        .isEmail().withMessage('Incorrect format of email')
        .notEmpty().withMessage('input email')
        .toLowerCase(),
    body('password')
        .notEmpty().withMessage('Input password!')
        .isLength({min: 8, max: 32}).withMessage('password must have length between 8 and 32 symbols')
        .matches(/^[A-Za-z0-9!@#$%^&*()_+={}[\]:;"'<>,.?\/-]+$/).withMessage('The password must contain only Latin letters, numbers and special characters'),
    userController.registration
);
router.post('/login', body('email').toLowerCase(), userController.login);
router.post('/logout', userController.logout);
router.put('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserInfoById);
router.post('/forgotPassword', userController.forgotPassword);
router.put('/forgotPassword/:link', userController.changePassword);
router.put('/:user_id/edit', authMiddleware, userController.editProfile);
router.delete('/delete', authMiddleware, userController.sendDeleteEmail);
router.delete('/delete/:link', userController.deleteUser);

module.exports = router;