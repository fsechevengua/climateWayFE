$(document).ready(function () {
    $('.thermal-amplitude').click(function (e) {
        $('.weather-app').load("/view/thermal-amplitude.html", function () {
            var margin = {
                top: 50,
                right: 0,
                bottom: 100,
                left: 30
            };
            var configYear = { 
                // 146 pixel cada mês
                width: (146*12) - margin.left - margin.right,
                height: 300 - margin.top - margin.bottom,
                days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
                months: ['Ja', 'Fe', 'Ma', 'Ab', 'Ma', 'Ju', 'Ju', 'Ag', 'Se', 'Ou', 'No', 'De']
            };
            generateHeatmap("#heat-map-months", configYear, true);
        });
    });

    function getThermalAmplitude() {
        var weatherDataCall = $.ajax({
            url: "http://localhost:9000/thermalAmplitude",
            type: "GET",
            data: {
                date: month,
            }
        });

        var weatherDataPromise = Promise.resolve(weatherDataCall).then(function (data) {

        });
    }

    // Monta o Heatmap
    function generateHeatmap(id, config, isMonths) {
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
                    config.months.splice.apply(config.months, [1, 0].concat(collumnsInThisMonth(1)));
                } else {
                    j += collumnsInThisMonth(i).length + i - k;
                    k++;
                    config.months.splice.apply(config.months, [j, 0].concat(collumnsInThisMonth(i)));
                }
            }
        }
        datasets = ["data.tsv", "data2.tsv"];

        var svg = d3.select(id).append("svg")
            .attr("width", config.width + margin.left + margin.right)
            .attr("height", config.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var dayLabels = svg.selectAll(".dayLabel")
            .data(config.days)
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
            .data(config.months)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return i * gridSize;
            })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function (d, i) {
                return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
            });

        var data = [{
            day: 1,
            week: 1,
            value: 100
        }, {
            day: 1,
            week: 2,
            value: 100
        }, {
            day: 1,
            week: 3,
            value: 100
        }, {
            day: 1,
            week: 4,
            value: 100
        }, {
            day: 1,
            week: 5,
            value: 100
        }, {
            day: 1,
            week: 6,
            value: 100
        }, {
            day: 1,
            week: 7,
            value: 100
        }, {
            day: 3,
            week: 45,
            value: 100
        }];

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

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function (d) {
                    return (d.week - 1) * gridSize;
                })
                .attr("y", function (d) {
                    return (d.day - 1) * gridSize;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "week bordered day-cell")
                .attr("data-cell", function (d) {
                    return d.day + '-' + d.week;
                })
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);

            cards.transition().duration(1000)
                .style("fill", function (d) {
                    return colorScale(d.value);
                });

            cards.select("title").text(function (d) {
                return d.value;
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
                .attr("y", config.height)
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
                .attr("y", config.height + gridSize);

            legend.exit().remove();
        };

        heatmapChart(datasets[0]);

        var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
            .data(datasets);

        datasetpicker.enter()
            .append("input")
            .attr("value", function (d) {
                return "Dataset " + d
            })
            .attr("type", "button")
            .attr("class", "dataset-button")
            .on("click", function (d) {
                heatmapChart(d);
            });
    };
    //Retorna um array com as colunas dos meses para o heatmap
    function collumnsInThisMonth(month) {
        var now = new Date();
        var numberOfDaysInCurrentMonth = new Date(now.getFullYear(), month + 1, 0).getDate();
        var collumnsInMonth = Math.ceil(numberOfDaysInCurrentMonth / 7);
        return Array(collumnsInMonth).join(".").split(".");
    }
    
    $('body').on('click', '.day-cell', function () {
        var margin = {
            top: 50,
            right: 0,
            bottom: 100,
            left: 30
        };
        var configDay = { 
            // 146 pixel cada mês
            width: 600 - margin.left - margin.right,
            height: 300 - margin.top - margin.bottom,
            days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months: ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
        };

        generateHeatmap("#heat-map-months", configDay, false);
    });
});