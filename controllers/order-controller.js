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
            const {title, description, price, client_id} = req.body;
            const orderData = await orderService.createOrder(title, description, price, client_id, categoryName);
            return res.json(orderData);
        } catch (e) {
            next(e);
        }
    }

    async getAllOrders(req, res, next){
        try{
            const {id, title, sortBy, min, max} = req.query;
            const categoryName = req.params.category;
            const filters = {id, title, sortBy, min, max, categoryName};
            if (categoryName){
                const orderData = await orderService.getAllOrdersByCategory(filters);
                return res.json(orderData);
            }
            else{
                const orderData = await orderService.getAllOrders(filters);
                return res.json(orderData);
            }
            

            //if(categoryName){
            //    const orderData = await orderService.getAllOrdersByCategory(categoryName, order_id);
            //    return res.json(orderData);
            //}
            //else{
            //    const orderData = await orderService.getAllOrders(order_id);
            //    return res.json(orderData);
            //}
        } catch(e){
            next(e);
        }
    }

    async editOrder(req, res, next){
        try{
            const categoryName = req.params.category;
            const {title, description, price, order_id} = req.body;
            const currentUserId = req.user.id;
            // достаем id из req, в req.user оно уже лежит,
            // потому что у нас реализован authMiddleware

            console.log(currentUserId, '- Текущий id авторизованного пользователя')

            const orderData = await orderService.editOrder(title, description, price, currentUserId, order_id, categoryName);
            return res.json(orderData)
        } catch(e){
            next(e);
        }
    }
}

module.exports = new OrderController();