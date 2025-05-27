const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const {getUserIdByRefreshToken} = require('../models/token-model')

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
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
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
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {
			...tokens,
			user: userDto
		}
	}

	async getAllUsers(){
		const users = await UserModel.getAll();
		return users;
	}

	async getUserInfoById(id){
		const user = await UserModel.getUserInfoById(id);
		return user;
	}
}

module.exports = new UserService();