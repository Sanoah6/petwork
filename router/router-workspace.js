const Router = require('express').Router;
const WorkspaceController = require('../controllers/workspace-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');

router.get('/workspace/:id', authMiddleware, WorkspaceController.getWorkspaceById);

module.exports = router;