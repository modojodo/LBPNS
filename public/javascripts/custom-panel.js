/**
 * Created by Umer on 11/30/2015.
 */
/*jslint browser:true global:$*/

"use strict";
$(function () {
    $('.site').on('click', function () {
        var siteLink = $(this).find('a').attr('data-site');
        console.log(siteLink);
        //$('#siteLoader').attr('src', siteLink);
        $('#siteLoader').load(siteLink);
    });

    $('#loadSite').on('click', function () {
        $.get("/eatoyeDemo", function (data) {
            $('#siteLoader').html(data);
        });
    });

});