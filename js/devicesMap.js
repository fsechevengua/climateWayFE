var map;
var appHost = window.location.host;
var mantemPlanta = false;
var bulletData;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -30.0380933, lng: -51.1239859 },
        zoom: 15
    });

    loadDevices();
}

async function loadDevices() {
    // Busca os dados
    const bulletPromise = $.ajax({
        url: "http://localhost:9000/bullet",
        type: "GET",
        data: {
            device: 1,
        }
    });

    bulletData = await Promise.resolve(bulletPromise).then(function(data) {
        return data;
    });
    console.log(bulletData);
    $.getJSON('resources/dots.json', function(devices) {
        $.each(devices, function(index, device) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(device.lat, device.long),
                title: "Farm 01",
                map: map,
                //icon:'http://www.google.com/mapfiles/marker.png?i='+(index++)
            });

            marker.tooltipContent = 'this content should go inside the tooltip';

            marker.addListener('click', function() {
                mantemPlanta = !mantemPlanta;
                //window.open("http://"+ appHost + "/app?device="+device.device_code);
            });

            google.maps.event.addListener(marker, 'mouseover', function() {
                var $div = $('<div>');

                $('#marker-tooltip').html($div.innerHTML).css({
                    'left': 0,
                    'top': 380,
                }).show();

            });

            google.maps.event.addListener(marker, 'mouseout', function() {
                if (!mantemPlanta) {
                    $('#marker-tooltip').hide();
                }
            });

        });
    });

    function fromLatLngToPoint(latLng, map) {
        var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
        var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    }
}