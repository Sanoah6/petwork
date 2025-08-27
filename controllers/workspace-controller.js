const WorkspaceService = require('../service/workspace-service')

class WorkspaceController {
    async getWorkspaceById(req, res, next) {
        const id = req.params.id;
        const userId = req.user.id;

        if(!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ error: 'Не указан ID рабочего пространства' });
        }

        const data = await WorkspaceService.getWorkspaceById(id);

        if (!data || (data.clientId !== userId && data.freelancerId !== userId)) {
            return res.status(403).json({ error: 'Доступ запрещён' })
        }

        res.json(data)
    }
}

module.exports = new WorkspaceController();