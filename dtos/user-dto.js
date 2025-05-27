module.exports = class UserDto {
	email;
	id;
	isActivated;

	constructor(model){
		this.email = model.u_email;
		this.id = model.u_id;
		this.isActivated = model.u_is_activated;
	}
}