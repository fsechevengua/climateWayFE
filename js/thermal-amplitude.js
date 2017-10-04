$(document).ready(function () {
    $('.thermal-amplitude').click(function (e) {
        $('.weather-app').load("/view/thermal-amplitude.html", function () {
            generateStepChart();
            generateHeatmap();
        });
    });

    function generateStepChart() {
        /**
         * c > 35
         * c <= 35 && c >= 25
         * c <= 25 && c >= 12
         * c < 12
         */
        var chart = c3.generate({
            bindto: "#step-chart",
            data: {
                columns: [
                    ['MuitoQuente', 0, 0, 0, 0, 41],
                    ['Quente', 0, 0, 0, 32, 0],
                    ['Normal', 0, 0, 22, 0, 0],
                    ['Frio', 5, 4, 7, 0, 0]
                ],
                types: {
                    MuitoQuente: 'area-step',
                    Quente: 'area-step',
                    Normal: 'area-step',
                    Frio: 'area-step'
                },
                colors: {
                    'data': function (d) {
                        return d.value < 150 ? '#f44242' : '#62f441';
                    }
                }
            },
            axis: {
                x: {
                    type: 'category',
                    categories: ['11:00', '12:00', '13:00', '14:00', '15:00']
                }
            }
        });
    }

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
    function generateHeatmap() {
        var margin = {
                top: 50,
                right: 0,
                bottom: 100,
                left: 30
            },
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom,
            gridSize = Math.floor(width / 24),
            legendElementWidth = gridSize * 2,
            buckets = 9,
            colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
            days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months = ['Ja', 'Fe', 'Ma', 'Ab', 'Ma', 'Ju', 'Ju', 'Ag', 'Se', 'Ou', 'No', 'De'];

        //Monta espaços dos meses
        var j = 0;
        var k = 1;
        for (i = 1; i <= 12; i++) {
            if (i == 1) {
                months.splice.apply(months, [1, 0].concat(collumnsInThisMonth(1)));
            } else {
                j += collumnsInThisMonth(i).length + i - k;
                k++;
                months.splice.apply(months, [j, 0].concat(collumnsInThisMonth(i)));
            }
        }

        datasets = ["data.tsv", "data2.tsv"];

        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var dayLabels = svg.selectAll(".dayLabel")
            .data(days)
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
            .data(months)
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
            hour: 1,
            value: 100
        }, {
            day: 1,
            hour: 2,
            value: 100
        }, {
            day: 1,
            hour: 3,
            value: 100
        }, {
            day: 1,
            hour: 4,
            value: 100
        }, {
            day: 1,
            hour: 5,
            value: 100
        }, {
            day: 1,
            hour: 6,
            value: 100
        }, {
            day: 1,
            hour: 7,
            value: 100
        }];

        var heatmapChart = function (tsvFile) {
            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, d3.max(data, function (d) {
                    return d.value;
                })])
                .range(colors);

            var cards = svg.selectAll(".hour")
                .data(data, function (d) {
                    return d.day + ':' + d.hour;
                });

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function (d) {
                    return (d.hour - 1) * gridSize;
                })
                .attr("y", function (d) {
                    return (d.day - 1) * gridSize;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered day-cell")
                .attr("data-cell", function (d) {
                    return d.day + '-' + d.hour;
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
                .attr("y", height)
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
                .attr("y", height + gridSize);

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
        $this = $(this);
        alert($this.data('cell'));
    });
});