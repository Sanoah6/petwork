const nodemailer = require('nodemailer')

class MailService {

	constructor(){
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: true,
			auth:{
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD
			}
		})
	}

	async sendActivationMail(to, link){
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: 'Активация аккаунта на' + process.env.API_URL,
			text: '',
			html:
				`
				<div>
					<h1>Для активации перейдите по ссылке</h1>
					<a href="${link}">${link}</a>
				</div>
				`
		})
	}

	async sendDeleteMail(to, link){
		console.log(to, link)
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: 'удаление аккаунта на' + process.env.API_URL,
			text: '',
			html:
				`
				<div>
					<h1>Для удаления перейдите по ссылке</h1>
					<a href="${link}">${link}</a>
				</div>
				`
		})
	}
}

module.exports = new MailService();