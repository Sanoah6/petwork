const OrderRespondModel = require('../models/order-respond-model');
const UserModel = require('../models/user-model');
const OrderModel = require('../models/order-model');
const ApiError = require('../exceptions/api-error');

class OrderService{
    async createOrder(order_id, description, price, client_id, deadline){
		const order = await OrderRespondModel.createOrderRespond(order_id, description, price, client_id, deadline);
		return 'Order respond created';
	}

	async checkFirstRespond(client_id, order_id){
		const check = await OrderRespondModel.checkFirstRespond(client_id, order_id);
		return check;
	}

	async checkRespondLimit(client_id){
		const role = await UserModel.getUserRole(client_id);
		if (role !== "Prime user"){
			const check = await OrderRespondModel.checkMounthLimit(client_id);
			return check;
		}
		else return false;
	}

	async getAllOrderResponds(filters){
		const orders = await OrderRespondModel.getAllOrders( filters.id, filters.deadline, filters.sortBy, filters.min, filters.max, filters.order_id);
		return orders;
	}
}

module.exports = new OrderService();