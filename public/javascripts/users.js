$(function() {
  $('#datepicker').datepicker({
  	format: 'mm-dd-yyyy'
  });
  var myDate = new Date();
 var prettyDate = ((myDate.getMonth()+1) < 10 ? "0":"") + (myDate.getMonth()+1) + 
  	'-' + ((myDate.getDate()) < 10 ? "0":"") +myDate.getDate() + 
  	'-' + myDate.getFullYear();
  $("#datepicker").val(prettyDate);
});