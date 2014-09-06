/**
 * Created by Administrator on 13-12-3.
 */
$(function () {
    $(".rem").click(function () {
        $(this).toggleClass('selected');
    })

    $('#signup_select').click(function(){
        $('.form_row ul').show();
        event.cancelBubble = true;
    })

//        $('#d').click(function () {
//            $('.form_row ul').toggle();
//            event.cancelBubble = true;
//        })

    $('body').click(function () {
        $('.form_row ul').hide();
    })

    $('.form_row li').click(function () {
        var v = $(this).text();
        $('#signup_select').val(v);
        $(".form_row ul").hide();
    })
})