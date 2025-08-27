require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const pool = require('./config/db');
const routerUser = require('./router/router-user');
const routerOrder = require('./router/router-order');
const routerPayment = require('./router/router-payment')
const routerWorkspace = require('./router/router-workspace');
const routerDevTasks = require('./router/router-dev-tasks');
const routerMessages = require('./router/router-messages');
const errorMiddleware = require('./middlewares/error-middleware');
const { Server } = require('socket.io');

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
app.use('/api', routerPayment)
app.use('/api', routerWorkspace);
app.use('/api', routerDevTasks);
app.use('/api', routerMessages)
app.use(errorMiddleware);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  }
})

require('./sockets/chat-socket')(io);

const start = async () => {
	try {
		await pool.query('SELECT 1');
		console.log("Connected to PostgreSQL");
		server.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
	} catch (e){
		console.log(e);
	}
}

start()

//npx kill-port 5000 - для удаления процесса на порту 5000