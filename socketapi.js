const io = require("socket.io")();
const userModel = require('./routes/users')
const messageModel = require('./routes/message')
const socketapi = {
    io: io
};

io.on("connection", function (socket) {

    socket.on('join-server', async function (username) {
        await userModel.findOneAndUpdate({
            username
        }, {
            socketId: socket.id
        })
    })

    socket.on('send-private-message', async function(messageObject) {
        await messageModel.createStrategy({
            receiver: messageObject.receiver,
            data: messageObject.message,
            sender: messageObject.sender
        })

        const receiver = await userModel.findOne({
            username:messageObject.receiver
        })

        console.log(receiver)

        socket.to(receiver.socketId).emit('receive-private-message', messageObject)

    })

})

module.exports = socketapi;