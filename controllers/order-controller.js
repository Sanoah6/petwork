const orderService = require('../service/order-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class OrderController{
    async createOrder(req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()))
			      }
            const categoryName = req.params.category;
            const {title, description, price, client_id, deadline} = req.body;
            const orderData = await orderService.createOrder(title, description, price, client_id, categoryName, deadline);
            return res.json(orderData);
        } catch (e) {
            next(e);
        }
    }

    async getAllOrders(req, res, next){
        try{
            const {id, status, title, sortBy, min, max, categories, limit, page, clientId} = req.query;
            if(categories){
                const categoriesArray = categories.split(",");
                const filters = {id, status, title, sortBy, min, max, categoriesArray, limit, page, clientId};
                const orderData = await orderService.getAllOrdersByCategory(filters);
                return res.json(orderData);
            }
            else{
                const filters = {id, status, title, sortBy, min, max, limit, page, clientId};
                const orderData = await orderService.getAllOrders(filters);
                return res.json(orderData);
            }
        } catch(e){
            next(e);
        }
    }

    async editOrder(req, res, next){
        try{
            const {title, description, price, deadline} = req.body;
            const order_id = req.params.order_id;
            const currentUserId = req.user.id;
            const orderData = await orderService.editOrder(title, description, price, currentUserId, order_id, deadline);
            return res.json(orderData)
        } catch(e){
            next(e);
        }
    }

    async deleteOrder(req, res, next){
        try{
            const orderId = req.params.order_id;
            const userId = req.user.id;
            const deleteOrder = await orderService.deleteOrder(orderId, userId);
            return res.json(deleteOrder);
        } catch(e){
            next(e);
        }
    }
}

module.exports = new OrderController();