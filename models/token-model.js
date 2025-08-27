require('dotenv').config();
const pool = require('../config/db')

const getTokenByUserId = async (userId) => {
	try {
		const result = await pool.query(`SELECT "tok_refresh_token" FROM "tokens" WHERE "tok_user_id" = $1`, [userId]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const updateToken = async (refreshToken, userId) => {
	try {
		const result = await pool.query(`UPDATE "tokens" SET "tok_refresh_token" = $1 WHERE "tok_user_id" = $2`, [refreshToken, userId]);
	} catch (e) {
		console.log(e)
	}
}

const createToken = async (userId, refreshToken) => {
	try {
		const result = await pool.query(`INSERT INTO "tokens"("tok_user_id", "tok_refresh_token") VALUES($1, $2)`, [userId, refreshToken]);
	} catch (e) {
		console.log(e);
	}
}

const findToken = async (refreshToken) => {
	try {
		const result = await pool.query(`SELECT * FROM "tokens" WHERE "tok_refresh_token" = $1`, [refreshToken]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const deleteToken = async (refreshToken) => {
	try{
		const result = await pool.query(`DELETE FROM "tokens" WHERE "tok_refresh_token" = $1`, [refreshToken]);
	} catch (e) {
		console.log(e);
	}
}

const deleteTokenInfoById = async (userId) => {
	try{
		const result = await pool.query(`DELETE FROM "tokens" WHERE "tok_user_id" = $1`, [userId]);
		return "token info deleted";
	} catch(e) {
		console.log(e);
	}
}

const getUserIdByRefreshToken = async (refreshToken) => {
	try{
		const result = await pool.query(`SELECT "tok_user_id" FROM "tokens" WHERE "tok_refresh_token" = $1`, [refreshToken]);
		console.log(result.rows[0])
		return result.rows[0].tok_user_id;
	} catch (e){
		console.log(e);
	}
}

module.exports = { getTokenByUserId, updateToken, createToken, findToken, deleteToken, deleteTokenInfoById, getUserIdByRefreshToken }