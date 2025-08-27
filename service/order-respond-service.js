const OrderRespondModel = require('../models/order-respond-model');
const UserModel = require('../models/user-model');
const OrderModel = require('../models/order-model');
const OrderService = require('../service/order-service');
const uuid = require('uuid');
const RespondDto = require('../dtos/order-responds-dto');
const ApiError = require('../exceptions/api-error');
const WorkspaceService = require('./workspace-service');
const { response } = require('express');

class OrderRespondService{
    async createOrderRespond(order_id, description, price, client_id, deadline){
		const order = await OrderRespondModel.createOrderRespond(order_id, description, price, client_id, deadline);
    const result = await OrderRespondModel.checkMounthLimit(client_id);
		return { ...order, availableNumberOfResponds : result.availableNumberOfResponds };
	}

	async checkFirstRespond(client_id, order_id){
		const check = await OrderRespondModel.checkFirstRespond(client_id, order_id);
    return check
	}

	async checkRespondLimit(client_id){
		const role = await UserModel.getUserRole(client_id);
		if (role !== "Prime user"){
			const check = await OrderRespondModel.checkMounthLimit(client_id);
      return check.status;
		}
		else return false;
	}

	async getAllOrderResponds(filters){
		const responds = await OrderRespondModel.getAllOrderResponds( filters.id, filters.deadline, filters.sortBy, filters.min, filters.max, filters.orderId, filters.freelancerId);
		const respondDto = new RespondDto(responds);
    return {responds: respondDto};
	}

	async editOrderRespond(respond_id, description, price, deadline, currentUserId){
		const order = await OrderRespondModel.getOrderRespondByRespondId(respond_id);

		if (!order || order.or_freelancer_id !== currentUserId) {
			throw ApiError.BadRequest('You cannot edit this respond');
		}

		const result = {}
		if(deadline){
			result.newDeadline = await OrderRespondModel.editDeadline(deadline, currentUserId, respond_id);
		}
		if(description){
			result.newDescription = await OrderRespondModel.editDescription(description, currentUserId, respond_id);
		}
		if(price){
			result.newPrice = await OrderRespondModel.editPrice(price, currentUserId, respond_id);
		}
        return {...result};
	}

	async deleteAllRespondsOnOrder(orderId){
		const deleteResponds = await OrderRespondModel.deleteAllRespondsOnOrder(orderId);
		return "responds deleted";
	}

	async deleteOrderRespond(respondId, userId){
		const order = await OrderRespondModel.getOrderRespondByRespondId(respondId);
		if (!order || order.or_freelancer_id !== userId) {
			throw ApiError.BadRequest('You cannot delete this respond');
		}
		const deleteRespond = await OrderRespondModel.deleteOrderRespond(respondId);
		const result = await OrderRespondModel.checkMounthLimit(userId);
		return {... deleteRespond, availableNumberOfResponds : result.availableNumberOfResponds}
	}

	async setRespondStatusRead(respondId, userId){
		const order = await OrderRespondModel.getOrderRespondByRespondIdForSetStatus(respondId);
		if (!order || order.o_client_id !== userId) {
			throw ApiError.BadRequest('You cannot set status for this respond');
		}
		const setStatus = await OrderRespondModel.setRespondStatusRead(respondId);
		const respondDto = new RespondDto(setStatus);
		return {...respondDto};
	}

	async setRespondStatusRejected(respondId, userId){
		const order = await OrderRespondModel.getOrderRespondByRespondIdForSetStatus(respondId);
		if (!order || order.o_client_id !== userId) {
			throw ApiError.BadRequest('You cannot set status for this respond');
		}
		const setStatus = await OrderRespondModel.setRespondStatusRejected(respondId);
		const respondDto = new RespondDto(setStatus);
		return {...respondDto};
	}

	async setRespondStatusAccepted(respondId, userId){
		const order = await OrderRespondModel.getOrderRespondByRespondIdForSetStatus(respondId);
		if (!order || order.o_client_id !== userId) {
			throw ApiError.BadRequest('You cannot set status for this respond');
		}
		const setStatus = await OrderRespondModel.setRespondStatusAccepted(respondId);
		const setOrderStatus = await OrderService.setOrderStatusInProgress(order.or_order_id, order.or_deadline, order.or_price);
		await OrderRespondModel.rejectAnotherResponds(order.or_order_id, respondId);
		const workspaceData = {
			order_id: setStatus.or_order_id,
			respond_id: setStatus.or_id,
			freelancer_id: setStatus.or_freelancer_id,
			client_id: order.o_client_id,
		}
		const responseOfCreatingWorkspace = await WorkspaceService.createWorkspace(workspaceData)
		const respondDto = new RespondDto(setStatus);
		return {...respondDto, workspaceId: responseOfCreatingWorkspace.w_id};
	}

	async getRespondByOrderId(orderId){
		const respondInfo = await OrderRespondModel.getRespondByOrderId(orderId);
		return respondInfo;
	}
}

module.exports = new OrderRespondService();