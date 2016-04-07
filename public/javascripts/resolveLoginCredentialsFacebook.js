'use strict';

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1064789293583622',
    cookie     : true,  // enable cookies to allow the server to access
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' // use graph api version 2.5
  });
};

function storeCredentials() {

  FB.api('/me', {fields: 'last_name, first_name, id'}, function (response) {
    $.ajax({
      url: 'http://localhost:3000/signup/fblogin',
      method: 'POST',
      contentType: 'application/json',
      cache: false,
      data: JSON.stringify({username: response.id, firstname: response.first_name, lastname: response.last_name}),
      success: function (data) {
        window.location = data.redirect;
      },
      beforeSend: function (data) {
        console.log(data);
      }
    });

  });
  console.log('Made the AJAX request');
}


function share() {
  console.log("------GOT HERE------")
  FB.login(function(){
    // Note: The call will only work if you accept the permission request
    FB.api('/me/feed', 'post', {message: 'Hello, world!'});
      }, {scope: 'publish_actions'});
}



(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=1064789293583622";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

