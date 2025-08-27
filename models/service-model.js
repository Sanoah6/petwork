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

const getServiceInfo = async (serviceId) => {
    try{
        const result = await pool.query(`SELECT * FROM services WHERE s_id = $1`, [serviceId]);
        return result.rows[0];
    } catch(e){
        console.log(e);
    }
}

const createService = async (title, description, price, freelancerId, categoryId, deliveryTime) => {
	try {
		const result = await pool.query(`INSERT INTO "services" (s_title, s_description, s_price, s_freelancer_id, s_category_id, s_delivery_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, description, price, freelancerId, categoryId, deliveryTime]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const getAllServicesByCategory = async (category_id, id, title, sortBy, min, max, limit, page, freelancerId) => {
    try{
        let query = `
            SELECT 
                s.*, 
                u.u_name, 
                u.u_avatar, 
            FROM services s
            JOIN users u ON s.s_freelancer_id = u.u_id
            WHERE 1=1`
        ;
        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND s_id = $${++indexParam}`;
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
            
            query += ` AND s_title ILIKE $${++indexParam}`;
            queryParams.push(requestTitle);
        }

        if (min){
            query += ` AND s_price >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND s_price <= $${++indexParam}`;
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
                query += ` AND s_category_id = ANY($${++indexParam})`;
                queryParams.push(categoryIds);
            }
        }

        if (freelancerId){
            query += ` AND s.s_freelancer_id = $${++indexParam}`;
            queryParams.push(freelancerId);
        }

        query += ` GROUP BY s.s_id, u.u_name, u.u_avatar`;

        if (sortBy === "price"){
            query += ` ORDER BY s.s_price ASC`
        }

        if (!sortBy) {
            query += ` ORDER BY s.s_created_at DESC`
        }

        if (sortBy === "-price"){
            query += ` ORDER BY s.s_price DESC`
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

const getAllServices = async (id, title, sortBy, min, max, limit, page, freelancerId) => {
    try{
        let query = 
            `SELECT 
                s.*, 
                u.u_name, 
                u.u_avatar, 
            FROM services s
            JOIN users u ON s.s_freelancer_id = u.u_id
            WHERE 1=1`
        ;

        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND s.s_id = $${++indexParam}`;
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
            
            query += ` AND s.s_title ILIKE $${++indexParam}`;
            queryParams.push(requestTitle);
        }

        if (min){
            query += ` AND s.s_price >= $${++indexParam}`;
            queryParams.push(min);
        }

        if (max){
            query += ` AND s.s_price <= $${++indexParam}`;
            queryParams.push(max);
        }

        if (freelancerId){
            query += ` AND s.s_client_id = $${++indexParam}`;
            queryParams.push(freelancerId);
        }

        query += ` GROUP BY s.s_id, u.u_name, u.u_avatar`;

        if (sortBy === "price"){
            query += ` ORDER BY s.s_price ASC`;
        }

        if (sortBy === "-price"){
            query += ` ORDER BY s.s_price DESC`;
        }

        if (!sortBy) {
            query += ` ORDER BY s.s_created_at DESC`
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

const editTitle = async (title, service_id) => {
    try{
        const result = await pool.query(`UPDATE "services" SET "s_title" = $1 WHERE "s_id" = $2 RETURNING s_title`, [title, service_id]);
        return result.rows[0].s_title;
		} catch(e){
        console.log(e);
    }
}

const editDescription = async (description, service_id) => {
    try{
        const result = await pool.query(`UPDATE "services" SET "s_description" = $1 WHERE "s_id" = $2 RETURNING s_description`, [description, service_id]);
        return result.rows[0].s_description;
		} catch(e){
        console.log(e);
    }
}

const editPrice = async (price, service_id) => {
    try{
        const result = await pool.query(`UPDATE "services" SET "s_price" = $1 WHERE "s_id" = $2 RETURNING s_price`, [price, service_id]);
			return result.rows[0].s_price;
		} catch(e){
        console.log(e);
    }
}

const editDeliveryTime = async (deliveryTime, service_id) => {
    try{
        const result = await pool.query(`UPDATE services SET s_delivery_time = $1 WHERE s_id = $2 RETURNING s_delivery_time`, [deliveryTime, service_id]);
        return result.rows[0].s_delivery_time;
    }catch(e){
        console.log(e);
    }
}

const deleteService = async (serviceId) => {
    try{
        const result = await pool.query(`DELETE FROM "services" WHERE s_id = $1`, [serviceId]);
        return "deleted";
    } catch(e){
        console.log(e);
    }
}

module.exports = { getCategoryIdByName, getServiceInfo, editDeliveryTime, createService, getAllServicesByCategory, getAllServices, editTitle, editDescription, editPrice, deleteService}