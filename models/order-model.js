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

const createOrder = async (title, description, price, client_id, category_id) => {
	try {
		const result = await pool.query(`INSERT INTO "orders" (o_title, o_description, o_price, o_client_id, o_category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [title, description, price, client_id, category_id]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const getAllOrdersByCategory = async (category_id, id, title, sortBy, min, max) => {
    try{
        let query = `SELECT * FROM "orders" WHERE 1=1`;
        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND "o_id" = $${++indexParam}`;
            queryParams.push(id);
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
            
            query += ` AND "o_title" ILIKE $${++indexParam}`;
            queryParams.push(requestTitle);
        }

        if (min){
            query += ` AND "o_price" >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND "o_price" <= $${++indexParam}`;
            queryParams.push(max);
        }

        if (category_id) {
            // Получаем все подкатегории или саму категорию, если она конечная
            const categoryResult = await pool.query(
                `SELECT c_id FROM categories WHERE c_main_branch = $1 OR c_id = $1`,
                [category_id]
            );
            const categoryIds = categoryResult.rows.map(row => row.c_id);

            if (categoryIds.length > 0) {
                query += ` AND "o_category_id" = ANY($${++indexParam})`;
                queryParams.push(categoryIds);
            }
        }

        if (sortBy === "price"){
            query += ` ORDER BY "o_price" ASC`
        }

        if (sortBy === "-price"){
            query += ` ORDER BY "o_price" DESC`
        }

        //const result = await pool.query(`SELECT * FROM "orders" WHERE "o_category_id" = $1 AND "o_id" = $2`, [category_id, order_id]);
        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (e){
        console.log(e);
    }
}

const getAllOrders = async (id, title, sortBy, min, max) => {
    try{
        let query = `SELECT * FROM "orders" WHERE 1=1`;
        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND "o_id" = $${++indexParam}`;
            queryParams.push(id);
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
            
            query += ` AND "o_title" ILIKE $${++indexParam}`;
            queryParams.push(requestTitle);
        }

        if (min){
            query += ` AND "o_price" >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND "o_price" <= $${++indexParam}`;
            queryParams.push(max);
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

const editTitle = async (title, client_id, order_id, category_id) => {
    try{
        const result = await pool.query(`UPDATE "orders" SET "o_title" = $1 WHERE "o_client_id" = $2 AND "o_id" = $3 AND "o_category_id" = $4 RETURNING o_title`, [title,  client_id, order_id, category_id]);
        return result.rows[0].o_title;
		} catch(e){
        console.log(e);
    }
}

const editDescription = async (description, client_id, order_id, category_id) => {
    try{
        const result = await pool.query(`UPDATE "orders" SET "o_description" = $1 WHERE "o_client_id" = $2 AND "o_id" = $3 AND "o_category_id" = $4 RETURNING o_description`, [description,  client_id, order_id, category_id]);
        return result.rows[0].o_description;
		} catch(e){
        console.log(e);
    }
}

const editPrice = async (price, client_id, order_id, category_id) => {
    try{
        const result = await pool.query(`UPDATE "orders" SET "o_price" = $1 WHERE "o_client_id" = $2 AND "o_id" = $3 AND "o_category_id" = $4 RETURNING o_price`, [price,  client_id, order_id, category_id]);
				return result.rows[0].o_price;
		} catch(e){
        console.log(e);
    }
}

module.exports = { getCategoryIdByName, getOrderByClientId, createOrder, getAllOrdersByCategory, getAllOrders, editTitle, editDescription, editPrice}