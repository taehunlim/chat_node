
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
	const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
	const { roomId } = socket.handshake.query;
	socket.join(roomId);
	console.log('/%s client connected', socket.id)

	socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => { //on: 데이터를 받을때
		console.log("Message from %s", data)
		socketIO
			.in(roomId)
			.emit(NEW_CHAT_MESSAGE_EVENT, data); //emit: 데이터를 보낼때
		// io.emit : 접속된 모든 클라이언트 에게
		// socket.emit : 메세지를 전송한 클라이언트에게만
		// socket.broadcast.emit :  메세지를 전송한 클라이언트를 제외한 모두에게
		// io.to(id).emit : 특정 클라이언트에게만
	});

	// Leave the room if the user closes the socket
	socket.on("disconnect", () => {
		console.log("%s Client disconnected", socket.id)
		socket.leave(roomId);
	});
});