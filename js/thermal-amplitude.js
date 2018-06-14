$(document).ready(function () {

    var sensorCodeObjects = [
        {id:2, name:"Temperatura", measure: "C°"},
        {id:6,name:"Pressão", measure:"bar"},
        {id:32,name:"Umidade", measure:"?"},
        {id:3,name:"Vento", measure:"°"},
        {id:7,name:"Luminosidade", measure:"uv"},
        {id:7,name:"CO2", measure:"ppm"},
        {id:7,name:"SO2", measure:"ppm"},
        {id:4,name:"Material Particulado", measure:"ppm"},
        {id:34,name:"Nível da água", measure:"m"},
        {id:33,name:"Precipitação", measure:"mm"},
        {id:7,name:"CO", measure:"ppm"},
    ];

    var marginYear = {
        top: 50,
        right: 0,
        bottom: 100,
        left: 30
    };

    var legendHeight = 70;

    var configYear = {
        // 146 pixel cada mês
        width: (110*12) - marginYear.left - marginYear.right,
        height: 240 - marginYear.top - marginYear.bottom,
        days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        months: ['Ja', 'Fe', 'Ma', 'Ab', 'Ma', 'Ju', 'Ju', 'Ag', 'Se', 'Ou', 'No', 'De']
    };

    function search(nameKey, prop, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i][prop] === nameKey) {
                return myArray[i];
            }
        }
    }

    var device = getUrlParameter('device');

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    generateHeatmap("#heat-map-months", configYear, true, 2);

    /*$('.thermal-amplitude').click(function (e) {
        $('.weather-app').load("/view/thermal-amplitude.html", function () {
            generateHeatmap("#heat-map-months", configYear, true);
        });
    });*/

    $(document).on('change', ".heatmap-type", function () {
        $("#heat-map-months").empty();
        generateHeatmap("#heat-map-months", configYear, true, $(this).val());
    });

    // Monta o Heatmap
    async function generateHeatmap(id, config, isMonths, sensorCode) {
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

        var svg = d3.select(id).append("svg")
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
            url: "http://localhost:9000/heatmap",
            type: "GET",
            data: {
                device: device,
                sensorCode : sensorCode
            }
        });

        data = await Promise.resolve(heatmapFetch).then(function (data) {
            return data;
        });

        var heatmapChart = function (tsvFile) {
            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, d3.max(data, function (d) {
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
                .attr("data-cell", function (d) {
                    return d.day + '-' + d.week;
                })
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);

            texts.enter().append('text')
                .text( function (d) {
                    return  d.dateDay;
                })
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
                var name = search("sensorCode", "id", sensorCodeObjects);//sensorCodeObjects.find(x => x.id === sensorCode).name;
                var measure = search("sensorCode", "measure", sensorCodeObjects);//sensorCodeObjects.find(x => x.id === sensorCode).measure;

                return name+": " + Math.round(d.value) + measure;
            });

            cards.exit().remove();

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
    //Retorna um array com as colunas dos meses para o heatmap
    function collumnsInThisMonth(month) {
        var now = new Date();
        var numberOfDaysInCurrentMonth = new Date(now.getFullYear(), month + 1, 0).getDate();
        var collumnsInMonth = Math.ceil(numberOfDaysInCurrentMonth / 7);
        return Array(collumnsInMonth).join(".").split(".");
    }

    $('body').on('click', '.day-cell', function () {
        var $this = $(this);
        var date = $this.data('date').substr(0,10);
        weatherDate = $this.data('date').substr(0,10);
        makeWeatherData(date);
    });

    $('body').on('click', '.back-heatmonth', function () {
        d3.selectAll("svg").remove();
        $(".back-heatmonth").remove();
        generateHeatmap("#heat-map-months", configYear, false);
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