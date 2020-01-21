(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({ handle: "" }, opt);

        if (opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if (opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top: e.pageY + pos_y - drg_h,
                    left: e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if (opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    }
})(jQuery);

function removeAcento(text) {
    text = text.toLowerCase();
    text = text.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u');
    text = text.replace(new RegExp('[Ç]', 'gi'), 'c');
    return text;
}

$(document).on('dblclick', '.chart-area', function() {
    // reset modal if it isn't visible
    if (viewData.length > 0) {
        if (!($('.modal.in').length)) {
            $('#box-plot-modal .modal-dialog').css({
                top: '20%',
                left: '25%'
            });
        }
        $("#box-plot-modal").modal({
            backdrop: false,
            show: true
        });

        $("#box-plot-modal").on('hidden.bs.modal', function() {
            $('.nav-tabs').empty();
            $('.tab-content').empty();
        });

        // Montagem das tabs na modal para recebimento dos box-plots
        for (let i = 1; i < viewData.length; i++) {
            let tab = '';
            let label = removeAcento(viewData[i][0].replace(/\s/g, "-"));
            if (i == 1) {
                tab = "<li class='active'><a data-toggle='tab' href='#nav-" + label + "'>" + viewData[i][0] + "</a></li>"
            } else {
                tab = "<li><a data-toggle='tab' href='#nav-" + label + "'>" + viewData[i][0] + "</a></li>"
            }
            $('#box-plot-modal .modal-body .nav-tabs').append(tab);
        }

        for (let i = 1; i < viewData.length; i++) {
            let content = '';
            let label = removeAcento(viewData[i][0].replace(/\s/g, "-"));
            if (i == 1) {
                content = "<div id='nav-" + label + "' class='tab-pane fade in active'>" +
                    //"<button type='button' data-datatype='"+label+"' class='open-modal-box-plot btn btn-primary' data-dismiss='modal'>Open in another Window</button>" +
                    "<div id='box-plot-" + label + "'>" +

                    "</div>" +
                    "</div>"
            } else {
                content = "<div id='nav-" + label + "' class='tab-pane fade in'>" +
                    //"<button type='button' data-datatype='"+label+"' class='open-modal-box-plot btn btn-primary' data-dismiss='modal'>Open in another Window</button>" +
                    "<div id='box-plot-" + label + "'>" +

                    "</div>" +
                    "</div>"
            }

            $('#box-plot-modal .modal-body .tab-content').append(content);
        }

        for (let i = 1; i < viewData.length; i++) {
            let date = moment(viewData[0][1]).format('YYYY-MM-DD');
            let result = [];
            let day_values = [];
            let dates = [];
            for (let j = 1; j < viewData[i].length; j++) {
                let current_date = moment(viewData[0][j]).format('YYYY-MM-DD');

                if (j == 1) {
                    dates.push(moment(date).format('DD/MM/YYYY'));
                }

                // Salva valores do dia e limpa array para um novo dia
                if (current_date == date) {
                    day_values.push(viewData[i][j]);
                } else {
                    date = current_date;
                    dates.push(moment(current_date).format('DD/MM/YYYY'));
                    result.push(day_values);
                    day_values = [];
                    day_values.push(viewData[i][j]);
                }
            }
            // Salva o último array produzido
            result.push(day_values);
            let data = [];
            for (let j = 0; j < result.length; j++) {
                data.push({ name: dates[j], y: result[j], type: 'box' });
            }

            Plotly.newPlot('box-plot-' + removeAcento(viewData[i][0].replace(/\s/g, "-")), data, '', {
                "displaylogo": false,
                'modeBarButtonsToRemove': ['pan2d', 'lasso2d', 'sendDataToCloud', 'hoverCompareCartesian']
            });
        }

    }
});