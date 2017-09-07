const apiKey = 'AIzaSyD3sBJxfVvWi7lTho6zvsaLm_-0zhCdDCI';
const geoMap = $('#geo-map');

const initStaticMap = (lat, lng) =>
  `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=330x280
  &markers=red:yellow%7Clabel:S%7C${lat},${lng}
  &key=${apiKey}&zoom=16`;

$(document).ready(function() {
    if ($('#geo-map').data('latitude') && $('#geo-map').data('longitude')) {
        if ($('#geo-map').data('latitude') && $('#geo-map').data('longitude')) {
            const url = initStaticMap($('#geo-map').data('latitude'), $('#geo-map').data('longitude'));
            geoMap.attr('src', url).removeClass('hidden');
        }
    }

    const userID = $('.actions > a').attr('href').split('/')[2];

    date = $.format.prettyDate(parseInt($('#connected').html()));
    if (typeof date === 'undefined') {
        date = 'Not connected yet';
    }
    $('#connected').html('<span class="glyphicon glyphicon-time" aria-hidden="true"></span>' + `   ${date}`);

    if (parseInt($('#like .badge').html()) > 0) {
        $('#like .glyphicon').removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
    }

    $.get('/user/new/visit/' + userID).done((data) => {
        if (data.done === 'success') {
            console.log('new visitor added');
        } else if (data.done === 'fail') {
            console.log('you have already seen this profile before');
        }
    });

    $.get('/user/get/visits/' + userID).done((data) => {
        if (data.done === 'success') {
            $.each(data.visits, function(index, value) {
                $(`#visits${index} .img`).css('background-image', `url(${value.photo})`);
                $(`#visits${index} h5`).html(value.firstname);
                $(`#visits${index} .location`).html(value.location);
                $(`#visits${index} > a`).attr('href', `/user/${value.id}`);
                $(`#visits${index}`).removeClass('hidden');                
            })
        }
    });

    $.get('/user/get/likes/' + userID).done((data) => {
        if (data.done === 'success') {
            $.each(data.likes, function (index, value) {
                $(`#likes${index} .img`).css('background-image', `url(${value.photo})`);
                $(`#likes${index} h5`).html(value.firstname);
                $(`#likes${index} .location`).html(value.location);
                $(`#likes${index} > a`).attr('href', `/user/${value.id}`);
                $(`#likes${index}`).removeClass('hidden');
            })
        }
    });

    $('thumbnail').on({
        'mouseover': function() {
            $(this).find('.img').css({
                'filter': 'grayscale(1) brightness(0.8)',
                '-webkit-filter': 'grayscale(1) brightness(0.8)',
                '-moz-filter': 'grayscale(1) brightness(0.8)',
                '-o-filter': 'grayscale(1) brightness(0.8)',
                '-ms-filter': 'grayscale(1) brightness(0.8)',
            })
        },
        'mouseout': function() {
            $(this).find('.img').css({
                'filter': 'grayscale(0) brightness(1)',
                '-webkit-filter': 'grayscale(0) brightness(1)',
                '-moz-filter': 'grayscale(0) brightness(1)',
                '-o-filter': 'grayscale(0) brightness(1)',
                '-ms-filter': 'grayscale(0) brightness(1)',
            })
        },
    });

    $('.menu-profile li a').on('click', function() {
        if ($(this).html() === 'About') {
            $('.tab-menu').addClass('hidden');
            $('#tab-about').removeClass('hidden');
            $('.menu-profile li').removeClass('active');
            $(this).closest('li').addClass('active');
        } else if ($(this).html() === 'Photos') {
            $('.tab-menu').addClass('hidden');
            $('#tab-photos').removeClass('hidden');
            $('.menu-profile li').removeClass('active');
            $(this).closest('li').addClass('active');
        } else if ($(this).html() === 'Options') {
            console.log('option tab');
        }
    });

    $('#like').on('click', function() {
        $.post('/like/plusone', {id: userID}).done((data) => {
            if (data.done === 'success') {
                $('like .badge').html(data.likes);
                if (data.likes > 0) {
                    $('like .glyphicon').removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
                } else {
                    $('like .glyphicon').removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');                    
                }
            } else if (data.fail === 'You already like this user') {
                console.log('You already like this user');
            }
            location.reload();        
        })
    });

    $('#report').on('click', (e) => {
        $.post('/report', { id: userID }).done((data) => {
            if (data.done === 'success') {
                console.log('user reported');
            } else {
                console.log('trouble to report user');
            }
        })
        $(location).attr('href', '/profile');
    })

    
});