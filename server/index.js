// const server = require('http').createServer();
// const io = require('socket.io')(server);
// io.on('connection', client => {
//   client.on('event', data => { /* … */ });
//   client.on('disconnect', () => { /* … */ });
// });
// server.listen(3000);

const { instrument } = require('@socket.io/admin-ui')
const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://localhost:8080', 'https://admin.socket.io'],
    }
});

const userIO = io.of('/user');

userIO.on('connection', socket => {
    console.log('connected to user socket : ' + socket.username)
})

// middlewares for  authentication
userIO.use((socket, next) => {
    if (socket.handshake.auth.token) {
        socket.username = getUserNameFromToken(socket.handshake.auth.token)
        next()
    }
    else {
        next(new Error("Provide token"))
    }
})

function getUserNameFromToken(token) {
    return token;
}

io.on('connection', socket => {
    console.log(socket.id);
    // socket.on('event-name', (number, string, obj) => {
    //     console.log(number, string, obj);
    // })


    socket.on('send-message', (message, room) => {
        // io.emit('received-message', message); // here what happens is that the message from client 1 ,is actively listened by the server (not only client 1 ) , 
        if (room === '') {
            socket.broadcast.emit('received-message', message); // this braodcasts the message to every other socket except itself..
        }
        else {
            socket.to(room).emit('received-message', message);
        }
        // console.log(message);

    })
    socket.on('join-room', (room, cb) => {
        socket.join(room);
        cb(`Joined ${room}`); // callback function to the client side 
    })
    socket.on('ping', n => console.log(n));
})

instrument(io, { auth: false })