'use strict';

$(document).ready(function () {
    $('.alert').hide();
    resetPlaceholders();
});

// On submit validate the form submission (not using HTML5 validation)
$('#foodEntryFORM').submit(function(event) {

  console.log('Someone tried to submit the form');
  var valid = true;

    // Get all the input elements
    $('#foodEntryFORM input').each(function(index) {

        console.log($(this).val());

        if ($(this).val() === '') {
            console.log('Empty field(s) found. Will now reset fields.');

            // Reset placeholders. Don't allow form submit.
            resetPlaceholders();
            valid = false;
            return false;
        }
    });

    if (!valid) {
        console.log('exiting. No submit.');
        event.preventDefault();
    } else {
        console.log('valid form submission.');
        $('.alert').show();
        return true;
    }
});

function resetPlaceholders() {
    $('#foodEntryFORM input').each(function(index) {
        $(this).val('');
    });
}
