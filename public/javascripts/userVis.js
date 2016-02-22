'use strict';

$(document).ready(function () {
    $('.alert').hide();
});

$('#new_food_entry_button').on('click', function (e) {
    // e.preventDefault();
    $('.alert').show();
});
