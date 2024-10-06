var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path'); 
var port = 8080; 

var connections = [];
var users = [];
var messages = []; 

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'auth.html')); 
});

app.get('/:id', function (req, res) {

    if (req.params.id == 'client.js') {
        res.sendFile(path.join(__dirname, 'client.js'));
    }
    else if (req.params.id == 'favicon.ico') {
        res.sendStatus(404); 
    }
    else {

        users.push(req.params.id);
        res.sendFile(path.join(__dirname, 'index.html'));
    }
   
})

// установка соединения
io.on('connection', function (socket) {
   
    connections.push(socket);
    console.log(users)
    console.log('Connected: %s sockets connected', connections.length);

    // окончание соединения 
    socket.on('disconnect', function (data) {
 
        var index = connections.indexOf(socket) 
        users.splice(index, 1);

        // обновить список пользователей на клиенте 
        io.sockets.emit('users loaded', { users: users })

        console.log('Disconnected: %s sockets connected', connections.length);
    });

    // обработка сообщения 
    socket.on('send message', function (data) {
        messages.push(data);
        io.sockets.emit('chat message', data);
    });

    socket.on('load users', function () {
        console.log(users)
        io.sockets.emit('users loaded', { users: users })
    });

    socket.on('load messages', function () {
        socket.emit('messages loaded', { messages: messages })
    });

    socket.emit('new user', { name: users[users.length - 1] });

}); 

server.listen(port, function () {
    console.log('app running on port ' + port);
})