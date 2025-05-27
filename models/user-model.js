require('dotenv').config();
const { Connection } = require('pg');
const pool = require('../config/db');

const getUserByEmail = async (email) => {
	try {
		const result = await pool.query(`SELECT u_id, u_password FROM "users" WHERE "u_email" = $1`, [email]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
};

const getUserByUsername = async (name) => {
	try {
		const result = await pool.query(`SELECT u_id, u_password FROM "users" WHERE "u_name" = $1`, [name]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
};

const getUserLogin = async (nameOrEmail) => {
	try {
		const result = await pool.query(`SELECT u_id, u_password FROM "users" WHERE "u_name" = $1 OR "u_email" = $1`, [nameOrEmail]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
};

const getUserInfoById = async (userId) => {
	try{
		const result = await pool.query(`SELECT u_id, u_name, u_email, u_full_name, u_role, u_avatar, u_is_activated, u_balance, u_created_at FROM "users" WHERE "u_id" = $1`, [userId]);
		return result.rows[0];
	}catch (e){
		console.log(e)
	}
}

const createUser = async (name, email, password, activationLink, deleteLink) => {
	try {
		const result = await pool.query(`INSERT INTO "users" (u_name, u_email, u_password, u_activation_link, u_delete_link) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, email, password, activationLink, deleteLink]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
}

const getUserByActivationLink = async (activationLink) => {
	try {
		const result = await pool.query(`SELECT u_id FROM "users" WHERE "u_activation_link" = $1`, [activationLink]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
};

const getUserIdByDeleteLink = async (deleteLink) => {
	try {
		const result = await pool.query(`SELECT u_id FROM "users" WHERE "u_delete_link" = $1`, [deleteLink]);
		return result.rows[0].u_id;
	} catch (e) {
		console.log(e);
	}
};

const updateIsActivated = async (isActivated, userId) => {
	try {
		const result = await pool.query(`UPDATE "users" SET "u_is_activated" = $1, "u_role" = 'activated user' WHERE "u_id" = $2`, [isActivated, userId]);
	} catch (e) {
		console.log(e)
	}
}

const getAll = async () => {
	try {
		const result = await pool.query(`SELECT * FROM "users" ORDER BY "u_id" ASC`);
		return result.rows;
	} catch (e) {
		console.log(e)
	}
}

const deleteUser = async (deleteLink) => {
	try {
		const result = await pool.query(`DELETE FROM "users" WHERE u_delete_link = $1`, [deleteLink]);
		return "user deleted";
	} catch(e) {
		console.log(e);
	}
}

const getEmailById = async (userId) => {
	try{
		const result = await pool.query(`SELECT u_email FROM "users" WHERE u_id = $1`, [userId]);
		return result.rows[0].u_email;
	} catch (e) {
		console.log(e);
	}
}

const getUserRole = async(userId) => {
	try{
		const result = await pool.query(`SELECT u_role FROM "users" WHERE u_id = $1`, [userId]);
		return result.rows[0];
	}catch(e){
		console.log(e);
	}
}

const getDeleteLink = async(userId) => {
	try{
		const result = await pool.query(`SELECT "u_delete_link" FROM "users" WHERE u_id = $1`, [userId]);
		return result.rows[0].u_delete_link;
	}catch(e){
		console.log(e);
	}
}

module.exports = { getUserByEmail, getUserByUsername, getUserLogin, getUserInfoById, createUser, getUserByActivationLink, getUserIdByDeleteLink, updateIsActivated, getAll, deleteUser, getEmailById, getUserRole, getDeleteLink }