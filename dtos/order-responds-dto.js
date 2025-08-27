module.exports = class RespondDto {
    orderId;
    id;
    freelancerId;
    status;
    deadline;
    description;
    createdAt;
    price;
    workspaceId;
    name;
    rating;

    constructor(model){
        if (Array.isArray(model)) {
            return model.map(item => new RespondDto(item));
        }
        
        this.orderId = model.or_order_id;
        this.id = model.or_id;
        this.freelancerId = model.or_freelancer_id;
        this.status = model.or_status;
        this.deadline = model.or_deadline;
        this.description = model.or_respond_description;
        this.createdAt = model.or_created_at;
        this.price = model.or_price;
        this.name = model.u_name;
        this.rating = model.u_rating;

        if(model.or_status === 'accepted') {
            this.workspaceId = model.or_workspace_id;
        }        
    }
}