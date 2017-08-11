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
})