module.exports = class WorkspaceDto {
	title; 
    description; 
    price;
    deadline;
    id;
    orderId;
    respondId;
    clientId;
    freelancerId;
    status;
    isPaid;
    paymentId;
    startedAt;
    completedAt;
    disputeRequired;
    disputeAt;

	constructor(model){
		if (Array.isArray(model)) {
            return model.map(item => new OrderDto(item));
        }
		this.clientId = model.w_client_id;
		this.id = model.w_id;
		this.deadline = model.o_deadline;
		this.status = model.w_status;
		this.completedAt = model.w_completed_at;
		this.title = model.o_title;
		this.description = model.o_description;
		this.startedAt = model.w_started_at;
		this.price = model.o_price;
		this.respondId = model.w_respond_id;
        this.orderId = model.w_order_id;
        this.freelancerId = model.w_freelancer_id;
        this.isPaid = model.w_is_paid;
        this.paymentId = model.w_payment_id;
        this.disputeRequired = model.w_dispute_requested;
        this.disputeAt = model.w_dispute_at;
	}
}