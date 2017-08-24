const getMessages = () => {
    $('#userlist').empty();
    $('#messages').empty();

    $.get('/messages/get', (data) => {
        if (data.done === 'success') {
            
        }
    })
}

$(document).ready(()=> {
    getMessages();
})