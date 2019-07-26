$(document).ready(function () {
    $('body').on('click', '.planta', function () {

        /*  start legend code */
        // we want to display the gradient, so we have to draw it
        var legendCanvas = document.createElement('canvas');
        legendCanvas.width = 100;
        legendCanvas.height = 10;
        var min = document.querySelector('#min');
        var max = document.querySelector('#max');
        var gradientImg = document.querySelector('#gradient');
        var legendCtx = legendCanvas.getContext('2d');
        var gradientCfg = {};
        function updateLegend(data) {
            // the onExtremaChange callback gives us min, max, and the gradientConfig
            // so we can update the legend
            min.innerHTML = data.min;
            max.innerHTML = data.max;
            // regenerate gradient image
            if (data.gradient != gradientCfg) {
                gradientCfg = data.gradient;
                var gradient = legendCtx.createLinearGradient(0, 0, 100, 1);
                for (var key in gradientCfg) {
                    gradient.addColorStop(key, gradientCfg[key]);
                }
                legendCtx.fillStyle = gradient;
                legendCtx.fillRect(0, 0, 100, 10);
                gradientImg.src = legendCanvas.toDataURL();
            }
        };

        var heatmapInstance = h337.create({
            container: document.querySelector('.planta-heatmap'),
            onExtremaChange: function (data) {
                updateLegend(data);
            }
        });

        //Tooltip
        var wrapper = document.querySelector('.wrapper');
        var tooltip = document.querySelector('.tooltip-planta');
        function updateTooltip(x, y, value) {
            // + 15 for distance to cursor
            var transl = 'translate(' + (x + 20) + 'px, ' + (y + 20) + 'px)';
            tooltip.style.webkitTransform = transl;
            tooltip.innerHTML = value;
        };
        
        wrapper.onmousemove = function (ev) {
            var x = ev.layerX;
            var y = ev.layerY;
            // getValueAt gives us the value for a point p(x/y)
            var value = heatmapInstance.getValueAt({
                x: x,
                y: y
            });
            tooltip.style.display = 'block';
            updateTooltip(x, y, value);
        };

        // hide tooltip on mouseout
        wrapper.onmouseout = function () {
            tooltip.style.display = 'none';
        };
        /* tooltip code end */

        // now generate some random data
        var points = [];

        var point1 = {
            x: 150,
            y: 400,
            value: 90
        };

        var point2 = {
            x: 300,
            y: 400,
            value: 90
        };

        var point3 = {
            x: 500,
            y: 400,
            value: 90
        };

        points.push(point1);
        points.push(point2);
        points.push(point3);


        // heatmap data format
        var data = {
            max: 100,
            data: points
        };

        // if you have a set of datapoints always use setData instead of addData
        // for data initialization
        heatmapInstance.setData(data);

        $("#planta-modal").modal();
    });
});