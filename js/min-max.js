function loadMinMax(){
    const getMinMaxCall = $.ajax({
        url: "http://localhost:9000/min-max",
        type: "get"
    });
    
    Promise.resolve(getMinMaxCall).then(function (data) {
        data.forEach(function (elem, index) {
            $('input.' + elem.minMaxTipo + '[name="min"]').val(elem.min)
            $('input.' + elem.minMaxTipo + '[name="normal"]').val(elem.normal)
            $('input.' + elem.minMaxTipo + '[name="max"]').val(elem.max)
        });
        $("#min-max").modal();
    });
}

$(document).on('click', ".modal-min-max", function () {
    loadMinMax();
});

$(document).on('click', ".adicionar-form-min-max", function () {
    $.get("min-max.html", function(data){
        $(".form-min-max").append(data);
    });
});

$(document).on('click', ".remover-form-min-max", function () {
   $(this).parent().parent().remove();
});