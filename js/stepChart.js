function generateStepChart() {
    var chart = c3.generate({
        bindto: "#teste",
        data: {
            columns: [
                ['data1', 300, 350, 300, 0, 0, 100],
                ['data2', 130, 100, 140, 200, 150, 50]
            ],
            types: {
                data1: 'step',
                data2: 'area-step'
            }
        }
    });
}

$('.thermal-amplitude').click(function (e) {
    $('.weather-app').load("/view/thermal-amplitude.html", function () {
        generateStepChart();
    });
});