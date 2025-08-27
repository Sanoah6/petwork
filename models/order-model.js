require('dotenv').config();
const pool = require('../config/db');

const getCategoryIdByName = async (categoryName) => {
	try {
		const result = await pool.query(`SELECT "c_id" FROM "categories" WHERE "c_name" = $1`, [categoryName]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const getOrderByClientId = async (client_id) => {
	try {
		const result = await pool.query(`SELECT * FROM "orders" WHERE "o_client_id" = $1`, [client_id]);
		return result.rows[0]
	} catch (e){
		console.log(e)
	}
}

const getOrderInfo = async (order_id) => {
    try{
        const result = await pool.query(`SELECT * FROM orders WHERE o_id = $1`, [order_id]);
        return result.rows[0];
    } catch(e){
        console.log(e);
    }
}

const createOrder = async (title, description, price, client_id, category_id, deadline) => {
	try {
		const result = await pool.query(`INSERT INTO "orders" (o_title, o_description, o_price, o_client_id, o_category_id, o_deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, description, price, client_id, category_id, deadline]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const getAllOrdersByCategory = async (category_id, id, status, title, sortBy, min, max, limit, page, clientId) => {
    try{
        let query = `
            SELECT 
                o.*, 
                u.u_name, 
                u.u_avatar, 
                COALESCE(COUNT(r.or_id), 0) AS responses_count
            FROM orders o
            JOIN users u ON o.o_client_id = u.u_id
            LEFT JOIN order_responds r ON o.o_id = r.or_order_id
            WHERE 1=1`
        ;
        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND o_id = $${++indexParam}`;
            queryParams.push(id);
        }

        if(status){
            query += ` AND o_status = $${++indexParam}`;
            queryParams.push(status);
        }

        if (title){
            const start = title[0];
            const end = title[title.length - 1];
            let requestTitle = title;
            if (start==="*"){
                requestTitle = "%"+requestTitle.slice(1);
            }

            if (end==="*"){
                requestTitle = requestTitle.slice(0,-1)+"%";
            }
            
            query += ` AND o_title ILIKE $${++indexParam}`;
            queryParams.push(requestTitle);
        }

        if (min){
            query += ` AND o_price >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND o_price <= $${++indexParam}`;
            queryParams.push(max);
        }

        if (category_id) {
            // Получаем все подкатегории или саму категорию, если она конечная
            const categoryResult = await pool.query(
                `SELECT c_id FROM categories WHERE c_main_branch = ANY($1) OR c_id = ANY($1)`,
                [category_id]
            );
            const categoryIds = categoryResult.rows.map(row => row.c_id);

            if (categoryIds.length > 0) {
                query += ` AND o_category_id = ANY($${++indexParam})`;
                queryParams.push(categoryIds);
            }
        }

        if (clientId){
            query += ` AND o.o_client_id = $${++indexParam}`;
            queryParams.push(clientId);
        }

        query += ` GROUP BY o.o_id, u.u_name, u.u_avatar`;

        if (sortBy === "price"){
            query += ` ORDER BY o.o_price ASC`
        }

        if (!sortBy) {
            query += ` ORDER BY o.o_created_at DESC`
        }

        if (sortBy === "-price"){
            query += ` ORDER BY o.o_price DESC`
        }

        if (limit){
            query += ` LIMIT $${++indexParam}`
            queryParams.push(limit);
        }

        if (page){
            query += ` OFFSET $${++indexParam}`
            queryParams.push(page);
        }

        //const result = await pool.query(`SELECT * FROM "orders" WHERE "o_category_id" = $1 AND "o_id" = $2`, [category_id, order_id]);
        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (e){
        console.log(e);
    }
}

const getAllOrders = async (id, status, title, sortBy, min, max, limit, page, clientId) => {
    try{
        let query = 
            `SELECT 
                o.*, 
                u.u_name, 
                u.u_avatar, 
                COALESCE(COUNT(r.or_id), 0) AS responses_count
            FROM orders o
            JOIN users u ON o.o_client_id = u.u_id
            LEFT JOIN order_responds r ON o.o_id = r.or_order_id
            WHERE 1=1`
        ;

        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND o.o_id = $${++indexParam}`;
            queryParams.push(id);
        }

        if(status){
            query += ` AND o_status = $${++indexParam}`;
            queryParams.push(status);
        }

        if (title){
            const start = title[0];
            const end = title[title.length - 1];
            let requestTitle = title;
            if (start==="*"){
                requestTitle = "%"+requestTitle.slice(1);
            }

            if (end==="*"){
                requestTitle = requestTitle.slice(0,-1)+"%";
            }
            
            query += ` AND o.o_title ILIKE $${++indexParam}`;
            queryParams.push(requestTitle);
        }

        if (min){
            query += ` AND o.o_price >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND o.o_price <= $${++indexParam}`;
            queryParams.push(max);
        }

        if (clientId){
            query += ` AND o.o_client_id = $${++indexParam}`;
            queryParams.push(clientId);
        }

        query += ` GROUP BY o.o_id, u.u_name, u.u_avatar`;

        if (sortBy === "price"){
            query += ` ORDER BY o.o_price ASC`;
        }

        if (sortBy === "-price"){
            query += ` ORDER BY o.o_price DESC`;
        }

        if (!sortBy) {
            query += ` ORDER BY o.o_created_at DESC`
        }

        if (limit){
            query += ` LIMIT $${++indexParam}`
            queryParams.push(limit);
        }

        if (page){
            query += ` OFFSET $${++indexParam}`
            queryParams.push(page);
        }
        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (e){
        console.log(e);
    }
}

const editTitle = async (title, client_id, order_id) => {
    try{
        const result = await pool.query(`UPDATE "orders" SET "o_title" = $1 WHERE "o_client_id" = $2 AND "o_id" = $3 RETURNING o_title`, [title,  client_id, order_id]);
        return result.rows[0].o_title;
		} catch(e){
        console.log(e);
    }
}

const editDescription = async (description, client_id, order_id) => {
    try{
        const result = await pool.query(`UPDATE "orders" SET "o_description" = $1 WHERE "o_client_id" = $2 AND "o_id" = $3 RETURNING o_description`, [description,  client_id, order_id]);
        return result.rows[0].o_description;
		} catch(e){
        console.log(e);
    }
}

const editPrice = async (price, client_id, order_id) => {
    try{
        const result = await pool.query(`UPDATE "orders" SET "o_price" = $1 WHERE "o_client_id" = $2 AND "o_id" = $3 RETURNING o_price`, [price,  client_id, order_id]);
			return result.rows[0].o_price;
		} catch(e){
        console.log(e);
    }
}

const editDeadline = async (deadline, orderId) => {
    try{
        const result = await pool.query(`UPDATE orders SET o_deadline = $1 WHERE o_id = $2 RETURNING o_deadline`, [deadline, orderId]);
        return result.rows[0].o_deadline;
    }catch(e){
        console.log(e);
    }
}

const setOrderStatusInProgress = async (orderId, deadline, price) => {
        try{
            const result = await pool.query(`UPDATE orders SET o_status = 'in progress', o_deadline = $2, o_price = $3 WHERE o_id = $1 RETURNING *`, [orderId, deadline, price]);
            return result.rows[0];
        }catch(e){
            console.log(e);
        }
}

const deleteOrder = async (orderId) => {
    try{
        const result = await pool.query(`DELETE FROM "orders" WHERE o_id = $1`, [orderId]);
        return "order deleted";
    } catch(e){
        console.log(e);
    }
}

module.exports = { getCategoryIdByName, getOrderByClientId, editDeadline, getOrderInfo, setOrderStatusInProgress, createOrder, getAllOrdersByCategory, getAllOrders, editTitle, editDescription, editPrice, deleteOrder}