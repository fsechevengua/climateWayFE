function getCelcius() {
    var data = 29;//get data in database;
    return data;
 }

function getPressure() {
    var data = 1.02;//get data in database;
    return data;
}

function getHumidity() {
    var data = "94%";//get data in database;
    return data;
 }

function getPrecipitation() {
    var data = 101;//get data in database;
    return data;
}

function getWindDirection() {
    var data = 145;//get data in database;
    return data;
}

function getWindSpeed() {
    var data = 11;//get data in database;
    return data;
}

function getLuminocity() {
    var data = 635;//get data in database;
    return data;
}

function getWaterLevel(){
    var data = 38;//get data in database;
    return data;
}

function getUV() {
    var data = 3;//get data in database;
    return data;
}

function getCO2() {
    var data = 29;//get data in database;
    return data;
}

function getCO() {
    var data = 29;//get data in database;
    return data;
}

function getSO2() {
    var data = 29;//get data in database;
    return data;
}

function getPM(){
    var data = 1000;//get data in database;
    return data;
}
function getRaining(){
    var data = 1;//get data in database;
    if(data == 1)
        return "Sim";
    else
        return "Não";
}

$(document).ready(function(){
 console.log(changeDate)
 $(".celcius-data").append(getCelcius());
 $(".pressure-data").append(getPressure());
 $(".humidity-data").append(getHumidity());
 $(".precipitation-data").append(getPrecipitation());
 $('.towards-90-deg').removeClass('towards-90-deg').addClass('towards-' + getWindDirection() + '-deg');
 $(".wind-direction-data").append(getWindDirection());
 $(".wind-speed-data").append(getWindSpeed());
 $(".luminocity-data").append(getLuminocity());
 $(".uv-data").append(getUV());
 $(".co2-data").append(getCO2());
 $(".co-data").append(getCO());
 $(".so2-data").append(getSO2());
 $(".pm-data").append(getPM());
 $(".water-level-data").append(getWaterLevel());
 $(".pricipitation-data").append(getPrecipitation());
 $(".raining-data").append(getRaining());
});