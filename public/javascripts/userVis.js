'use strict';

$(document).ready(function () {
    $('.alert').hide();
});

$('#completed_food_entry').on('click', function (e) {
    e.preventDefault();
    $('.alert').show();
});
