var map;
var appHost = window.location.host;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -30.0380933, lng: -51.1239859},
        zoom: 15
    });

    loadDevices();
}

function loadDevices() {
    $.getJSON('resources/dots.json', function(devices) {
        $.each(devices, function(index, device) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(device.lat, device.long),
                title: "Ponto 1",
                map: map
            });
            marker.addListener('click', function() {
                
                window.open("http://"+ appHost + "/app?device="+device.device_code);
            });
        });
    });
}