// Variáveis de controle da seleção de datas no heatmap
let beginSelection = '';
let endSelection = '';

var sensorCodeObjects = [
    {id:0, name:"Temperatura", measure: "C°"},
    {id:1,name:"Pressão", measure:"bar"},
    {id:2,name:"Umidade", measure:"?"},
    {id:3,name:"Vento", measure:"°"},
    {id:4,name:"Luminosidade", measure:"uv"},
    {id:5,name:"CO2", measure:"ppm"},
    {id:6,name:"SO2", measure:"ppm"},
    {id:6,name:"Material Particulado", measure:"ppm"},
    {id:6,name:"Nível da água", measure:"m"},
    {id:6,name:"Precipitação", measure:"mm"},
    {id:6,name:"CO", measure:"ppm"},
    {id:9, name: "Número de aves mortas", measure:""}
];

var marginYear = {
    top: 50,
    right: 0,
    bottom: 100,
    left: 30
};

var legendHeight = 70;

//Retorna um array com as colunas dos meses para o heatmap
function collumnsInThisMonth(month) {
    var now = new Date();
    var numberOfDaysInCurrentMonth = new Date(now.getFullYear(), month + 1, 0).getDate();
    var collumnsInMonth = Math.ceil(numberOfDaysInCurrentMonth / 7);
    return Array(collumnsInMonth).join(".").split(".");
}

var configYear = {
    // 146 pixel cada mês
    width: (110*12) - marginYear.left - marginYear.right,
    height: 240 - marginYear.top - marginYear.bottom,
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: ['Ja', 'Fe', 'Ma', 'Ab', 'Ma', 'Ju', 'Ju', 'Ag', 'Se', 'Ou', 'No', 'De']
};

