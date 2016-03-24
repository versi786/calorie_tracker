$(function() {
  $('#datepicker').datepicker({
  	format: 'mm-dd-yyyy'
  });
  var myDate = new Date();
  var prettyDate =(myDate.getMonth()+1) + '-' + myDate.getDate() + '-' +
  myDate.getFullYear();
  $("#datepicker").val(prettyDate);
});