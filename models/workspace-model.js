require('dotenv').config();
const pool = require('../config/db')

const createWorkspace = async (workspaceData) => {
    try {
        const result = await pool.query(
            `INSERT INTO "workspaces" (w_id, w_order_id, w_respond_id, w_client_id, w_freelancer_id, w_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [workspaceData.workspaceId, workspaceData.order_id,  workspaceData.respond_id, workspaceData.client_id, workspaceData.freelancer_id, workspaceData.workspaceStatus]
        )
        return result.rows[0];
    } catch (e) {
        console.log(e);
    }
}

const getWorkspaceById = async (workspaceId, userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                w.*,
                o.o_title, o.o_description, o.o_price, o.o_deadline
                FROM "workspaces" w
                JOIN orders o ON w.w_order_id = o.o_id
                WHERE w_id = $1`, [workspaceId]
        );
        return result.rows[0];
    } catch (e) {
        console.log(e);
    }
}

module.exports = { getWorkspaceById, createWorkspace };