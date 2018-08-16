var appHost = window.location.host;
var dataX = [];
//var weatherDate = $.format.date(new Date(), "yyyy-MM-dd");
var weatherDate = "2017-09-18";
var weatherCache;
var sensorOrder = [2, 6, 32, 3, 7, 7, 7, 4, 34, 33, 7];
var device = getUrlParameter('device');

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

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

$(document).on('change', ".chart-type", function () {
    generateChartDrop('timeSeriesArea5', $(this).val(), new Array);
});

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[1];
    var maxIndex = 0;

    for (var i = 2; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex - 1;
}

function indexOfMin(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[1];
    var minIndex = 0;

    for (var i = 2; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return minIndex - 1;
}

//Cruzamento de dados
var viewData = [];

function generateChartDrop(DropAreaId, chartType, dataY) {
    if (viewData.length == 0)
        viewData = [dataX];
    //Remove o x para substituir pelo novo eixo x que veio do servidor
    viewData.shift();
    viewData.unshift(dataX);

    let dataYAux = dataY.slice();
    let dataWihoutLabel = dataYAux.splice(1, dataYAux.length);
    viewData.push(dataY);
    
    let total = 0;
    let media = 0;
    // Cálcula o total e média dos valores do gráfico

    let medias = [];
    for(let i = 1; i < viewData.length; i++)
    {
        total = viewData[i].reduce(function(Acumulador, valorAtual, indice) {
            if(indice != 1)
                return Acumulador + valorAtual;
            else 
                return valorAtual;
        });
        media = total / (viewData[1].length - 1);

        medias.push({value: media, class: 'linha-media', text: 'Média: '+media.toFixed(2)});
    }

    //const min = indexOfMin(viewData[1]);
    //const max = indexOfMax(viewData[1]);
    
    const max = d3version3.max(viewData, function(arrayMax,index) {
        if(index != 0){
            let dataYAuxMax = arrayMax.slice();
            let dataWihoutLabelMax = dataYAuxMax.splice(1, dataYAuxMax.length);
            return d3version3.max(dataWihoutLabelMax);
        }
    });

    const min = d3version3.min(viewData, function(arrayMin, index) {
        if(index != 0){
            let dataYAuxMin = arrayMin.slice();
            let dataWihoutLabelMin = dataYAuxMin.splice(1, dataYAuxMin.length);
            return d3version3.min(dataWihoutLabelMin);
        }
    });
    
    if(dataYAux[0] == 'Vento'){
        dotDirecao = $('.c3-shapes-Vento circle')
    }

    c3.generate({
        bindto: "#" + DropAreaId,
        data: {
            x: 'x',
            xFormat: '%Y/%m/%d %H:%M',
            columns: viewData,
            type: chartType ? chartType : 'area',
            color: function (color, d) {
                return d.value === max ? "red" : (d.value === min ? "yellow" : "#1f77b4");
            },
        },
        point: {
            r: function(d) { 
               return d.value === max || d.value === min ? 10 : 5;
            }
        },
        grid: {
            x: {
                lines: [{value: '2017/09/18 01:20', text: '2017/09/18'}]
            },
            y: {
                lines: medias//[{value: media, class: 'linha-media', text: 'Média: '+media.toFixed(2)}]
            }
        },
        zoom: {
            enabled: true
        },
        axis: {
            x: {
                type: 'timeseries',
                localtime: true,
                tick: {
                    rotate: 75,
                    format: '%d/%m/%Y %H:%M',
                    culling: {
                        max: 12 // the number of tick texts will be adjusted to less than this value
                    }
                },
                y: {
                    max: Math.max.apply(Math, dataWihoutLabel) + 1,
                    min: Math.min.apply(Math, dataWihoutLabel),
                }
            }
        }
    });

    pontosVento = d3.selectAll(".c3-circles-Vento circle");
    pontosVento[0].forEach(function (point, index) {
        d3.select(".c3-circles-Vento").append('svg:foreignObject')
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", function(d){
            return d3.select(point).attr("cx") - 10
        })
        .attr("y", function(d){
            return d3.select(point).attr("cy") - 10
        })
        .append("xhtml:body")
        .style("background-color", "transparent")
        .html(function(d) { return '<i class="wi wi-wind towards-'+d.values[index].value+'-deg" style="color:#000000; font-size: 20px"></i>' });
    });

    $(document).on( 'scroll', function(){
        pontosVento = d3.selectAll(".c3-circles-Vento circle");
        pontosVento[0].forEach(function (point, index) {
            d3.select(".c3-circles-Vento").append('svg:foreignObject')
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", function(d){
                return d3.select(point).attr("cx") - 10
            })
            .attr("y", function(d){
                return d3.select(point).attr("cy") - 10
            })
            .append("xhtml:body")
            .style("background-color", "transparent")
            .html(function(d) { return '<i class="wi wi-wind towards-'+d.values[index].value+'-deg" style="color:#000000; font-size: 20px"></i>' });
        });
    });

    /*
    .append('text')
    .attr('font-family', 'weathericons')
    .attr('font-size', function(d) { return 20+'em'} )
    .text(function(d) { return '\uf001' });
     */
    

    // Remove array vazio da estrutura
    if(dataY !== undefined && dataY.length === 0){
        viewData.pop(viewData.length);
    }
}

