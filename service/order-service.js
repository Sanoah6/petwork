const OrderModel = require('../models/order-model');
const ApiError = require('../exceptions/api-error');

class OrderService{
    async createOrder(title, description, price, client_id, categoryName){
        const category_id = await OrderModel.getCategoryIdByName(categoryName);
				const order = await OrderModel.createOrder(title, description, price, client_id, category_id.c_id);
		return 'Order created'
		}

    async getAllOrdersByCategory(filters){
        const category_id = await OrderModel.getCategoryIdByName(filters.categoryName);
        const orders = await OrderModel.getAllOrdersByCategory(category_id.c_id, filters.id, filters.title, filters.sortBy, filters.min, filters.max);
        return orders;
    }

	async getAllOrders(filters){
        const orders = await OrderModel.getAllOrders( filters.id, filters.title, filters.sortBy, filters.min, filters.max);
        return orders;
    }

	async editOrder(title, description, price, client_id, order_id, categoryName){
			const category_id = await OrderModel.getCategoryIdByName(categoryName);

			const order = await OrderModel.getOrderByClientId(client_id);

			if (!order || order.o_client_id !== client_id) {
					throw ApiError.BadRequest('You cannot edit this order');
			}

			const result = {}
			if(title){
				result.newTitle = await OrderModel.editTitle(title, client_id, order_id, category_id.c_id);
			}
			if(description){
				result.newDescription = await OrderModel.editDescription(description, client_id, order_id, category_id.c_id);
			}
			if(price){
				result.newPrice = await OrderModel.editPrice(price, client_id, order_id, category_id.c_id);
			}

			return result
	}
}

module.exports = new OrderService();