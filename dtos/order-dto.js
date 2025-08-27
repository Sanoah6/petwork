module.exports = class OrderDto {
	clientId;
	id;
	category;
	status;
	completedAt;
	title;
	description;
	createdAt;
	price;
	name;
	avatar;
	respondsQuantity;
	deadline;

	constructor(model){
		if (Array.isArray(model)) {
            return model.map(item => new OrderDto(item));
        }
		this.clientId = model.o_client_id;
		this.id = model.o_id;
		this.category = model.o_category_id;
		this.status = model.o_status;
		this.completedAt = model.o_completed_at;
		this.title = model.o_title;
		this.description = model.o_description;
		this.createdAt = model.o_created_at;
		this.price = model.o_price;
		this.name = model.u_name;
		this.avatar = model.u_avatar;
		this.respondsQuantity = model.responses_count;
		this.deadline = model.o_deadline;
	}
}