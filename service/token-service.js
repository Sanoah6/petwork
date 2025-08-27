const TokenModel = require('../models/token-model');
const jwt = require('jsonwebtoken');


class TokenService {
	generateTokens(payload) {
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
		return {
			accessToken,
			refreshToken
		}
	}

	validateAccessToken(token){
		try{
			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
			return userData;
		}catch(e){
			return null;
		}
	}

	validateRefreshToken(token){
		try{
			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
			return userData;
		}catch(e){
			return null;
		}
	}


	async saveToken(userId, refreshToken) {
		const tokenData = await TokenModel.getTokenByUserId(userId);
		if(tokenData) {
			return TokenModel.updateToken(refreshToken, userId);
		}
		const token = await TokenModel.createToken(userId, refreshToken);
		return token;
	}

	async removeToken(refreshToken){
		const tokenData = await TokenModel.deleteToken(refreshToken);
		return tokenData;
	}

	async findToken(refreshToken){
		const tokenData = await TokenModel.findToken(refreshToken);
		return tokenData;
	}

	async getUserIdByRefreshToken(refreshToken) {
		return await TokenModel.getUserIdByRefreshToken(refreshToken);
	}

	async deleteTokenInfoById(userId) {
		return await TokenModel.deleteTokenInfoById(userId)
	}
}

module.exports = new TokenService();