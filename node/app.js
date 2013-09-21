var express = require('express')
    , app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server)
    , messageModel = require('./messageModel')
    , clients = [];

io.sockets.on('connection', function (client) {

    messageModel.message.find().limit(10).sort({_id: -1}).exec(function (err, results) {
        results.reverse();
        results.forEach(function (message) {
            client.emit('addMessage', message.nickname, message);
        });
    });

    client.on('join', function (name) {

        clients.push(name);
        clients.sort();
        client.emit('usersConnected', clients);

        client.set('nickname', name);
        client.broadcast.emit('addUser', name);

    });

    client.on('newMessage', function (message) {
        client.get('nickname', function (error, nickname) {
            client.broadcast.emit('addMessage', nickname, message);
            client.emit('addMessage', nickname, message);
            messageModel.message.create({
                nickname: nickname,
                message : message.message,
                date    : message.date
            }, function (err, rs) {
                console.log(err);
            });
        });
    });

    client.on('removeUser', function () {
        client.get('nickname', function (error, nickname) {
            client.broadcast.emit('removeUser', nickname);
            client.emit('removeUser', nickname);
        });
    });

    client.on('disconnect', function () {

        client.get('nickname', function (error, nickname) {
            clients.splice(clients.indexOf(nickname), 1);
            client.broadcast.emit('removeUser', nickname);
            client.emit('removeUser', nickname);
        });

    });

    client.on('userEvent', function (message) {
        messageModel.message.create({
            nickname: '',
            message : message.message,
            date    : message.date
        }, function (err, rs) {
            console.log(err);
        });
    });

});

server.listen(8088);