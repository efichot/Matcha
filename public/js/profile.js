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
});

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

$('#change-mail').on('click', () => {
    const mail = protectEntry($('#mail-input').val());

    if (validateMail(mail)) {
        $.post('/mail/update', mail).done((data) => {
            if (data.done === 'success') {
                $('#user-mail').html(mail);
                $('#form-mail').addClass('hidden');
                $('#mail').removeClass('hidden');
            } else {
                $('#form-mail').addClass('has-error');
            }
        })
    } else {
        $('#form-mail').addClass('has-error');
    }
});

$('#edit-sex').on('click', () => {
    $('#sex').addClass('hidden');
    $('#form-sex').removeClass('hidden');
});

$('#select-sex').on('click', () => {
    if ($('.gender-input:checked').val()) {
        const data = { sex: $('.gender-input:checked').val() };
        if (data.sex === 'Male' || data.sex === 'Female' || data.sex === 'Other') {
            $.post('/sex/update', data).done((data) => {
                if (data.done === 'success') {
                    $('#span-sex').html($('#.gender-input:checked').val());
                    $('#form-sex').addClass('hidden');
                    $('#sex').removeCLass('hidden');
                }
            })
        }
    }
})

$('#edit-orientation').on('click', () => {
    $('#orientation').addClass('hidden');
    $('#form-orientation').removeClass('hidden');
});

$('#select-orientation').on('click', () => {
    if ($('.orientation-input:checked').val()) {
        const data = { orientation: $('.orientation-input:checked').val() };
        if (data.orientation === 'Straight' || data.orientation === 'Gay' || data.orientation === 'Bisexual') {
            $.post('/orientation/update', data).done((data) => {
                if (data.done === 'success') {
                    $('#span-orientation').html($('#.gender-input:checked').val());
                    $('#form-orientation').addClass('hidden');
                    $('#orientation').removeCLass('hidden');
                }
            })
        }
    }
})

const supprTag = () => {
    $('.btn-tag').on({
        'mouseover': function() {
            $(this).find('span-glyphicon')
                .removeClass('glyphicon-tag')
                .addClass('glyphicon-minus-sign');
        }, 'mouseout': function () {
            $(this).find('span-glyphicon')
                .removeClass('glyphicon-minus-sign')
                .addClass('glyphicon-tag');
        }, 'click': function () {
            const current = $(this);
            $.post('/interest/delete', { delete: current.find('.span-interest').html() }).done((data) => {
                if (data.done === 'success')
                    current.remove();
            });
        }
    })
}

supprTag();

function prepareInterests(interests) {
    let toPrint = '';
    $.each(interests, (i, v) => {
        toPrint += '<button type="button" class="btn btn-warning btn-xs btn-tag"><span class="glyphicon glyphicon-tag" aria-hidden="true"></span><span class="span-interest">' + v + '</span></button>';
    });
    return toPrint;
}

function validateInterest(interest) {
    const regex = /^([a-zA-Z\-]{1,17})$/;
    return  regex.test(interest);
}

$('#add-interest').on('click', function() {
    $('.input-interest').val('');
    $(this).addClass('hidden');
    $('#form-interests').removeClass('hidden');
    $.get('/interests/list').done((data) => {
        $('#list-interests').empty();
        $.each(data.list, (i, v) => {
            $('#list-interests').append(`<option value="${v}">`);
        })
    })
})

$('#new-interest').on('click', () => {
    if ($('.input-interest').val() && validateInterest(protectEntry($('.input-interest').val()))) {
        $('#form-interests').removeClass('has-error');
        const data = {
            newInterest: protectEntry($('.input-interest').val()),
        }
        $.post('/interest/add', data).done((data) => {
            if (data.done === 'success') {
                $('#interests').empty().html(prepareInterests(data.interests));
                supprTag();
                $('#add-interest').removeClass('hidden');
                $('#form-interests').addClass('hidden');
            } else {
                $('#form-interests').addClass('has-error');
            }
        });
    } else {
        $('#form-interests').addClass('has-error');            
    }
});

const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];

$('#btn-cover: file').on('change', (e) => {
    if (e.target.files.length) {
        const fileType = e.target.files[0].name.split('.').pop().toLowerCase();

        if (allowedTypes.indexOf(fileType) > 0) {
            const file = e.target.files[0],
                reader = new FileReader();

            $(reader).on('load', () => {
                $.post('/cover/upload', { cover: reader.result })
                    .done((data) => {
                        if (data.done === 'success')
                            $('.header-picture').css('background-image', 'url("' + reader.result + '")');
                    })
            });
            reader.readAsDataURL(file);
        }
    }
});

$('.change-photo :file').on('change', function (e) {
    if (e.target.files.length) {
        const fileType = e.target.files[0].name.split('.').pop().toLowerCase(),
            indexPhoto = $(this).data('index');

        if (allowedTypes.indexOf(fileType) > 0) {
            const file = e.target.files[0],
                reader = new FileReader();

            $(reader).on('load', () => {
                $.post('/photo/upload', {
                    photo: reader.result,
                    index: indexPhoto,
                })
                    .done((data) => {
                        if (data.done === 'success')
                            $(`#${imgIndex} .img`).css('background-image', `url(${reader.result})`)
                    })
            });
            reader.readAsDataURL(file);
        }
    }
});

$('#make-default').on('click', () => {
    const imgIndex = $(this).data('index');

    $.get('/photo/set' + imgIndex)
        .done((data) => {
            if (data.done === 'success') {
                $('#profile-pic').css('backgroung-image', `url(${data.photo})`);
            }
        });
});

$('.delete-photo').on('click', () => {
    const imgIndex = $(this).data('index');

    $.get(`/photo/delete/${imgIndex}`)
        .done((data) => {
            if (data.done === 'success') {
                $(`#${imgIndex} .img`).css('background-image', `url("http://fakeimg.pl/300x300/")`);
            } else {
                console.log(data.fail);
            }
        });
});

$('.menu-profile li a').on('click', function() {
    if ($(this).html() === 'About') {
        $('.tab-menu').addClass('hidden');
        $('#tab-about').removeClass('hidden');
        $('.menu-profile li').removeClass('active');
    } else if ($(this).html() === 'Photos') {
        $('.tab-menu').addClass('hidden');
        $('#tab-photos').removeClass('hidden');
        $('.menu-profile li').removeClass('active');
    } else if ($(this).html() === 'Reported users') {
        $('.tab-menu').addClass('hidden');
        $('#tab-report').removeClass('hidden');
        $('.menu-profile li').removeClass('active');
    }
})