function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i]["id"] == nameKey) {
            return myArray[i];
        }
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// Monta o Heatmap
async function generateHeatmap(id, config, isMonths, sensorCode, deviceCode) {
    var configHeatmap = jQuery.extend(true, {}, config);

    var margin = {
        top: 50,
        right: 0,
        bottom: 100,
        left: 30
    },
    gridSize = 23,
    legendElementWidth =  gridSize * 2,
    colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
    buckets = 9;

    //Monta espaços dos meses
    if(isMonths){
        var j = 0;
        var k = 1;
        for (i = 1; i <= 12; i++) {
            if (i == 1) {
                configHeatmap.months.splice.apply(configHeatmap.months, [1, 0].concat(collumnsInThisMonth(1)));
            } else {
                j += collumnsInThisMonth(i).length + i - k;
                k++;
                configHeatmap.months.splice.apply(configHeatmap.months, [j, 0].concat(collumnsInThisMonth(i)));
            }
        }
    }
    datasets = ["data.tsv", "data2.tsv"];

    var svg = d3version3.select(id).append("svg")
        .attr("width", configHeatmap.width + margin.left + margin.right)
        .attr("height", configHeatmap.height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svg.selectAll(".dayLabel")
        .data(configHeatmap.days)
        .enter().append("text")
        .text(function (d) {
            return d;
        })
        .attr("x", 0)
        .attr("y", function (d, i) {
            return i * gridSize;
        })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) {
            return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
        });

    var timeLabels = svg.selectAll(".timeLabel")
    .data(configHeatmap.months)
    .enter().append("text")
    .text(function (d) {
        return d;
    })
    .attr("x", function (d, i) {
        return i * (gridSize-6) + 45;
    })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(0, -6)")
    .attr("class", function (d, i) {
        //return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
        return "timeLabel mono axis axis-worktime";
    });

    let heatmapFetch;
    let data;

    // Pega dados para o calendário
    heatmapFetch = $.ajax({
        url: "http://178.128.15.73:9000/heatmap",
        type: "GET",
        data: {
            device: deviceCode,
            sensorCode : sensorCode
        }
    });

    data = await Promise.resolve(heatmapFetch).then(function (data) {
        return data;
    });
    
    var heatmapChart = function (tsvFile) {
        var colorScale = d3version3.scale.quantile()
            .domain([0, buckets - 1, d3version3.max(data, function (d) {
                return d.value;
            })])
            .range(colors);

        var cards = svg.selectAll(".week")
            .data(data, function (d) {
                return d.day + ':' + d.week;
            });

        var texts = svg.selectAll(".week")
        .data(data, function (d) {
            return d.day + ':' + d.week;
        });

        svg.selectAll(".week")
        .data(data, function (d) {
            return d.day + ':' + d.week;
        });

        var cardsEnter = cards.enter().append("rect")
            .attr("x", function (d) {
                return (d.week - 1) * gridSize;
            })
            .attr("y", function (d) {
                return (d.day - 1) * gridSize;
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "week bordered day-cell")
            .attr("data-date", function (d) {
                return d.fullDate;
            })
            .attr("data-cycle", function (d) {
                return d.cycle != null ? d.cycle : '';
            })
            .attr("id", function (d) {
                const date = moment(d.fullDate).format('YYYY-MM-DD');
                return 'a'+date;
            })
            .attr("data-cell", function (d) {
                return d.day + '-' + d.week;
            })
            .attr("width", gridSize - 3)
            .attr("height", gridSize - 3)
            .style("fill", colors[0]);

        texts.enter().append('text')
            .text( function (d) {
                return  Math.round(d.value);
            })
            .attr('font-size', '13px')
            .attr('pointer-events', 'none')
            .attr("class", "week bordered day-cell")
            .attr("data-date", function (d) {
                return d.fullDate;
            })
            .attr("x", function (d) {
                return (d.week) * gridSize - 20;
            })
            .attr("y", function (d) {
                return (d.day) * gridSize -7;
            })
            .attr('fill', 'white');

        cards.transition().duration(1000)
            .style("fill", function (d) {
                return colorScale(d.value);
            });

        cardsEnter.append("title").text((d) => d.value);

        cards.select("title").text(function (d) {
            var name = search(sensorCode, sensorCodeObjects).name;
            var measure = search(sensorCode, sensorCodeObjects).measure;

            return "Date: "+ moment(d.fullDate).format('DD/MM/YYYY') +"\n"+name+": " + Math.round(d.value) + measure;
        });

        cards.exit().remove();

        svg.selectAll("rect")
        .on('mouseover', function(d) {
            if(!d3version3.select(this).classed("selected")){
                d3version3.select(this)
                .style("stroke","#000000")
                .style("stroke-width","4px");
                const date = moment(d.fullDate).format('YYYY-MM-DD');

                d3version3.select("#b"+ date)
                .style("stroke","#000000")
                .style("stroke-width","2px");
                if(d.cycle !== ''){
                    d3version3.selectAll('rect[data-cycle="'+ d.cycle + '"]')
                    .style("stroke","#000000")
                    .style("stroke-width","2px");
                }
            }
        }).on('mouseout', function(d) {
            if(!d3version3.select(this).classed("selected")){
                d3version3.select(this)
                .style("stroke","#E6E6E6")
                .style("stroke-width","2px");
    
                const date = moment(d.fullDate).format('YYYY-MM-DD');
                d3version4.select("#b"+ date)
                .style("stroke","");

                if(d.cycle !== ''){
                    d3version3.selectAll('rect[data-cycle="'+ d.cycle + '"]')
                    .style("stroke","#E6E6E6")
                    .style("stroke-width","2px");
                }
            }
        });
        
        $('svg rect.day-cell').tipsy({ 
            gravity: 'w', 
            html: true, 
            title: function() {
                const d = this.__data__;
                const $this = $(this);
                const name = search(sensorCode, sensorCodeObjects).name;
                const measure = search(sensorCode, sensorCodeObjects).measure;
                console.log($this.data('cycle'));
                if($this.data('cycle') != ""){
                    return "Data: "+ moment(d.fullDate).format('DD/MM/YYYY') +"<br>"+name+": " + Math.round(d.value) + measure+"<br>"+ "Ciclo:"+$this.data('cycle'); 
                }
                return "Data: "+ moment(d.fullDate).format('DD/MM/YYYY') +"<br>"+name+": " + Math.round(d.value) + measure; 
            }
        });

        var legend = svg.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), function (d) {
                return d;
            });

        legend.enter().append("g")
            .attr("class", "legend");

        legend.append("rect")
            .attr("x", function (d, i) {
                return legendElementWidth * i;
            })
            .attr("y", configHeatmap.height+legendHeight)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function (d, i) {
                return colors[i];
            });

        legend.append("text")
            .attr("class", "mono")
            .text(function (d) {
                return "≥ " + Math.round(d);
            })
            .attr("x", function (d, i) {
                return legendElementWidth * i;
            })
            .attr("y", configHeatmap.height + gridSize+legendHeight);

        legend.exit().remove();
    };

    heatmapChart(datasets[0]);
};

