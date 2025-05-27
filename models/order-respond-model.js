require('dotenv').config();
const pool = require('../config/db');

const createOrderRespond = async (order_id, description, price, client_id, deadline) => {
	try {
		const result = await pool.query(`INSERT INTO "order_responds" (or_order_id, or_description, or_price, or_freelancer_id, or_deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [order_id, description, price, client_id, deadline]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const checkFirstRespond = async (client_id, order_id) => {
    try{
        const result = await pool.query(`SELECT "or_id" FROM "order_responds" WHERE "or_freelancer_id" = $1 AND "or_order_id" = $2`, [client_id, order_id]);
        if (result >= 0){
            return true;
        }
        else return false;
    }catch(e){
        console.log(e);
    }
}

const checkMounthLimit = async (client_id) => {
    try{
        const result = await pool.query(`SELECT COUNT(*) FROM "order_responds" WHERE "or_freelancer_id" = $1 AND "or_created_at" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND "or_created_at" < DATE_TRUNC('month', CURRENT_DATE)`, [client_id]);
        if (result > 15){
            return true;
        }
        else return false;
    }catch(e){
        console.log(e);
    }
}

const getAllOrderResponds = async (id, deadline, sortBy, min, max, order_id) => {
    try{
        let query = `SELECT * FROM "order_responds" WHERE 1=1`;
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
        
        if(order_id){
        query += ` AND "or_order_id" = $1 $${++indexParam}`;
        queryParams.push(order_id);
        }

        if (sortBy === "price"){
            query += ` ORDER BY "o_price" ASC`;
        }

        if (sortBy === "-price"){
            query += ` ORDER BY "o_price" DESC`;
        }

        

        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (e){
        console.log(e);
    }
}

module.exports = {createOrderRespond, getAllOrderResponds, checkFirstRespond, checkMounthLimit}