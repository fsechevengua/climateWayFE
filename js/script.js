var appHost = window.location.host;
var dataX = [];
//var weatherDate = $.format.date(new Date(), "yyyy-MM-dd");
var weatherDate = "2018-10-31";
var weatherCache;
var sensorOrder = [0, 1, 2, 3, 4, 5, 6];
var device = getUrlParameter('device');
var _filtro = [];
var _array_posicoes_filtradas = []; // Posições no viewData a serem filtradas
var _elementos_filtrados = []; // Controle de filtro para cada dado

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function loadDevicesCombo(){
    const getDevices = $.ajax({
        url: "http://178.128.15.73:9000/loadDevices",
        type: "get"
    });
    
    Promise.resolve(getDevices).then(function (data) {
        //$('.devices').append()
        data.forEach(function (elem, index) {
            $('.devices').append("<option value='"+elem+"' >"+elem+"</option>")
        });
        /*<option value="area" selected="selected">Line chart</option>
        <option value="bar">Bar chart</option>
        <option value="spline">Spline chart</option>
        console.log(data);*/
    });
}

$(document).ready(function () {
    $('#data-hoje').html($.format.date(new Date(), "dd/MM/yyyy hh:mm:ss"));
    makeWeatherData();
    loadDevicesCombo();
    // Inicia mix e max de cada variável
    const getMinMaxCall = $.ajax({
        url: "http://178.128.15.73:9000/min-max",
        type: "get"
    });
    
    Promise.resolve(getMinMaxCall).then(function (data) {
    });

    /*const $minMax = $('.min-max-item');
    const minMaxData = [];
    const tiposData = ['temperatura', 'pressao', 'umidade', 'vento', 'luminosidade', 'co2', 'so2'];
    
    $this.button('loading');

    $.each($minMax, function (i, $elem) {
        minMaxData.push({
            tipo: tiposData[i],
            min : $(this).find('input[name="min"]').val(),
            max : $(this).find('input[name="max"]').val(),
        });
    });*/

    
    
});
$(document).on('change', ".devices", function(){
    $("#heat-map-months").empty();
    generateHeatmap("#heat-map-months", configYear, true, 0, $(this).val());
    $('#spiral-chart').empty();
    makeSpiral($(this).val());
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


var condicional = {
    '>': function(a, b) { return  parseFloat(a) >  parseFloat(b) },
    '<': function(a, b) { return  parseFloat(a) <  parseFloat(b) },
    '>=': function(a, b) { return  parseFloat(a) >=  parseFloat(b) },
    '<=': function(a, b) { return  parseFloat(a) <=  parseFloat(b) }
};

//Cruzamento de dados
var viewData = [];
let viewDataCanvas = [];

function generateChartDrop(DropAreaId, chartType, dataY) {
    if (viewData.length == 0)
        viewData = [dataX];
    //Remove o x para substituir pelo novo eixo x que veio do servidor
    viewData.shift();
    viewData.unshift(dataX);

    let dataYAux = dataY.slice();
    let dataWihoutLabel = dataYAux.splice(1, dataYAux.length);

    let dataXAux = dataX.slice();
    let dataXWihoutLabel = dataXAux.splice(1, dataXAux.length);

    // Verifica se não tem repetição de dados
    var substituiu = false;
    for(let i = 0; i < viewData.length; i++)
    {
        if(dataY[0] == viewData[i][0]){
            viewData.splice(i, 1);
            viewData.push(dataY);
            substituiu = true;
        } else {
            // se for o último elemento do viewData, efetua push
            if(i == (viewData.length-1) && !substituiu){
                viewData.push(dataY);
                break;
            }
        }
    }

    let total = 0;
    let media = 0;
    // Cálcula o total e média dos valores do gráfico
    let medias = [];
    for(let i = 1; i < viewData.length; i++)
    {
        if(viewData[i].length > 0){
            total = viewData[i].reduce(function(Acumulador, valorAtual, indice) {
                if(indice != 1)
                    return Acumulador + valorAtual;
                else 
                    return valorAtual;
            });
            media = total / (viewData[1].length - 1);
    
            medias.push({value: media, class: 'linha-media', text: 'Média: '+media.toFixed(2)});
        }
    }
    
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

    // Filtro
    if(dataY.length != 0){ // Não faz filtragem quando está tirando uma célula selecionada
        const filtro = _filtro;
        let array_posicoes_filtradas = [];//_array_posicoes_filtradas.slice();
        filtro.forEach(function (elem, index) {
            for(let i = 0; i < viewData.length; i++){
                if(elem.tipoValor){
                    // Busca array de valores do tipo de valor selecionado no filtro
                    if(elem.tipoValor == viewData[i][0]){
                        //filtra os valores
                        for(let j = 1; j < viewData[i].length; j++){
                            if(!condicional[elem.comparacao](viewData[i][j], elem.valor)){
                                array_posicoes_filtradas.push(j);
                            }
                        }
                    }
                } else {
                    inicio = moment(elem.dataInicio).format("YYYY/MM/DD h:mm")
                    fim = moment(elem.dataFim).format("YYYY/MM/DD h:mm") 
                    for(let i = 1; i < viewData[0].length; i++){
                        if(!(viewData[0][i] >= inicio && viewData[0][i] <= fim)){
                            //viewData[0].splice(i,1);
                        }
                    }                
                }
            }
        });

        if(array_posicoes_filtradas.length > 0){
            _array_posicoes_filtradas = array_posicoes_filtradas.slice();
        }
        
        // Remove as posições salvar no array de filtragem
        let corretor = 0;
        for(let j = 0; j < _array_posicoes_filtradas.length; j++){
            for(let k = 0; k < viewData.length; k++ ){
                if(_elementos_filtrados.indexOf(viewData[k][0]) == -1 ){
                    viewData[k].splice(_array_posicoes_filtradas[j] - corretor, 1);
                }
            }
            corretor++;
        }
        // Elementos controlam a saida e entrada de dados filtrados para corrigir problemas nos filtros
        _elementos_filtrados.push(viewData[viewData.length-1][0]);
    }

    // Monta array para a canvas
    let dataCanvas = [];
    let dataXCanvas = [];
    let dataAuxCanvas = JSON.parse(JSON.stringify(viewData));// Clone array

    for(let i = 1; i < dataAuxCanvas.length; i++){
        dataCanvas.push(dataAuxCanvas[i].splice(1, dataAuxCanvas[0].length)); // Valores de cada elemento do eixo y
    }
    dataXCanvas = dataAuxCanvas[0].splice(1, dataAuxCanvas[0].length); // Valores das datas do eixo x

    generateCanvasChart(dataCanvas, dataXCanvas, chartType);

    /*c3.generate({
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

    

    $(document).on('zoomStart', function() {
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
            .html(function(d) { return '<i class="wi wi-wind towards-'+getWeatherDataFromResult(weatherCache.payload, 7)[index + 1]+'-deg" style="color:#000000; font-size: 20px"></i>' });
        });
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
        .html(function(d) { return '<i class="wi wi-wind towards-'+getWeatherDataFromResult(weatherCache.payload, 7)[index + 1]+'-deg" style="color:#000000; font-size: 20px"></i>' });
    });*/

    // Remove array vazio da estrutura
    if(dataY !== undefined && dataY.length === 0){
        viewData.pop(viewData.length);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

// Gera gráfico ao clicar na célula
$(document).on('click', '.weather-cell', function(){
    //generateCanvasChart();
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
                //percorre e remove da lista de filtrados o elemento descelecionado
                for(let j = 0; j < _elementos_filtrados.length; j++){
                    if(dataCellName == _elementos_filtrados[j]){
                        _elementos_filtrados.splice(j,1);
                    }
                }
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
        url: "http://178.128.15.73:9000/dateWeatherData",
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
            resObject.dates.push($.format.date(result.timestamp, "yyyy/MM/dd HH:mm"));
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
    $(".humidity-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[2])[1] + '%');

    // Line two
    $('.towards-90-deg').removeClass('towards-90-deg').addClass('towards-' + getWeatherDataFromResult(weatherCache.payload, 7)[1] + '-deg');
    $(".wind-direction-data").html(getWeatherDataFromResult(weatherCache.payload, sensorOrder[3])[1] + '(m/s)');
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

function getWeatherValue(result, code){
    switch(code){
        case 0:
            return result.temperature != null ? result.temperature : 0;
        case 1:
            return result.humidity != null ? result.humidity : 0;
        case 2:
            return result.windSpeed != null ? result.windSpeed : 0;
        case 3:
            return result.windDirection != null ? result.windDirection : 0;
        case 4:
            return result.precipitation != null ? result.precipitation : 0;
        case 5:
            return result.barometricPressure != null ? result.barometricPressure : 0;
        default:
            return  result.solarIrradiation != null ? result.solarIrradiation : 0;
    }
}

function getWeatherDataFromResult(data, sensorCode) {
    var result = ['sample'];
    result.push(Math.round(getWeatherValue(data[data.length-1], sensorCode) * 100) / 100);
    return result;
};

function getWeatherDataFromResultCanvas(data, sensorCode){
    var result = ['sample'];
    $.each(data, function (i, val) {
        switch(sensorCode){
            case 0:
                result.push(val.temperature);
                break
            case 1:
                result.push(val.humidity);
                break
            case 2:
                result.push(val.windSpeed);
                break
            case 3:
                result.push(val.windDirection);
                break
            case 4:
                result.push(val.precipitation);
                break
            case 5:
                result.push(val.barometricPressure);
                break
            default:
                result.push(val.solarIrradiation);
                break
        }
    });
    return result;
}

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
        url: "http://178.128.15.73:9000/weatherData",
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
        var stringFormatter = ['°C', 'bar', '%', 'm/s', 'uv', 'ppm', 'ppm']
        const dataNames = ['Temperatura', 'Pressão Atmosférica', 'Umidade Relativa do Ar', 'Velocidade', 'Luminosidade', 'Concentração de CO2', 'Concentração de SO2']
        const tiposData = ['temperatura', 'pressao', 'umidade', 'vento', 'luminosidade', 'co2', 'so2'];
        
        // Inicia mix e max de cada variável
        const getMinMaxCall = $.ajax({
            url: "http://178.128.15.73:9000/min-max",
            type: "get"
        });
        
        Promise.resolve(getMinMaxCall).then(function (data) {
            console.log(data);
            for (i = 0; i < 7; i++) {
                let windDirection;
                if(i == 3){
                    windDirection = { 
                        name: 'Direção',
                        type: 'gauge',
                        center: ['60%', '35%'],
                        radius: '22%',
                        min: data[i] ? data[i].min : 0,
                        max: data[i] ? data[i].max : 100,
                        startAngle: 90,
                        endAngle: -269.9999,
                        splitNumber: 12,
                        animation: 0,
                        pointer: { 
                            show: 1,
                            length: '60%',
                            width: 3
                        },
                        itemStyle: {
                            normal: {
                                color: '#00b0b0',
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                                shadowBlur: 10,
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: [
                                    [1, '#337ab7']
                                ],
                                width: 3
                            }
                        },
                        splitLine: {
                            show: 1,
                            length: 6,
                            lineStyle: {
                                width: 1
                            }
                        },
                        axisTick: {
                            show: false
                        }, 
                        axisLabel: { 
                            show: 1,
                            distance: 1, 
                            textStyle: {
                                color: '#ffffff',
                                fontSize: 6
                            },
                            formatter: function(t) {
                                switch (t + '') {
                                    case '0':
                                        return '0';
                                    case '60':
                                        return '60';
                                    case '120':
                                        return '120';
                                    case '180':
                                        return '180';
                                    case '240':
                                        return '240';  
                                    case '300':
                                        return '300';                                   
                                }
                            }
                        },
                        detail: {
                            offsetCenter: [0, 60],
                            textStyle: {
                                fontSize: 1
                            }
                        },
                        data: [{
                            value: getWeatherDataFromResult(weatherCache.payload, sensorOrder[4])[1],
                            name: ''
                        }]
                    }
                }

                option = {
                    tooltip : {
                        formatter: "{a} <br/>{b} : {c}"
                    },
                    series: [
                        {
                            name: dataNames[i],
                            type: 'gauge',
                            min: data[i] ? data[i].min : 0,
                            max: data[i] ? data[i].max : 100,
                            axisLine: { // Grossura do círculo   
                                lineStyle: {
                                    color: [
                                        [0.2, '#67e0e3'],
                                        [0.6, '#37a2da'],
                                        [1, '#fd666d']
                                    ],
                                    width: 7
                                }
                            },
                            pointer: { // seta
                                width:4
                            },
                            detail: {
                                formatter:'{value} '+stringFormatter[i],
                                textStyle: {
                                    fontSize: 20,
                                },
                                offsetCenter: [0,'80%']
                            },
                            splitLine: {
                                length: 10,
                                lineStyle: {
                                    width: 1
                                }
                            },
                            splitNumber: 5,
                            data: [{value: getWeatherDataFromResult(weatherCache.payload, sensorOrder[i])[1]}]
                        },
                        windDirection
                    ]
                };

                var chart_id = document.getElementById("minicharttest" + i);
                var chart = echarts.init(chart_id);
                chart.setOption(option);
            }
            loadTableData();
        });
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

// Filtro
$(document).on('click', ".modal-filtro", function () {
    $("#filtro").modal();
});

// Filtro
$(document).on('click', ".adicionar-form-filtro", function () {
    $this = $(this);
    countForms = $(this).length;
    
    $.get("filter.html", function(data){
        $(".form-filtro").append(data);
    });

    // Remove os outros botões de adivionar duplicados;
    $this.each(function( index ) {
        if(index < countForms){
            $(this).replaceWith("<button type='button' class='btn btn-danger remover-form-filtro' color='red'><i class='glyphicon glyphicon-remove'></i></button>");
        }
    });
});

$(document).on('click', ".remover-form-filtro", function () {
    $(this).parents('.row').remove();
});

$(document).on('change', ".tipo-dado", function () {
    $this = $(this);
    if($this.val() == 'Date'){
        $this.parents('.row').find('.tipo-valor').parent().hide();
        $this.parents('.row').find('.comparacao').parent().replaceWith("<div class='col-md-4 data1'>" +
            "<div class='form-group'>" +
                "<input type='text' class='form-control input-sm data-inicio' id='datetimepicker6' />" +
            "</div>" +
        "</div>");
        $this.parents('.row').find('.valor').parent().replaceWith("<div class='col-md-4 data2'>" +
            "<div class='form-group'>" +
                "<input type='text' class='form-control input-sm data-fim' id='datetimepicker7' />" +
            "</div>" +
        "</div>");
    } else {
        $this.parents('.row').find('.tipo-valor').parent().show();
        $this.parents('.row').find('.data1').replaceWith("<div class='col-sm-2'>" +
            "<select name='comparacao[]' class='form-control input-sm comparacao'>" +
                "<option selected=''>></option>" +
                "<option><</option>" +
                "<option >>=</option>" +
                "<option><=</option>" +
                "<option>between</option>" +
            "</select>" +
        "</div>");
        $this.parents('.row').find('.data2').replaceWith( "<div class='col-sm-2'>" +
            "<input type='text' class='form-control input-sm valor' name='valor-dado[]' placeholder='Valor'>" +
        "</div>");
    }

    $datetimepicker1 = $this.parents('.row').find('#datetimepicker6');
    $datetimepicker2 = $this.parents('.row').find('#datetimepicker7');
    $datetimepicker1.datetimepicker();
    
    $datetimepicker2.datetimepicker({
        useCurrent: false
    });
    $datetimepicker1.on("dp.change", function (e) {
        $datetimepicker2.data("DateTimePicker").minDate(e.date);
    });
    $datetimepicker2.on("dp.change", function (e) {
        $datetimepicker1.data("DateTimePicker").maxDate(e.date);
    });
    

});

$(document).on('click', ".apply-filter", function () {
    var $this = $(this);
    var $btn = $(this).button('loading');

    // Linhas do filtro
    var $filtroLinhas = $this.parents('.modal-content').find('.form-filtro .row');
    $filtroLinhas
    var $filtro = [];
    $filtroLinhas.each(function( index ) {
        tipoValor = $(this).find('.tipo-valor option:selected').val();
        comparacao = $(this).find('.comparacao option:selected').val();
        valor = $(this).find('.valor').val();
        $filtro.push( {tipoDado: 'Value', tipoValor : tipoValor, comparacao: comparacao, valor: valor} );
    });
    _filtro = $filtro;

    $btn.button('reset');
    $('#filtro').modal('hide');
});

function generateCanvasChart(data, date, type){
    let dataElements = [];
    const dataNames = ['Temperatura', 'Pressão Atmosférica', 'Umidade Relativa do Ar', 'Velocidade', 'Luminosidade', 'Concentração de CO2', 'Concentração de SO2']
    for(let i = 0; i < data.length; i++){
        dataElements.push({
            name: dataNames[i],
            type: type,
            sampling: 'average',
            itemStyle: {
                color: 'rgb(255, 70, 131)'
            },
            data: data[i]
        });
    }

    option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: date
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
        },
        dataZoom: [
            {
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter'
            },
            {
                id: 'dataZoomY',
                type: 'slider',
                yAxisIndex: [0],
                filterMode: 'empty'
            },
            {
                type: 'inside',
                start: 0,
                end: 10
            }, {
                start: 0,
                end: 10,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }
        ],
        series: dataElements
        
    };

    var chart_id = document.getElementById('timeSeriesArea5');
    var chart = echarts.init(chart_id);
    
    chart.setOption(option);
}

$(document).on('click', "#save-min-max", function () {
    let $this = $(this);
    const $minMax = $('.min-max-item');
    const minMaxData = [];
    const tiposData = ['temperatura', 'pressao', 'umidade', 'vento', 'luminosidade', 'co2', 'so2'];
    
    $this.button('loading');

    $.each($minMax, function (i, $elem) {
        minMaxData.push({
            tipo: tiposData[i],
            min : $(this).find('input[name="min"]').val(),
            max : $(this).find('input[name="max"]').val(),
        });
    });

    const saveMinMaxCall = $.ajax({
        url: "http://178.128.15.73:9000/save-min-max",
        type: "POST",
        data: {
            minMax: minMaxData,
        }
    });
    
    Promise.resolve(saveMinMaxCall).then(function (data) {
        $this.button('reset');
        $('#min-max').modal('hide');
        makeWeatherData();
    });
});

$(document).on('click', '.hide-data', function() {
    const $this = $(this);
    const $bar = $('.data-bar'); 
    if($bar.is(":visible")){
        $bar.hide();
        $(this).text('Show Data');
    } else {
        $bar.show();
        $(this).text('Hide Data');
    }
});

$(document).on('click', '.hide-functions', function() {
    const $this = $(this);
    const $bar = $('.functions-bar'); 
    if($bar.is(":visible")){
        $bar.hide();
        $(this).text('Show Functions');
    } else {
        $bar.show();
        $(this).text('Hide Funtions');
    }
});
