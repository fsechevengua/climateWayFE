$(document).on('click', ".modal-min-max", function () {
    $("#min-max").modal();
});

$(document).on('click', ".adicionar-form-min-max", function () {
    $.get("min-max.html", function(data){
        $(".form-min-max").append(data);
    });
});

$(document).on('click', ".remover-form-min-max", function () {
   $(this).parent().parent().remove();
});