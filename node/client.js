$(document).ready(function () {
    $('#nickNameModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

var socket = io.connect('http://nodechat.dossantos.com.au:8088');

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

var addUser = function (nickname) {

    var appendUser = '<div data-name="' + nickname + '"><strong>' + nickname + '</strong></div>';

    $('#users').append(appendUser);
    $('#messages').append('<div><em>' + nickname + ' joined the chat ' + showDate() + '</em></div>');
}

var removeUser = function (nickname) {
    $('#users').find('div[data-name="' + nickname + '"]').remove();
    $('#messages').append('<div><em>' + nickname + ' left the chat ' + showDate() + '</em></div>');
}

var addMessage = function (nickname, message) {
    var messages = $('#messages');
    messages.append('<div><strong>' + nickname + ':</strong> ' + message.message + ' <small><em>' + message.date + '</em></small></div>');
    messages.scrollTop(messages[0].scrollHeight);
}

var showDate = function () {
    var date = new Date();
    return date.toLocaleString();
}

socket.on('usersConnected', function (users) {
    users.forEach(function (nickname) {
        addUser(nickname);
    });
});

socket.on('addUser', function (nickname) {
    addUser(nickname);
});

socket.on('addMessage', function (nickname, message) {
    addMessage(nickname, {message: message.message, date: message.date});
});

socket.on('removeUser', function (nickname) {
    removeUser(nickname);
});