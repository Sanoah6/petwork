require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./config/db');
const routerUser = require('./router/router-user');
const routerOrder = require('./router/router-order');
const errorMiddleware = require('./middlewares/error-middleware');

const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(cors( {
	credentials: true,
	origin: process.env.CLIENT_URL
}));
app.use('/api', routerUser);
app.use('/api', routerOrder);
app.use(errorMiddleware);

const start = async () => {
	try {
		await pool.query('SELECT 1');
		console.log("Connected to PostgreSQL");
		app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
	} catch (e){
		console.log(e);
	}
}

start()