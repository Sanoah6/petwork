const serviceService = require('../service/service-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class ServiceController{
    async createService(req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()))
			      }
            const categoryName = req.params.category;
            const {title, description, price, freelancer_id, deliveryTime} = req.body;
            const serviceData = await serviceService.createOrder(title, description, price, freelancer_id, categoryName, deliveryTime);
            return res.json(serviceData);
        } catch (e) {
            next(e);
        }
    }

    async getAllServices(req, res, next){
        try{
            const {id, title, sortBy, min, max, categories, limit, page, freelancerId} = req.query;
            if(categories){
                const categoriesArray = categories.split(",");
                const filters = {id, title, sortBy, min, max, categoriesArray, limit, page, freelancerId};
                const serviceData = await serviceService.getAllServicesByCategory(filters);
                return res.json(serviceData);
            }
            else{
                const filters = {id, title, sortBy, min, max, limit, page, freelancerId};
                const serviceData = await serviceService.getAllServices(filters);
                return res.json(serviceData);
            }
        } catch(e){
            next(e);
        }
    }

    async editService(req, res, next){
        try{
            const {title, description, price, deliveryTime} = req.body;
            const serviceId = req.params.service_id;
            const currentUserId = req.user.id;
            const serviceData = await serviceService.editService(title, description, price, currentUserId, serviceId, deliveryTime);
            return res.json(serviceData)
        } catch(e){
            next(e);
        }
    }

    async deleteService(req, res, next){
        try{
            const serviceId = req.params.service_id;
            const userId = req.user.id;
            const deleteService = await serviceService.deleteService(serviceId, userId);
            return res.json(deleteService);
        } catch(e){
            next(e);
        }
    }
}

module.exports = new ServiceController();