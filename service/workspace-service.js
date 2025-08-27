const WorkspaceModel = require('../models/workspace-model');
const WorkspaceDto = require('../dtos/workspace-dto');
const uuid = require('uuid');

class WorkspaceService {
    async createWorkspace(workspaceData) {
        workspaceData = {
            workspaceId: uuid.v4(),
            workspaceStatus: 'discussion',
            ...workspaceData
        }
        const newWorkspace = await WorkspaceModel.createWorkspace(workspaceData);
        return newWorkspace;
    }

    async getWorkspaceById(workspaceId) {
        const workspace = await WorkspaceModel.getWorkspaceById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        const workspaceDto = new WorkspaceDto(workspace)
        return {...workspaceDto};
    }
}

module.exports = new WorkspaceService();