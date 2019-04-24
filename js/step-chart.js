$(document).ready(function () {
    $('.thermal-amplitude').click(function (e) {
        $('.weather-app').load("/view/thermal-amplitude.html", function () {
            generateStepChart();
            //$.getScript("js/heatmap.js", function () {
            //    alert("Script loaded but not necessarily executed.");
            //});
            $('#datestepchart').datetimepicker({
                viewMode: 'years',
                format: 'MM/YYYY'
            });
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

    $("#datestepchart").on("dp.change", function (e) {
        e.preventDefault();
        alert("oi");
    });

    function getThermalAmplitude() {
        var weatherDataCall = $.ajax({
            url: "http://178.128.15.73:9000/thermalAmplitude",
            type: "GET",
            data: {
                date: month,
            }
        });

        var weatherDataPromise = Promise.resolve(weatherDataCall).then(function (data) {

        });
    }
});