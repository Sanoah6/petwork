require('dotenv').config();
const pool = require('../config/db');

const createOrderRespond = async (order_id, description, price, client_id, deadline) => {
	try {
		const result = await pool.query(`INSERT INTO "order_responds" (or_order_id, or_respond_description, or_price, or_freelancer_id, or_deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [order_id, description, price, client_id, deadline]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const checkFirstRespond = async (client_id, order_id) => {
    try{
        const result = await pool.query(`SELECT "or_id" FROM "order_responds" WHERE "or_freelancer_id" = $1 AND "or_order_id" = $2`, [client_id, order_id]);
        if (result.rows[0] !== undefined){
          return true;
        }
        else {
          return false
        }
    }catch(e){
        console.log(e);
    }
}

const getOrderRespondByRespondId = async (respond_id) => {
	try {
		const result = await pool.query(`SELECT * FROM "order_responds" WHERE "or_id" = $1`, [respond_id]);
		return result.rows[0];
	} catch (e){
		console.log(e)
	}
}

const checkMounthLimit = async (client_id) => {
    try{
        const result = await pool.query(`SELECT COUNT(*) FROM "order_responds" WHERE "or_freelancer_id" = $1 AND "or_created_at" >= DATE_TRUNC('month', CURRENT_DATE) AND "or_created_at" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')`, [client_id]);
        if (+(result.rows[0].count) > 15){
            return { status: true, availableNumberOfResponds: 15 - +(result.rows[0].count) };
        }
        else return { status: false, availableNumberOfResponds: 15 - +(result.rows[0].count) };
    }catch(e){
        console.log(e);
    }
}

const rejectAnotherResponds = async (orderId, respondId) => {
    try{
        await pool.query(`UPDATE order_responds SET or_status = 'rejected' WHERE or_order_id = $1 AND or_id != $2`, [orderId, respondId]);
        return "All another responds rejected"
    }catch(e){
        console.log(e);
    }
}

const getAllOrderResponds = async (id, deadline, sortBy, min, max, orderId, freelancerId) => {
    try{
        let query = `
            SELECT 
                order_responds.*,
                users.u_name, users.u_rating,
                workspaces.w_id AS or_workspace_id
            FROM "order_responds" 
            JOIN users ON order_responds.or_freelancer_id = users.u_id
            LEFT JOIN workspaces ON order_responds.or_id = workspaces.w_respond_id
            WHERE 1=1
            `;
        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND "or_id" = $${++indexParam}`;
            queryParams.push(id);
        }

        if (deadline){
            query += ` AND "or_deadline" <= $${++indexParam}`;
            queryParams.push(deadline);
        }

        if (min){
            query += ` AND "or_price" >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND "or_price" <= $${++indexParam}`;
            queryParams.push(max);
        }
        
        if(orderId){
            query += ` AND "or_order_id" = $${++indexParam}`;
            queryParams.push(orderId);
        }

        if(freelancerId){
            query += ` AND or_freelancer_id = $${++indexParam}`;
            queryParams.push(freelancerId);
        }

        if (sortBy === "price"){
            query += ` ORDER BY "or_price" ASC`;
        }

        if (sortBy === "-price"){
            query += ` ORDER BY "or_price" DESC`;
        }

        if (!sortBy) {
            query += ` ORDER BY or_created_at DESC`
        }

        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (e){
        console.log(e);
    }
}

const editDeadline = async (deadline, currentUserId, respond_id) => {
    try{
        const result = await pool.query(`UPDATE "order_responds" SET "or_deadline" = $1 WHERE "or_freelancer_id" = $2 AND "or_id" = $3 RETURNING or_deadline`, [deadline, currentUserId, respond_id]);
        return result.rows[0].or_deadline;
        } catch(e){
        console.log(e);
    }
}

const editDescription = async (description, currentUserId, respond_id) => {
    try{
        const result = await pool.query(`UPDATE "order_responds" SET "or_respond_description" = $1 WHERE "or_freelancer_id" = $2 AND "or_id" = $3 RETURNING or_respond_description`, [description, currentUserId, respond_id]);
        return result.rows[0].or_respond_description;
		} catch(e){
        console.log(e);
    }
}

const editPrice = async (price, currentUserId, respond_id) => {
    try{
        const result = await pool.query(`UPDATE "order_responds" SET "or_price" = $1 WHERE "or_freelancer_id" = $2 AND "or_id" = $3 RETURNING or_price`, [price, currentUserId, respond_id]);
		return result.rows[0].or_price;
	} catch(e){
        console.log(e);
    }
}

const getOrderRespondByRespondIdForSetStatus = async (respond_id) => {
	try {
		const result = await pool.query(`SELECT r.*, o.o_client_id FROM order_responds r JOIN orders o ON r.or_order_id = o.o_id WHERE r.or_id = $1`, [respond_id]);
		return result.rows[0];
	} catch (e){
		console.log(e)
	}
}

const setRespondStatusRead = async (respondId) => {
    try{
        const result = await pool.query(`UPDATE order_responds SET "or_status" = 'read' WHERE "or_id" = $1 RETURNING *`, [respondId]);
        return result.rows[0];
    }catch(e){
        console.log(e);
    }
}

const setRespondStatusRejected = async (respondId) => {
    try{
        const result = await pool.query(`UPDATE order_responds SET "or_status" = 'rejected' WHERE "or_id" = $1 RETURNING *`, [respondId]);
        return result.rows[0];
    }catch(e){
        console.log(e);
    }
}

const setRespondStatusAccepted = async (respondId) => {
    try{
        const result = await pool.query(`UPDATE order_responds SET "or_status" = 'accepted' WHERE "or_id" = $1 RETURNING *`, [respondId]);
        return result.rows[0];
    }catch(e){
        console.log(e);
    }
}

const getRespondByOrderId = async (orderId) => {
    try{
        const result = await pool.query(`SELECT * FROM order_responds WHERE or_order_id = $1 AND or_status = 'accepted`, [orderId]);
        return result.rows[0];
    }catch(e){
        console.log(e);
    }
}

const deleteAllRespondsOnOrder = async (orderId) => {
    try{
        const deleteAllResponds = await pool.query(`DELETE FROM "order_responds" WHERE or_order_id = $1`, [orderId]);
        return "Responds deleted"
    }catch(e){
        console.log(e);
    }
}

const deleteOrderRespond = async (respondId) => {
    try{
        const deleteRespond = await pool.query(`DELETE FROM "order_responds" WHERE or_id = $1`, [respondId]);
        return deleteRespond.rows[0];
    } catch(e){
        console.log(e);
    }
}


module.exports = {createOrderRespond, getAllOrderResponds, getRespondByOrderId, rejectAnotherResponds, setRespondStatusRejected, setRespondStatusAccepted, getOrderRespondByRespondIdForSetStatus, setRespondStatusRead, checkFirstRespond, checkMounthLimit, getOrderRespondByRespondId, editDeadline, editDescription, editPrice, deleteAllRespondsOnOrder, deleteOrderRespond}