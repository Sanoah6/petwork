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
		const result = await pool.query(`SELECT u_id, u_password, u_name, u_email, u_full_name, u_role, u_avatar, u_is_activated, u_balance, u_created_at, u_city, u_description, u_skills FROM "users" WHERE "u_name" = $1 OR "u_email" = $1`, [nameOrEmail]);
		return result.rows[0];
	} catch (e) {
		console.log(e);
	}
};

const getUserInfoById = async (userId) => {
	try{
		const result = await pool.query(`SELECT u_id, u_name, u_email, u_full_name, u_role, u_avatar, u_is_activated, u_balance, u_created_at, u_city, u_description, u_skills FROM "users" WHERE "u_id" = $1`, [userId]);
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

const pushChangePasswordLink = async (id, changePasswordLink) => {
	try{
		await pool.query(`UPDATE "users" SET u_change_password_link = $1 WHERE u_id = $2`,[changePasswordLink, id]);
		return "suc"
	}catch(e){
		console.log(e);
	}
}

const getUserByChangeLink = async (changeLink) => {
	try {
		const result = await pool.query(`SELECT u_id, u_password, u_life_time_change_password_link FROM "users" WHERE "u_change_password_link" = $1`, [changeLink]);
		return result.rows[0]
	} catch (e) {
		console.log(e);
	}
};

const changePassword = async (id, hashPassword) => {
	try{
		await pool.query(`UPDATE "users" SET u_password = $1 WHERE u_id = $2`, [hashPassword, id]);
		return "password changed";
	}catch(e){
		console.log(e);
	}
};

const saveLifeTimeLink = async (lifeTime, id) => {
	try{
		await pool.query(`UPDATE "users" SET u_life_time_change_password_link = $1 WHERE u_id = $2`, [lifeTime, id]);
		return "dksnmfiosjjfoiksdnmjfio";
	}catch(e){
		console.log(e);
	}
}

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

const checkUserNameIsFree = async(userName) => {
	try{
		const result = await pool.query(`SELECT "u_id" FROM "users" WHERE u_name = $1`, [userName]);
		if (result.rows[0]){
			return false;
		}
		return true;
	}catch(e){
		console.log(e);
	}
}

const editUserName = async(userName, userId) => {
	try{
		const result = await pool.query(`UPDATE "users" SET "u_name" = $1 WHERE "u_id" = $2 RETURNING u_name`, [userName, userId]);
		return result.rows[0].u_name;
	}catch(e){
		console.log(e);
	}
}

const editFullName = async(fullName, userId) => {
	try{
		const result = await pool.query(`UPDATE "users" SET "u_full_name" = $1 WHERE "u_id" = $2 RETURNING u_full_name`, [fullName, userId]);
		return result.rows[0].u_full_name;
	}catch(e){
		console.log(e);
	}
}

const editAvatar = async(avatar, userId) => {
	try{
		const result = await pool.query(`UPDATE "users" SET "u_avatar" = $1 WHERE "u_id" = $2 RETURNING u_avatar`, [avatar, userId]);
		return result.rows[0].u_avatar;
	}catch(e){
		console.log(e);
	}
}

const editCity = async(city, userId) => {
	try{
		const result = await pool.query(`UPDATE "users" SET "u_city" = $1 WHERE "u_id" = $2 RETURNING u_city`, [city, userId]);
		return result.rows[0].u_city;
	}catch(e){
		console.log(e);
	}
}

const editDescription = async(description, userId) => {
	try{
		const result = await pool.query(`UPDATE "users" SET "u_description" = $1 WHERE "u_id" = $2 RETURNING u_description`, [description, userId]);
		return result.rows[0].u_description;
	}catch(e){
		console.log(e);
	}
}

const editSkills = async(skills, userId) => {
	try{
		const result = await pool.query(`UPDATE "users" SET "u_skills" = $1 WHERE "u_id" = $2 RETURNING u_skills`, [skills, userId]);
		return result.rows[0].u_skills;
	}catch(e){
		console.log(e);
	}
}

const updateUserRating = async (rating, userId) => {
	try{
		await pool.query(`UPDATE users SET u_rating = $1 WHERE u_id = $2`, [rating, userId]);
		return 'Updated';
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

module.exports = { getUserByEmail, getUserByUsername, updateUserRating, getUserLogin, editCity, editDescription, editSkills, editFullName, editAvatar, saveLifeTimeLink, getUserInfoById, changePassword, createUser, getUserByActivationLink, getUserByChangeLink, pushChangePasswordLink, getUserIdByDeleteLink, updateIsActivated, getAll, deleteUser, getEmailById, getUserRole, checkUserNameIsFree, getDeleteLink, editUserName }