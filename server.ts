
require('dotenv').config();

import * as express from "express"
const app = express();
const http = require('http').createServer(app);

const morgan = require ('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const errorHandler = require('./_middleware/error-handler');

// DB Connection
require('./_middleware/db');

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if(process.env.NODE_ENV === 'development') {
	app.use(cors({
		origin: process.env.CLIENT_URL_TEST
	}))
	app.use(morgan('dev'))
} else {
	app.use(cors({
		origin: process.env.CLIENT_URL
	}))
}

// global error
app.use(errorHandler);

const port = process.env.PORT;

http.listen(port, () => console.log(`server running on port ${port}`));

const socketIO = require('socket.io')(http, {
	cors: {
		origin: "*"
	}
});

socketIO.on('connection', socket => {
	const { roomId } = socket.handshake.query;
	socket.join(roomId);
	console.log('/%s client connected', socket.id)
});