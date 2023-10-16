import { io } from 'socket.io-client'

const joinRoomBtn = document.getElementById("join-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");

const socket = io("http://localhost:3000")
const userSocket = io("http://localhost:3000/user", { auth: { token: "Test" } });

// if error persists
userSocket.on('connect_error', error => {
    displayMessage(error)
})

// every time when there is a connection between the client and the server
socket.on('connect', () => {
    displayMessage(`Connected to ${socket.id}`)
    // socket.emit('event-name', 10, 'HI ', { key: 'value' })
})

// the following --- it sends the request messages to the server ( custom-event-name , args[] data ) here the arguments are of any type..
// socket.emit('event-name', 10, 'HI ', { key: 'value' })

socket.on('received-message', (message) => {
    displayMessage(message)
})

form.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;

    if (message === "") return;
    displayMessage(message);
    socket.emit('send-message', message, room);
    messageInput.value = "";
})

joinRoomBtn.addEventListener('click', () => {
    const room = roomInput.value;
    // a callback function can be passed as a parameter to emit to the server .... essentially calling the server from client and client from the server...
    socket.emit('join-room', room, message => {
        displayMessage(message)
    });
})

function displayMessage(message) {
    const div = document.createElement("div");
    div.textContent = message;
    document.getElementById("message-box").append(div);
}

let count = 0;
setInterval(() => {
    // volatile -- used when not able to send messages .. essentially the messgages that are send there is no connection are skipped ... without this all messeges are sent just like with ping here...
    socket.volatile.emit('ping', ++count);
    // socket.emit('ping', ++count);
}, 1000);

document.addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    if (e.key === 'c') socket.connect();
    if (e.key === 'd') socket.disconnect();
})