$(document).ready(function () {
    generateHeatmap("#heat-map-months", configYear, true, 0, device);

    $(document).on('change', ".heatmap-type", function () {
        beginSelection = '';
        endSelection = '';
        $("#heat-map-months").empty();
        _sensor_code = $(this).val();
        generateHeatmap("#heat-map-months", configYear, true, $(this).val(), device);
        $('#spiral-chart').empty();
        makeSpiral(device, _sensor_code);
    });

    // Ctrl + Click para selecionar dias
    let cntrlIsPressed = false;

    $(document).keydown(function(event){
        if(event.which=="17")
            cntrlIsPressed = true;
    });

    $(document).keyup(function(){
        cntrlIsPressed = false;
    });

    function heatMapSelection(begin, end, $this){
        if($this.hasClass("selected")){
            $('rect.day-cell.selected').css({ 'stroke': ''});
            $('rect.day-cell.selected').removeClass("selected");
        } else{
            $this.addClass("selected");
            $this.css({
                 'stroke': 'rgb(0, 0, 0)',
                 'stroke-width' : '4px'
            });
            
        }

        if(begin){
            if($this.index('rect') > begin.index('rect')){
                end = $this;
            }else {
                end = begin;
                begin = $this;
            }
        }else {
            begin = $this;
        }

        if(begin && end){
            if(begin.index('rect') == end.index('rect')){
                begin = '';
                end = '';
            } else {
                if($this.index('rect') > end.index('rect') && $this.index('rect') > begin.index('rect')){
                    begin = end;
                    end = $this;
                } else {
                    if($this.index('rect') < end.index('rect') && $this.index('rect') < begin.index('rect')){
                        end = begin;
                        begin = $this;
                    }
                }
            }
        }
        
        if(begin && end){
            begin.nextUntil(end, 'rect').each(function(){
                $(this).addClass("selected");
                $(this).css({
                    'stroke': 'rgb(0, 0, 0)',
                    'stroke-width' : '4px'
               });
            });
        }
        return [begin , end];
    }

    $('body').on('click', '.day-cell', function () {
        const $this = $(this);
        const heatmaptype = $('.heatmap-type').find(":selected").val();

        // Estatísticas de mortalidade das aves
        if(heatmaptype == 9){
            beginSelection = $("#heat-map-months").find('[data-cycle='+$this.data('cycle')+']').first();
            endSelection = $("#heat-map-months").find('[data-cycle='+$this.data('cycle')+']').last();
            $(".cell-selected").each(function (index) {
                const gridNumber = $(this).attr("id")
                $('.chart-area').html("<div id=\"timeSeriesArea5\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" class=\"drag-text\"><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
                const weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
                const sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
                getWeatherData(weatherVarName, sensor_code, 'timeSeriesArea5', 'heatmap');
            });
            makeWeatherData();
        }

        const date = $this.data('date').substr(0,10);
        weatherDate = $this.data('date').substr(0,10);
        // Se pressionou control junto do click, carrega dados com dia ou dias selecionados.
        if(cntrlIsPressed){
            [beginSelection, endSelection] = heatMapSelection(beginSelection, endSelection, $this);
            if(beginSelection && endSelection){
                // Percorre todas as células selecionadas e faz a chamada para todas
                $(".cell-selected").each(function (index) {
                    const gridNumber = $(this).attr("id")
                    $('.chart-area').html("<div id=\"timeSeriesArea5\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" class=\"drag-text\"><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
                    const weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
                    const sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
                    getWeatherData(weatherVarName, sensor_code, 'timeSeriesArea5', 'heatmap');
                });
                makeWeatherData();
                $('#data-hoje').val($.format.date(new Date(beginSelection.data('date')), "dd/MM/yyyy")+ ' - '+$.format.date(new Date(endSelection.data('date')), "dd/MM/yyyy"));
            }
        } else {
            // Gera gráfico
            $('rect').css({ 'stroke': ''});
            $('rect.day-cell.selected').removeClass("selected");
            
            $(".cell-selected").each(function (index) {
                const gridNumber = $(this).attr("id")
                $('.chart-area').html("<div id=\"timeSeriesArea5\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" class=\"drag-text\"><span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span></div>");
                const weatherVarName = document.getElementById(gridNumber).getElementsByClassName('location-font')[0].innerText;
                const sensor_code = document.getElementById(gridNumber).getAttribute('data-sensor');
                getWeatherData(weatherVarName, sensor_code, 'timeSeriesArea5', 'heatmap');
            });
            console.log(date);
            console.log($.format.date(new Date(date+'.000'), "dd/MM/yyyy"));
            
            $('#data-hoje').val($.format.date(new Date(date+' 00:00:00'), "dd/MM/yyyy"));
            makeWeatherData(date);
        }
    });

    function getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        // Get first day of year
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        return weekNo;
    }
});