const ServiceModel = require('../models/service-model');
const ServiceDto = require('../dtos/service-dto');
const ApiError = require('../exceptions/api-error');

class ServiceService{
  async createService(title, description, price, freelancerId, categoryName, deliveryTime){
    const category_id = await ServiceModel.getCategoryIdByName(categoryName);
		const service = await ServiceModel.createService(title, description, price, freelancerId, category_id.c_id, deliveryTime);
        const serviceDto = new ServiceDto(service);
	  return {...serviceDto}
  }

  async getAllServicesByCategory(filters){
    const category_id = [];
		let i = 0;
    while (filters.categoriesArray.length > i){
        const currentCategory = filters.categoriesArray[i];
        const current = await ServiceModel.getCategoryIdByName(currentCategory);
        category_id.push(current);
        i++;
    }
		const arrayOfIds = category_id.map(item => item.c_id);
    const services = await ServiceModel.getAllServicesByCategory(arrayOfIds, filters.id, filters.title, filters.sortBy, filters.min, filters.max, filters.limit, filters.page, filters.freelancerId);
    const serviceDto = new ServiceDto(services);
    return {services: serviceDto};
  }

	async getAllServices(filters){
    const services = await ServiceModel.getAllServices( filters.id, filters.title, filters.sortBy, filters.min, filters.max, filters.limit, filters.page, filters.freelancerId);
    const serviceDto = new ServiceDto(services);
    return {services: serviceDto};
  }

	async editService(title, description, price, freelancerId, serviceId, deliveryTime){
		const service = await ServiceModel.getServiceInfo(serviceId);

		if (!service || service.s_freelancer_id !== freelancerId) {
				throw ApiError.BadRequest('You cannot edit this order');
		}

		const result = {}
		if(title){
			result.newTitle = await ServiceModel.editTitle(title, serviceId);
		}
		if(description){
			result.newDescription = await ServiceModel.editDescription(description, serviceId);
		}
		if(price){
			result.newPrice = await ServiceModel.editPrice(price, serviceId);
		}
		if(deliveryTime){
			result.newDeadline = await ServiceModel.editDeliveryTime(deliveryTime, serviceId)
		}
    return {...result};
	}

	async deleteService(serviceId, userId){
		const service = await ServiceModel.getServiceInfo(serviceId);

		if (!service || service.s_freelancer_id !== userId) {
				throw ApiError.BadRequest('You cannot delete this order');
		}
		const deleteService = await ServiceModel.deleteService(serviceId);
		return deleteService;
	}
}

module.exports = new ServiceService();