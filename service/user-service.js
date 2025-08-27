const UserModel = require('../models/user-model');
const OrderRespondModel = require('../models/order-respond-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
	async registration(name, email, password) {
		const candidate = await UserModel.getUserByEmail(email);
		if(candidate) {
			throw ApiError.BadRequest(`User with email ${email} already exists`);
		}
		const hashPassword = await bcrypt.hash(password, 3);
		const activationLink = uuid.v4();
		const deleteLink = uuid.v4();
		const user = await UserModel.createUser(name, email, hashPassword, activationLink, deleteLink);
		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {
			...tokens,
			user: userDto
		}
	}

	async activate(activationLink) {
		const user = await UserModel.getUserByActivationLink(activationLink)
		if (!user){
				throw ApiError.BadRequest('Incorrect activation link')
		}
		const userDto = new UserDto(user);
		userDto.isActivated = true;
		await UserModel.updateIsActivated(userDto.isActivated, userDto.id);
	}

	async sendDeleteEmail(refreshToken) {
		const userId = await tokenService.getUserIdByRefreshToken(refreshToken);
		const email = await UserModel.getEmailById(userId);
		const deleteLink = await UserModel.getDeleteLink(userId);
		await mailService.sendDeleteMail(email, `${process.env.API_URL}/api/delete/${deleteLink}`);
	}

	async deleteUser(deleteLink) {
		const userId = await UserModel.getUserIdByDeleteLink(deleteLink);
		if(!userId){
			throw ApiError.BadRequest('Incorrect delete link')
		}
		const deleteTokenResponse = await tokenService.deleteTokenInfoById(userId);
		const deleteUserResponse = await UserModel.deleteUser(deleteLink);
		return `${deleteUserResponse} + ${deleteTokenResponse}`
	}

	async login(login, password){
        const user = await UserModel.getUserLogin(login)
        if (!user){
            throw ApiError.BadRequest('Username/email is incorrect')
        }
        const isPassEquals = await bcrypt.compare(password, user.u_password);
        if (!isPassEquals){
            throw ApiError.BadRequest('Password is incorrect')
        }
        const availableNumberOfResponds = await OrderRespondModel.checkMounthLimit(user.u_id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: {...userDto, availableNumberOfResponds: availableNumberOfResponds.availableNumberOfResponds}
        }
    }

	async logout(refreshToken){
		const token = await tokenService.removeToken(refreshToken);
		return 'req.status(200)';
	}

	async refresh(refreshToken){
		if (!refreshToken){
			throw ApiError.UnauthorizedError();
		}
		const userData = tokenService.validateRefreshToken(refreshToken);
		const tokenFromDb = await tokenService.findToken(refreshToken);
		if (!userData || !tokenFromDb){
			throw ApiError.UnauthorizedError();
		}
		const user = await UserModel.getUserInfoById(tokenFromDb.tok_user_id);
    const availableNumberOfResponds = await OrderRespondModel.checkMounthLimit(user.u_id);
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {
			...tokens,
			user: {...userDto, availableNumberOfResponds: availableNumberOfResponds.availableNumberOfResponds}
		}
	}

	async getAllUsers(){
		const users = await UserModel.getAll();
		const userDto = new UserDto(users);
		return {users: userDto}
	}

	async forgotPassword(email){
		const check = await UserModel.getUserByEmail(email);
		console.log(check);
		if (!check){
			throw ApiError.BadRequest('User not found');
		}
		const changePasswordLink = uuid.v4();
		const lifeTime = new Date(Date.now()+10*60*1000)
		await UserModel.saveLifeTimeLink(lifeTime, check.u_id);
		await UserModel.pushChangePasswordLink(check.u_id, changePasswordLink);
		await mailService.sendChangePasswordMail(email, `${process.env.API_URL}/api/forgotPassword/${changePasswordLink}`);
		return "Email send";
	}

	async changePassword(newPassword, changeLink){
		const user = await UserModel.getUserByChangeLink(changeLink);
		if (user.u_life_time_change_password_link < new Date()){
			throw ApiError.BadRequest('Link dead')
		}
		const isPassEquals = await bcrypt.compare(newPassword, user.u_password);
        if (isPassEquals){
            throw ApiError.BadRequest('Password cant be same with the previous one')
        }
		else{
			const hashPassword = await bcrypt.hash(newPassword, 3);
			await UserModel.changePassword(user.u_id, hashPassword);
		}
		return "password changed";
	}

	async getUserInfoById(id){
		const user = await UserModel.getUserInfoById(id);
		if (!user){
			throw ApiError.BadRequest('User not found!');
		}
		const userDto = new UserDto(user);
		return {...userDto}
	}

	async editUserInfo(currentUserId, userId, userName, fullName, avatar, city, description, skills){
		if (currentUserId !== userId) {
			throw ApiError.BadRequest('You cannot edit this profile');
		}
		const result = {}
		if(userName){
			const check = await UserModel.checkUserNameIsFree(userName);
			if (check){
			result.newUserName = await UserModel.editUserName(userName, userId);
			}
			else{throw ApiError.BadRequest('Username is bisy')};
		}
		if(fullName){
			result.newFullName = await UserModel.editFullName(fullName, userId);
		}
		if(avatar){
			result.newAvatar = await UserModel.editAvatar(avatar, userId);
		}
		if(city){
			result.newCity = await UserModel.editCity(city, userId);
		}
		if(description){
			result.newDescription = await UserModel.editDescription(description, userId);
		}
		if(skills){
			result.newSkills = await UserModel.editSkills(skills, userId);
		}
        return {...result};
	}

	async updateUserRating(rating, userId){
		await UserModel.updateUserRating(rating, userId);
		return 'Updated';
	}
}

module.exports = new UserService();