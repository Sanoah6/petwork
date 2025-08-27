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
                console.log(checkListFirstRespond === true, '- отклик уже создан');
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
            const {id, deadline, sortBy, min, max, orderId, freelancerId} = req.query;
            const filters = {id, deadline, sortBy, min, max, orderId, freelancerId};
            const orderData = await orderRespondService.getAllOrderResponds(filters);
            return res.json(orderData);

        } catch(e){
            next(e);
        }
    }

    async editOrderRespond(req, res, next){
        try{
            const respond_id = req.params.order_respond_id;
            const currentUserId = req.user.id;
            const {description, price, deadline} = req.body;
            const orderData = await orderRespondService.editOrderRespond(respond_id, description, price, deadline, currentUserId);
            return res.json(orderData)
        } catch(e){
            next(e);
        }
    }

    async deleteOrderRespond(req, res, next){
        try{
            const respondId = req.params.order_respond_id;
            const userId = req.user.id;
            const deleteRespond = await orderRespondService.deleteOrderRespond(respondId, userId);
            return res.json(deleteRespond);
        } catch(e){
            next(e);
        }
    }

    async setRespondStatusRead(req, res, next){
        try{
            const respondId = req.params.order_respond_id;
            const userId = req.user.id;
            const setRespondStatus = await orderRespondService.setRespondStatusRead(respondId, userId);
            return res.json(setRespondStatus);
        }catch(e){
            next(e);
        }
    }

    async setRespondStatusRejected(req, res, next){
        try{
            const respondId = req.params.order_respond_id;
            const userId = req.user.id;
            const setRespondStatus = await orderRespondService.setRespondStatusRejected(respondId, userId);
            return res.json(setRespondStatus);
        }catch(e){
            next(e);
        }
    }

    async setRespondStatusAccepted(req, res, next){
        try{
            const respondId = req.params.order_respond_id;
            const userId = req.user.id;
            const setRespondStatus = await orderRespondService.setRespondStatusAccepted(respondId, userId);
            return res.json(setRespondStatus);
        }catch(e){
            next(e);
        }
    }
}

module.exports = new OrderRespondController();