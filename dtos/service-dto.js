module.exports = class ServiceDto {
	freelancerId;
	id;
	category;
	title;
	description;
	createdAt;
	price;
	name;
	avatar;
	deliveryTime;

	constructor(model){
		if (Array.isArray(model)) {
            return model.map(item => new ServiceDto(item));
        }
		this.freelancerId = model.s_freelancer_id;
		this.id = model.s_id;
		this.category = model.s_category_id;
		this.title = model.s_title;
		this.description = model.s_description;
		this.createdAt = model.s_created_at;
		this.price = model.s_price;
		this.name = model.u_name;
		this.avatar = model.u_avatar;
		this.deliveryTime = model.s_delivery_time;
	}
}