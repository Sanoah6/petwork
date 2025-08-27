module.exports = class UserDto {
	email;
	id;
	isActivated;
	fullName;
	role;
	lastTimeSeen;
	balance;
	createdAt;
	name;
	avatar;
	city;
	description;
	skills;
	rating;

	constructor(model){
		if (Array.isArray(model)) {
            return model.map(item => new UserDto(item));
        }
		this.email = model.u_email;
		this.id = model.u_id;
		this.isActivated = model.u_is_activated;
		this.fullName = model.u_full_name;
		this.role = model.u_role;
		this.lastTimeSeen = model.u_last_time_seen;
		this.balance = model.u_balance;
		this.createdAt = model.u_created_at;
		this.name = model.u_name;
		this.avatar = model.u_avatar;
		this.city = model.u_city;
		this.description = model.u_description;
		this.skills = model.u_skills;
		this.rating = model.u_rating;
	}
}