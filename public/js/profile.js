const userID = $('.actions a').attr('href').split('/')[2];
const geoMap = $('#geo-map');
const lat = geoMap.data('latitude');
const lng = geoMap.data('longitude');
const apiKey = 'AIzaSyD3sBJxfVvWi7lTho6zvsaLm_-0zhCdDCI';

const initStaticMap = (lat, lng) =>
    `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=330x280
    &markers=red:yellow%7Clabel:S%7C${lat},${lng}
    &key=${apiKey}&zoom=16`;

$(document).ready(() => {
    if (navigator.onLine) {
        $('#connected').html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Yes');
    }

    $.get('/set/connection');

    if (lat && lng) {
        const url = initStaticMap(lat, lng);
        geoMap.attr('src', url).removeClass('hidden');
    }

    if (parseInt($('#like .badge').html(), 10) > 0) {
        $('#like glyphicon').removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
    }

    $.get(`/user/new/visit/${userID}`).done((data) => {
        if (data.done === 'success') {
            console.log('new visitor add');
        }
        if (data.done == 'already') {
            console.log('you have already seen this profile before');
        }
    })

    $.get(`/user/get/visits/${userID}`).done((data) => {
        if (data.done === 'success') {
            $.each(data.visits, (v, i) => {
                $('#visit' + i + ' .img').css('background-image', 'url(' + v.photo + ')');
                $('#visit' + i + ' h5').html(v.firstname);
                $('#visit' + i + ' .location').html(v.location);
                $('#visit' + i + ' a').attr('href', '/user/' + v.id);
                $('#visit' + i).removeClass('hidden');
            })
        }
    })

    $.get(`/user/get/likes/${userID}`).done((data) => {
        if (data.done === 'success') {
            $.each(data.likes, (v, i) => {
                $('#like' + i + ' .img').css('background-image', 'url(' + v.photo + ')');
                $('#like' + i + ' h5').html(v.firstname);
                $('#like' + i + ' .location').html(v.location);
                $('#like' + i + ' a').attr('href', '/user/' + v.id);
                $('#like' + i).removeClass('hidden');
            })
        }
    })

    $.get(`/popularity/${userID}`).done((data) => {
        if (data.done === 'success' && typeof data.score !== 'undefined') {
            $('#popularity').html(data.score + '%');
        }
    });

    function protectEntry(message) {
        message = message.replace(/&/g, '&amp;');
        message = message.replace(/</g, '&lt;');
        message = message.replace(/>/g, '&gt;');
        return message;
    }

    $('#update-location').on('click', () => {
        $('$span-location').html('Please wait while we are fetching data ...');
        $('#update-location').attr('disabled', true);
        $.geolocation.get().done((position) => {
            console.log('geolocation enabled');
            $.post('/location', position.coords).done((data) => {
                console.log(data.address);
                $('#span-location').html(data.address);
                $('#update-location').removeAttr('disabled');
                const url = initStaticMap(position.coords.latitude, position.coords.longitude);
                geoMap.attr('src', url).removeClass('hidden');
            })
        }).fail(() => {
            console.log('geolocation disabled');
            $.get('/location').done((data) => {
                $('#span-location').html(`${data.city}, ${data.country}`);
                $('#update-location').removeAttr('disabled');
                const url = initStaticMap(data.latitude, data.longitude);
                geoMap.attr('src', url).removeClass('hidden');
            });
        });
    });

    $('.thumbnail').on({
        'mouseover': function() {
            $(this).find('.img').css({
                'filter': 'graysale(1) brightness(0.8)',
                '-webkit-filter': 'graysale(1) brightness(0.8)',
                '-moz-filter': 'graysale(1) brightness(0.8)',
                '-o-filter': 'graysale(1) brightness(0.8)',
                '-ms-filter': 'graysale(1) brightness(0.8)',                
            })
        },
        'mouseout': function() {
            $(this).find('.img').css({
                'filter': 'graysale(0) brightness(1)',
                '-webkit-filter': 'graysale(0) brightness(1)',
                '-moz-filter': 'graysale(0) brightness(1)',
                '-o-filter': 'graysale(0) brightness(1)',
                '-ms-filter': 'graysale(0) brightness(1)',
            })
        }
    });

    $('#btn-edit-bio').on('click', function() {
        $(this).addClass('hidden');
        $('#span-bio').addClass('hidden');
        $('#bio-area-edit').removeClass('hidden');
    });

    $('#bio-area-button').on('click', function() {
        const biography = protectEntry($('#textarea-bio').val());

        $.post('/biography/update', { biography }).done((data) => {
            if (data.done === 'success') {
                $('#bio-area-edit').addClass('hidden');
                $('#btn-edit-bio').removeClass('hidden');
                $('#span-bio').html(biography).removeClass('hidden');        
            }
        }).fail(() => {
            console.log('post error');
        })
    })

    function validateUser(name) {
        const regex = /^([a-zA-Z\-0-9èêéàôîïùñ]{2,17})$/;
        return regex.test(name);
    }

    function validateEmail(email) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }

    $('#edit-first-last').on('click', () => {
        $('#first-last').addClass('hidden');
        $('#form-firts-last').removeClass('hidden');
    });

    $('#change-first-last').on('click', () => {
        const info = {
            fistname: protectEntry($('#first-input').val()),
            lastname: protectEntry($('#last-input').val()),
        }
        if (validateUser(info.firstname) && validateUser(info.lastname)) {
            $.post('/name/update', info).done((data) => {
                if (data.done === 'success') {
                    $('#user-first').html(info.firstname);
                    $('#user-last').html(info.lastname);
                    $('#form-first-last').addClass('hidden');
                    $('#first-last').removeClass('hidden');
                } else {
                    $('#form-first-last').addClass('has-error');
                }
            }).fail((err) => {
                if (err) {
                    $('#form-first-last').addClass('has-error');
                }
            })
            
        } else {
            $('#form-first-last').addClass('has-error');
        }
    });

    $('#edit-mail').on('click', () => {
        $('#mail').addClass('hidden');
        $('#form-mail').removeClass('hidden');
    });

    
})