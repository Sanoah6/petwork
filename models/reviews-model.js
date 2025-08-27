require('dotenv').config();
const pool = require('../config/db');

const createReview = async(comment, speed, quality, communication, orderId, clientId, freelancerId) => {
    try{
        const review = await pool.query(`INSERT INTO reviews (r_comment, r_speed, r_quality, r_communication, r_order_id, r_client_id, r_freelancer_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [comment, speed, quality, communication, orderId, clientId, freelancerId]);
        return review.rows[0];
    }catch(e){
        console.log(e);
    }
}

const getUserRating = async (freelancerId) => {
    try{
        const rating = await pool.query(`
            SELECT
            r_freelancer_id AS user_id,
            ROUND(AVG((r_speed + r_quality + r_communication) / 3.0), 2) AS avg_rating
            FROM reviews
            WHERE
            r_speed IS NOT NULL
            AND r_quality IS NOT NULL
            AND r_communication IS NOT NULL
            AND r_freelancer_id = $1
            GROUP BY r_freelancer_id`, [freelancerId]);
        return rating.rows[0];
    }catch(e){
        console.log(e);
    }
}

const getAllReviews = async (id, orderId, freelancerId, clientId, sortBy, limit, page) => {
    try{
        let query = 
            `SELECT * FROM reviews
            WHERE 1=1`
        ;

        const queryParams = [];
        let indexParam = 0;

        if (id){
            query += ` AND r_id = $${++indexParam}`;
            queryParams.push(id);
        }

        if (orderId){
            query += ` AND r_order_id = $${++indexParam}`;
            queryParams.push(orderId);
        }

        if (freelancerId){
            query += ` AND r_freelancer_id = $${++indexParam}`;
            queryParams.push(freelancerId);
        }

        if (clientId){
            query += ` AND r_client_id = $${++indexParam}`;
            queryParams.push(clientId);
        }

        if (sortBy === "positive"){
            query += ` ORDER BY ((r_speed + r_quality + r_communication) / 3.0) ASC`;
        }

        if (sortBy === "-positive"){
            query += ` ORDER BY ((r_speed + r_quality + r_communication) / 3.0) DESC`;
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
    }catch(e){
        console.log(e);
    }
}

const getReviewById = async (reviewId) => {
    try{
        const review = await pool.query(`SELECT * FROM reviews WHERE r_id = $1`, [reviewId]);
        return review.rows[0];
    }catch(e){
        console.log(e);
    }
}

const deleteReview = async (reviewId) => {
    try{
        await pool.query(`DELETE FROM reviews WHERE r_id = $1`, [reviewId]);
        return 'Review deleted';
    }catch(e){
        console.log(e);
    }
}

module.exports = { createReview, getUserRating, getReviewById, getAllReviews, deleteReview }