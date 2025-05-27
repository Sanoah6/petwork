const orderRespondService = require('../service/order-respond-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class OrderRespondController{
    async createOrderRespond(req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()))
			      }
            const order_id = req.params.order_id;
            const {description, price, client_id, deadline} = req.body;
            const checkListFirstRespond = await orderRespondService.checkFirstRespond(client_id, order_id);
            const checkListRespondsLimit = await orderRespondService.checkRespondLimit(client_id);
            if (checkListFirstRespond === true){
                return next(ApiError.BadRequest('Respond already created'));
            }
            if (checkListRespondsLimit === true){
                return next(ApiError.BadRequest('Respond limit'))
            }
            const orderData = await orderRespondService.createOrderRespond(order_id, description, price, client_id, deadline);
            return res.json(orderData);
        } catch (e) {
            next(e);
        }
    }

    async getAllOrderResponds(req, res, next){
        try{
            const {id, deadline, sortBy, min, max} = req.query;
            const order_id = req.params.order_id;
            const filters = {id, deadline, sortBy, min, max, order_id};
            const orderData = await orderService.getAllOrders(filters);
            return res.json(orderData);

        } catch(e){
            next(e);
        }
    }
}

module.exports = new OrderRespondController();