$("#myModal").on('show.bs.modal', function (ev) {
    d3version3.select("#chart-modal svg").remove();
    var gridNumber = ev.relatedTarget.id
    var weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
    var sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
    $('#chart-modal').html("<div style='text-align: center; width: 950px; height: 600px; line-height: 600px; font-size: 30px;'><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
    getWeatherData(weatherVarName, sensor_code, "chart-modal");
});

$("#myModal").on('hidden.bs.modal', function () {
    d3version3.select("#chart-modal svg").remove();
});

function allowDrop(ev) {
    ev.preventDefault();
}

// Gera gráfico ao clicar na célula
$(document).on('click', '.weather-cell', function(){
    $this = $(this);
    if(!$this.hasClass('cell-selected')){
        $this.addClass('cell-selected');
        $('.chart-area').html("<div id=\"timeSeriesArea5\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" class=\"drag-text\"><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
        const gridNumber = $this.attr('id');
        const weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
        const sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
        getWeatherData(weatherVarName, sensor_code, 'timeSeriesArea5');
    } else {
        const dataCellName = $this.find('.location-font').text();
        for(let i = 0; i < viewData.length; i++){
            if(viewData[i][0] == dataCellName){
                viewData.splice(i,1);
            }
        }
        generateChartDrop('timeSeriesArea5', "line", new Array);
        $this.removeClass('cell-selected');
    }
})

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, ui) {
    ev.preventDefault();
    $('#'+ev.dataTransfer.getData("text")).addClass('cell-selected');
    $('.chart-area').html("<div id=\"timeSeriesArea5\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" class=\"drag-text\"><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
    var gridNumber = ev.dataTransfer.getData("text");
    var weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
    var sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
    getWeatherData(weatherVarName, sensor_code, ev.currentTarget.id);
}

$(document).on('click', '.clear-drag-area', function(){
    $('.grid-charts').find('.weather-cell').removeClass('cell-selected');
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

$(document).on('change', "#selectdatemode", function () {
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
        generateChartDrop(result.target, "line", dataY);
        $("#timeSeriesArea5").removeClass("drag-text");
    } else {
        generateChartDialog(result.target, "area", dataY);
    }
});

function getWeatherData(weatherVarName, sensor_code, target) {
    // Considera range de data selecionado no heatmap
    let dateRange = {
        begin: '',
        end: ''
    }

    // Coleta o início e o fim das datas marcadas no heatmap, se foram marcadas
    if(typeof beginSelection != 'undefined' && typeof endSelection != 'undefined'){
        if(beginSelection != ''){
            dateRange.begin = beginSelection.data('date');
            dateRange.end = endSelection.data('date');
        }
    }

    var weatherDataCall = $.ajax({
        url: "http://localhost:9000/dateWeatherData",
        type: "POST",
        data: {
            date: weatherDate,
            sensor_code: sensor_code,
            dateRange: dateRange
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
            resObject.dates.push($.format.date(result.ts, "yyyy/MM/dd HH:mm"));
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
    // Considera range de data selecionado no heatmap
    let dateRange = {
        begin: '',
        end: ''
    }

    // Coleta o início e o fim das datas marcadas no heatmap, se foram marcadas
    if(typeof beginSelection != 'undefined' && typeof endSelection != 'undefined'){
        if(beginSelection != ''){
            dateRange.begin = beginSelection.data('date');
            dateRange.end = endSelection.data('date');
        }
    }

    if(!dateParam){
        dateParam = weatherDate;
    }

    var weatherDataCall = $.ajax({
        url: "http://localhost:9000/weatherData",
        type: "GET",
        data: {
            date: dateParam,
            device: device,
            dateRange: dateRange
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

$(document).on('click', ".show-media", function () {
    const $this = $(this);
    if(!$this.hasClass('active')){
        $this.addClass('active');
        $('.linha-media').show();
    } else {
        $this.removeClass('active');
        $('.linha-media').hide();
    }
});

$(document).on('click', ".show-min-max", function () {
    const $this = $(this);
    if(!$this.hasClass('active')){
        $this.addClass('active');
        $('.linha-min-max').show();
    } else {
        $this.removeClass('active');
        $('.linha-min-max').hide();
    }
});