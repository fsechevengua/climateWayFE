var dataX = [];
//var weatherDate = $.format.date(new Date(), "yyyy-MM-dd");
var weatherDate = "2017-09-18";
var weatherCache;
var sensorOrder = [2, 6, 32, 3, 7, 7, 7, 4, 34, 33, 7];

$(document).ready(function () {
    makeWeatherData();
});
//Gerar gráfico em diálogo
var dialogData;
var dataYDialog;

function generateChartDialog(DropAreaId, chartType, dataY) {
    dialogData = [dataX];
    dataYDialog = dataY.slice();
    var dataWihoutLabel = dataYDialog.splice(1, dataYDialog.length);
    dialogData.push(dataY);
    c3.generate({
        bindto: "#" + DropAreaId,
        size: {
            height: 600,
            width: 950
        },
        data: {
            x: 'x',
            xFormat: '%H:%M',
            columns: dialogData,
            type: 'line'
        },
        zoom: {
            enabled: true
        },
        axis: {
            x: {
                type: 'timeseries',
                localtime: true,
                tick: {
                    format: '%H:%M'
                },
                y: {
                    max: Math.max.apply(Math, dataWihoutLabel) + 1,
                    min: Math.min.apply(Math, dataWihoutLabel),
                }
            }
        }
    });
};

//Trocar tipo de gráfico
$(".chart-type").on('change', function () {
    $("select option:selected").each(function () {
        var dataWihoutLabel = dataYDialog.splice(1, dataYDialog.length);
        c3.generate({
            bindto: "#chart-modal",
            size: {
                height: 600,
                width: 950
            },
            data: {
                x: 'x',
                xFormat: '%H:%M',
                columns: dialogData,
                type: $(this).val()
            },
            zoom: {
                enabled: true
            },
            axis: {
                x: {
                    type: 'timeseries',
                    localtime: true,
                    tick: {
                        format: '%H:%M'
                    },
                    y: {
                        max: Math.max.apply(Math, dataWihoutLabel) + 1,
                        min: Math.min.apply(Math, dataWihoutLabel),
                    }
                }
            }
        });
    });
});


//Cruzamento de dados
var viewData = [];

function generateChartDrop(DropAreaId, chartType, dataY) {
    if (viewData.length == 0)
        viewData = [dataX];
    var dataYAux = dataY.slice();
    var dataWihoutLabel = dataYAux.splice(1, dataYAux.length);
    viewData.push(dataY);
    c3.generate({
        bindto: "#" + DropAreaId,
        data: {
            x: 'x',
            xFormat: '%H:%M',
            columns: viewData
        },
        zoom: {
            enabled: true
        },
        axis: {
            x: {
                type: 'timeseries',
                localtime: true,
                tick: {
                    format: '%H:%M'
                },
                y: {
                    max: Math.max.apply(Math, dataWihoutLabel) + 1,
                    min: Math.min.apply(Math, dataWihoutLabel),
                }
            }
        }
    });
}

