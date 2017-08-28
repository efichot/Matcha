function protectEntry(message) {
    message = message.replace(/&/g, '&amp;');
    message = message.replace(/</g, '&lt;');
    message = message.replace(/>/g, '&gt;');
}

const getNewMessages = () => {
    $.get('/messages/get', (data) => {
        if (data === 'success') {
            $('.messages').empty();
            $.each(data.messages, function(index, user) {
                $.each(user.discussion, function(index, message) {
                    let date = $.format.prettyDate(message.date);

                    if (message.type === 'received') {
                        $('#messages .' + user.infos.userID + ' .discussion .messages')
                            .append('<div class="' + user.infos.userID + ' panel-body"><div class="discussion"><div class="messages"></div></div></div>');
                    } else if (message.type === 'sent') {
                        $('#messages .' + user.infos.userID + ' .discussion .messages')
                            .append('<div class="' + user.infos.userID + ' panel-body hidden"><div class="discussion"><div class="messages"></div></div></div>');
                    }
                })
            })
        }
    })
}

const getMessages = () => {
    $('#userlist').empty();
    $('#messages').empty();

    $.get('/messages/get', (data) => {
        if (data.done === 'success') {
            let key = 0;
            $.each(data.messages, (index, user) => {
                $('#userlist').append('<div class="panel panel-default"><div class="panel-body"><div class="media"><div class="media-left"><a href="/user/' + user.infos.userID + '"><div class="img-thumbnail media-object" style="backgroundimage : url(' + user.infos.photo + ');"></div></a></div><div class="media-body"><h4 class="media-heading">' + user.infos.firstname + ', ' + user.infos.lastname + '</h4><a class="btn btn-default btn-xs" href="/user/"' + user.infos.userID + '">Profil</a><button id="' + user.infos.userID + '"type="submit" class="btn btn-warning btn-xs">Messages</button></div></div></div></div>');

                if (key === 0) {
                    $('#messages').append('<div class="' + user.infos.userID + ' panel-body"><div class="discussion"><div class="messages"></div></div></div>');
                } else {
                    $('#messages').append('<div class="' + user.infos.userID + ' panel-body hidden"><div class="discussion"><div class="messages"></div></div></div>');                    
                }

                $.each(user.discussion, (index, message) => {
                    const date = $.format.prettyDate(message.date);

                    if (message.type === 'received') {
                        $(`#messages .${user.info.userID} .discussion .messages`).append('<div class="message-single received pull-left"><span class=img-circle style="background-image : url(' + user.infos.photo + ');"></span><p class=message-content">' + message.message + '</p><small class="text-muted">Received ' + date + '</small></div>');
                    } else if (message.type === 'sent') {
                        $(`#messages .${user.info.userID} .discussion .messages`).append('<div class="message-single sent pull-right"><p class=message-content">' + message.message + '</p><small class="text-muted">Received ' + date + '</small></div>');                  
                    }
                });

                $('#messages .' + user.infos.userID + ' .discussion').append('<div id="send-message"><div class="form-group"><textarea class="form-control" rows="2" id="message"></textarea><button type="submit" class="btn btn-warning ' + user.infos.userID + '">Send my message</button></div></div>');

                $('button#' + user.infos.userID).on('click', () => {
                    $('messages .panel-body').addClass('hidden');
                    $('messages .' + user.infos.userID).removeClass('hidden');                    
                });

                $('button.' + user.infos.userID).on('click', () => {
                    const newMessage = $(this).prev('textarea.form-control').val();
                    newMessage = protectEntry(newMessage);

                    if (newMessage) {
                        $.post('/message/post', { message: newMessage, toID: user.infos.userID })
                            .done((data) => {
                                if (data.done === 'success') {
                                    getMessages();
                                }
                            })
                    }
                })
                key++;
            })
        }
    })
}

$(document).ready(()=> {
    getMessages();
})

setInterval(() => {
    getNewMessages();
}, 10000);