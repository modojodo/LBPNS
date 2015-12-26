/**
 * Created by Umer on 11/30/2015.
 */
/*jslint browser:true global:$*/

"use strict";
$(function () {
    $('.site').on('click', function () {
        var siteLink = $(this).find('a').attr('data-site');
        console.log(siteLink);
        $('#siteLoader').load(siteLink);
    });

    $('#loadSite').on('click', function () {
        $.ajax({
            url: "/eatoyeDemo",
            success: function (data) {

                //var body = $(data).append("<script>alert('loaded') </script>");
                //$('#siteLoader').load(data);
                //cosnole.log(data);
                //console.log($(data).find(':root'));

                var body = $('#siteLoader').html(data);
                $('#siteLoader').children().each(function(){
                   console.log( "Element: "+$(this).html());
                });
                //console.log(body);
                //
                //console.log($(data).find('body').text());
                //console.log( $('#siteLoader').text($(data).find('body')));

                //console.log($('#siteLoader').html());
                //$('#siteLoader body').on('click', function () {
                //    alert('clciked');
                //});
            }
        });
    });


});
