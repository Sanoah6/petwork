module.exports = class ReviewsDto {
	clientId;
	id;
	comment;
	createdAt;
	freelancerId;
	quality;
	speed;
	communication;
    orderId;

	constructor(model){
		if (Array.isArray(model)) {
            return model.map(item => new ReviewsDto(item));
        }
		this.clientId = model.r_client_id;
		this.id = model.r_id;
		this.freelancerId = model.r_freelancer_id;
		this.createdAt = model.r_created_at;
        this.comment = model.r_comment;
        this.quality = model.r_quality;
        this.speed = model.r_speed;
        this.communication = model.r_communication;
        this.orderId = model.r_order_id;
	}
}