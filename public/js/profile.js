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
        
    })
})