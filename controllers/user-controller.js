const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const { getIdByRefreshToken } = require('../service/token-service');
const {getDeleteLink} = require('../models/user-model')
const {del} = require('express/lib/application')

class UserController {
	async registration(req, res, next) {
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return next(ApiError.BadRequest('Validation error', errors.array()))
			}
			const {name, email, password} = req.body;
			const userData = await userService.registration(name, email, password);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async login(req, res, next) {
		try {
			const {email, password} = req.body;
			const userData = await userService.login(email, password);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async logout(req, res, next) {
		try {
			const {refreshToken} = req.cookies;
			const token = await userService.logout(refreshToken);
			res.clearCookie('refreshToken', {
				httpOnly: true,
				path: '/'
			});
			return res.json(token);
		} catch (e) {
			next(e);
		}
	}

	async activate(req, res, next) {
		try {
			const activationLink = req.params.link;
			console.log(activationLink);
			await userService.activate(activationLink);
			return res.redirect(process.env.CLIENT_URL);
		} catch (e) {
			next(e);
		}
	}

	async sendDeleteEmail(req, res, next) {
		try {
			const {refreshToken} = req.cookies;
			await userService.sendDeleteEmail(refreshToken)
			return res.json('Удачно')
		} catch (e) {
			next(e)
		}
	}

	async deleteUser(req, res, next) {
		try{
		const deleteLink = req.params.link;
		await userService.deleteUser(deleteLink);
		return res.redirect(process.env.CLIENT_URL);
		}catch(e){
			next(e);
		}
	}

	async forgotPassword(req, res, next){
		try {
			const {email} = req.body;
			await userService.forgotPassword(email);
			return '👌';
		}catch(e){
			next(e);
		}
	}

	async changePassword(req, res, next){
		try {
			const changeLink = req.params.link;
			const {newPassword} = req.body;
			await userService.changePassword(newPassword, changeLink);
			return res.json("удачно");
		}catch(e){
			next(e);
		}
	}

	async refresh(req, res, next) {
		try {
			const {refreshToken} = req.cookies;
			const userData = await userService.refresh(refreshToken);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async getUsers(req, res, next) {
		try {
			const users = await userService.getAllUsers();
			return res.json(users);
		} catch (e) {
			next(e);
		}
	}
	async getUserInfoById(req, res, next) {
		try {
			const id = req.params.id;
			const user = await userService.getUserInfoById(id);
			return res.json(user);
		} catch (e) {
			next(e);
		}
	}

	async editProfile(req, res, next){
		try{
			const userId = Number(req.params.user_id);
			const currentUserId = req.user.id;
			const {userName, fullName, avatar, city, description, skills} = req.body;
			console.log(req.body);
			const user = await userService.editUserInfo(currentUserId, userId, userName, fullName, avatar, city, description, skills);
			return res.json(user);
		}catch(e){
			next(e);
		}
	}
}

module.exports = new UserController();