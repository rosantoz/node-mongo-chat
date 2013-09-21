$(document).ready(function () {
    $('#nickNameModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

var socket = io.connect('http://nodechat.dossantos.com.au:8088');
//var socket = io.connect('http://localhost:8088');

socket.on('connect', function (data) {

    $('#nickNameForm').on('submit', function (event) {
        event.preventDefault();
        var nickname = $('#nickname').val();
        if (nickname.length >= 2) {
            socket.emit('join', nickname);
            $('#nickNameModal').modal('hide');
        }
    });

    $('#chatForm').on('submit', function (event) {
        event.preventDefault();
        var chatMessage = $('#chatMessage');
        var message = chatMessage.val();
        chatMessage.val('');
        socket.emit('newMessage', {message: message, date: showDate()});
    });

});

var addUser = function (nickname, joinMessage) {
    var appendUser = '<div data-name="' + nickname + '"><strong>' + nickname + '</strong></div>';
    var message = nickname + ' joined the chat ' + showDate();
    $('#users').append(appendUser);
    socket.emit('userEvent', {nickname: nickname, message: message, date: showDate()});
    if (joinMessage) {
        $('#messages').append('<div><em>' + message + '</em></div>');
    }
}

var removeUser = function (nickname) {
    $('#users').find('div[data-name="' + nickname + '"]').remove();
    var message = nickname + ' left the chat ' + showDate();
    $('#messages').append('<div><em>' + message + '</em></div>');
    socket.emit('userEvent', {message: message, date: showDate()});
}

var addMessage = function (nickname, message) {
    var messages = $('#messages');
    if (nickname.length == 0) {
        messages.append('<div><em>' + message.message + ' ' + message.date + '</em></div>')
    } else {
        messages.append('<div><strong>' + nickname + ':</strong> ' + message.message + ' <small><em>' + message.date + '</em></small></div>');
    }
    messages.scrollTop(messages[0].scrollHeight);
}

var showDate = function () {
    var date = new Date();
    return date.toLocaleString();
}

socket.on('usersConnected', function (users) {
    $('#users').html('');
    users.forEach(function (nickname) {
        addUser(nickname);
    });
});

socket.on('addUser', function (nickname) {
    addUser(nickname, true);
});

socket.on('addMessage', function (nickname, message) {
    addMessage(nickname, {message: message.message, date: message.date});
});

socket.on('removeUser', function (nickname) {
    removeUser(nickname);
});