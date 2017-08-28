$('#notifications').hide();
let open = false;

$('#notifs').on('click', () => {
    if (!open) {
        $('#notifications').slideDown(300);
    } else if (open) {
        $('#notifications').slideUp(300);
        open = false;
    }
});

$('#close-notifs').on('click', () => {
    $('#notifications').slideUp(300);
    open = false;
});

$(document).ready(() => {
    getNotifications();
});

setInterval(() => {
    getNotifications();
}, 10000);

const renderNotif = (type, date, id, name) => {
    let icon = 'bullhorn';
    name = name ? name : 'Someone';
    if (type === 'visit') { icon = 'eye-open'; }
    if (type === 'like') { icon = 'heart'; type='lik'; }
    if (type === 'report') { icon = 'trash'; }
    if (type === 'dislike') { icon = 'flash'; type='dislik'; }
    if (type === 'message') { icon = 'send'; type='messag'; }
    if (type === 'match') { icon = 'fire'; }
    return (`<li class="one notif"><span class="icon-notif glyphicon glyphicon- ${icon} aria-hidden="true"></span><ul class="infos-notifs"><li><a href="/user/${id}">${name}</a><strong>${type}ed</strong> your profile.</li><le class="text-muted"><small><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span> ${$.format.prettyDate(date)}</small></li></ul></li>`);
}

const getNotifications = () => {
    $.get('/notifications')
        .done((data) => {
            if (data.done === 'success') {
                $('#notications .panel-body ul#notif-tab').empty();
                $.each(data.notifs, (i, v) => {
                    $('#notifications .panel-body ul#notif-tab')
                        .append(renderNotif(v.type, v.date, v.userID, v.firstname));
                });
                if (data.notifs && data.otifs.length > 0) {
                    $('#notifs-badge').html(data.notifs.length);
                    $('$notifs .glyphicon-bell').css('color', '#f0ad4e');
                }
            } else {
                console.log('0 notification(s) found in databse');
            }
        }).fail(() => {
            console.log('0 notification(s) found in database');
        })
}