$("#myModal").on('show.bs.modal', function (ev) {
    d3.select("#chart-modal svg").remove();
    var gridNumber = ev.relatedTarget.id
    var weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
    var sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
    $('#chart-modal').html("<div style='text-align: center; width: 950px; height: 600px; line-height: 600px; font-size: 30px;'><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
    getWeatherData(weatherVarName, sensor_code, "chart-modal");
});

$("#myModal").on('hidden.bs.modal', function () {
    d3.select("#chart-modal svg").remove();
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, ui) {
    ev.preventDefault();
    $('.chart-area').html("<div id=\"timeSeriesArea5\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" class=\"drag-text\"><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
    var gridNumber = ev.dataTransfer.getData("text");
    var weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
    var sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
    getWeatherData(weatherVarName, sensor_code, ev.currentTarget.id);
}

$('body').on('click', '.clear-drag-area', function(){
    viewData = [];
    $('.chart-area').html(
        '<div id="timeSeriesArea5" ondrop="drop(event)" ondragover="allowDrop(event)" class="drag-text">'+
            '<span>Drag Here to generate chart</span>'+
        '</div>'
    );
});

function generateLightnessBar(data) {
    var light = data;
    $('.progress-bar').gradientProgressBar({
        value: light * 100 / 100000, // percentage
        size: 150, // width
        fill: { // gradient fill
            gradient: ["yellow", "orange", "black"]
        }
    });
}

$('#datetimepicker1').datetimepicker({
    keepOpen: false,
    format: 'DD/MM/YYYY',
    useCurrent: true,
    defaultDate: new Date()
});

var changeDate = 0;

$("#selectdatemode").on('change', function () {
    var format = $("#selectdatemode option:selected").val();
    var viewModes = {};
    viewModes['DD/MM/YYYY'] = 'days';
    viewModes['YYYY'] = 'years';
    viewModes['MM/YYYY'] = 'years';
    $('#datetimepicker1').data('DateTimePicker').format(format);
    $('#datetimepicker1').data('DateTimePicker').viewMode(viewModes[format]);
});

$("#datetimepicker1").on("dp.change", function (e) {
    e.preventDefault();
    var formatConverter = {};
    formatConverter['YYYY'] = 'YYYY'
    formatConverter['MM/YYYY'] = 'YYYY-MM';
    formatConverter['DD/MM/YYYY'] = 'YYYY-MM-DD';

    var format = $("#datetimepicker1").data("DateTimePicker").date()._f;
    var date = $("#datetimepicker1").data("DateTimePicker").date().format(formatConverter[format]);

    if (changeDate === 0) {
        changeDate = 1;
        generateLightnessBar(200);
    } else {
        changeDate = 0;
        generateLightnessBar(560);
    }

    weatherDate = date;

    loadTableData();
});

document.addEventListener("getWeatherData", function (e) {
    var result = e.detail;
    var dataY = result.data;
    //Limpa a variável x para receber as novas datas
    dataX = [];
    dataX.push("x");
    dataX = dataX.concat(result.dates);
    if (result.target == "timeSeriesArea5") {
        generateChartDrop(result.target, "area", dataY);
        $("#timeSeriesArea5").removeClass("drag-text");
    } else {
        generateChartDialog(result.target, "area", dataY);
    }
});

function getWeatherData(weatherVarName, sensor_code, target) {
    var weatherDataCall = $.ajax({
        url: "http://localhost:9000/dateWeatherData",
        type: "POST",
        data: {
            date: weatherDate,
            sensor_code: sensor_code
        }
    });
    var targetCellDrop = target;
    var weatherName = weatherVarName;
    var weatherDataPromise = Promise.resolve(weatherDataCall).then(function (data) {
        var resObject = {
            data: [weatherName],
            dates: [],
            target: ""
        };
        resObject.target = targetCellDrop;
        resObject.name = weatherName;
        data.payload.forEach(function (result) {
            resObject.data.push(result.payload);
            resObject.dates.push($.format.date(result.ts, "HH:mm"));
        });

        //Trigger event to send data to create chart
        var event = new CustomEvent("getWeatherData", {
            "detail": resObject
        });
        document.dispatchEvent(event);
    }, function (value) {});
}

function getRaining() {
    var data = 1; //get data in database;
    if (data == 1)
        return "Sim";
    else
        return "Não";
}

function loadTableData() {
    // Line one 
    $(".celcius-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[0])[1]);
    $(".pressure-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[1])[1]);
    $(".humidity-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[2])[1]);

    // Line two
    $('.towards-90-deg').removeClass('towards-90-deg').addClass('towards-' + getWeatherDataFromResult(weatherCache.payload, sensorOrder[3])[0] + '-deg');
    $(".wind-direction-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[3])[1]);
    $(".wind-speed-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[3])[1]);
    generateLightnessBar(635);
    $(".luminocity-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[4])[1]);
    $(".uv-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[4])[1]);
    $(".co2-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[5])[1]);

    // Line three
    $(".so2-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[6])[1]);
    $(".pm-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[7])[1]);
    $(".water-level-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[8])[1]);

    //Line four
    $(".pricipitation-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[9])[1]);
    $(".co-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[10])[1]);
    $(".raining-data").html(getRaining());
}

$("#dayslist a").click(function (e) {
    e.preventDefault()
    weatherDate = $.format.date(new Date(this.innerHTML), "yyyy-dd-MM");
    $(this).tab('show')
    if (changeDate === 0) {
        changeDate = 1;
        generateLightnessBar(200);
    } else {
        changeDate = 0;
        generateLightnessBar(560);
    }
    loadTableData();
})

$("li[role='presentation'] a").each(function (index) {
    var now = new Date();
    now.setDate(now.getDate() + index - 6);
    now = $.format.date(now, "dd/MM/yyyy");
    this.append(now);
});


function getWeatherDataFromResult(data, sensorCode) {
    var result = ['sample'];
    $.each(data, function (i, val) {
        if (val.sensor_code == sensorCode)
            result.push(val.payload);
    });
    return result;
};

function makeWeatherData(dateParam) {

    if(!dateParam){
        dateParam = weatherDate;
    }

    var weatherDataCall = $.ajax({
        url: "http://localhost:9000/weatherData",
        type: "GET",
        data: {
            date: dateParam,
        }
    });

    var weatherDataPromise = Promise.resolve(weatherDataCall).then(function (data) {
        weatherCache = data;
        var colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
        for (i = 0; i < 11; i++) {
            var weatherDta = getWeatherDataFromResult(data.payload, sensorOrder[i]);
            var minichart = c3.generate({
                bindto: "#minicharttest" + i,
                size: {
                    height: 60,
                    width: 200
                },
                data: {
                    columns: [
                        weatherDta
                    ],
                    type: 'area-spline',
                },
                axis: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false
                    }
                },
                legend: {
                    show: false
                },
                color: {
                    pattern: [colors[Math.floor(Math.random() * colors.length)]]
                },
                point: {
                    show: false
                }

            });
        }
        loadTableData();
    });
};