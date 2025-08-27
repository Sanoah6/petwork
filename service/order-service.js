const OrderModel = require('../models/order-model');
const OrderDto = require('../dtos/order-dto');
const ApiError = require('../exceptions/api-error');

class OrderService{
  async createOrder(title, description, price, client_id, categoryName, deadline){
    const category_id = await OrderModel.getCategoryIdByName(categoryName);
		const order = await OrderModel.createOrder(title, description, price, client_id, category_id.c_id, deadline);
	  return 'Order created'
  }

  async getAllOrdersByCategory(filters){
    const category_id = [];
		let i = 0;
    while (filters.categoriesArray.length > i){
        const currentCategory = filters.categoriesArray[i];
        const current = await OrderModel.getCategoryIdByName(currentCategory);
        category_id.push(current);
        i++;
    }
		const arrayOfIds = category_id.map(item => item.c_id);
    const orders = await OrderModel.getAllOrdersByCategory(arrayOfIds, filters.id, filters.status, filters.title, filters.sortBy, filters.min, filters.max, filters.limit, filters.page, filters.clientId);
    const orderDto = new OrderDto(orders);
    return {orders: orderDto};
  }

	async getAllOrders(filters){
    const orders = await OrderModel.getAllOrders( filters.id, filters.status, filters.title, filters.sortBy, filters.min, filters.max, filters.limit, filters.page, filters.clientId);
    const orderDto = new OrderDto(orders);
    return {orders: orderDto};
  }

	async editOrder(title, description, price, client_id, order_id, deadline){
		const order = await OrderModel.getOrderInfo(order_id);

		if (!order || order.o_client_id !== client_id) {
				throw ApiError.BadRequest('You cannot edit this order');
		}

		const result = {}
		if(title){
			result.newTitle = await OrderModel.editTitle(title, client_id, order_id);
		}
		if(description){
			result.newDescription = await OrderModel.editDescription(description, client_id, order_id);
		}
		if(price){
			result.newPrice = await OrderModel.editPrice(price, client_id, order_id);
		}
		if(deadline){
			result.newDeadline = await OrderModel.editDeadline(deadline, order_id)
		}
    return {...result};
	}

	async setOrderStatusInProgress(orderId, deadline, price){
		const order = await OrderModel.setOrderStatusInProgress(orderId, deadline, price);
		const orderDto = new OrderDto(order);
		return {...orderDto};
	}

	async deleteOrder(orderId, userId){
		const order = await OrderModel.getOrderInfo(orderId);

		if (!order || order.o_client_id !== userId) {
				throw ApiError.BadRequest('You cannot delete this order');
		}
		const deleteOrderResponds = await orderRespondService.deleteAllRespondsOnOrder(orderId);
		const deleteOrder = await OrderModel.deleteOrder(orderId);
		return 'smt';
	}
}

module.exports = new OrderService();