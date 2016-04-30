/*
Various pieces of code to improve user experience on main user page.
Includes Konami code and date picker.
*/

// Date picker
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


// Konami Code
var cheatDisplayed = false;
var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";
// Listen to all key-presses on the page
var bindKonamiToWindow = function () {
  kkeys = [];
  $(document).keydown(function(e) {
    kkeys.push(e.keyCode);
    if ( kkeys.toString().indexOf( konami ) >= 0 ) {
      $(document).unbind('keydown',arguments.callee);
      // do something awesome
      console.log("Konami Entered!");
      $("#overlay").removeClass("hidden");
      cheatDisplayed = true;
      cheatAnimation();
    }
  });
}.bind(this);

bindKonamiToWindow();

$(document).keydown(function (e) {
  if (e.keyCode === 27 && cheatDisplayed) {
    $("#overlay").remove();
    $("body").prepend("<div id='overlay' class='hidden'></div>");
    bindKonamiToWindow();
    cheatDisplayed = false;
  }
});

var cheatAnimation = function () {
    var colors = {
      a1: "#ff2d5d", a2: "#42dc8e", a3: "#2e43eb", a4: "#ffe359",
      b1: "#96bfed", b2: "#f5ead6", b3: "#f1f3f7", b4: "#e2e6ef"
    };
    var space = new CanvasSpace("canvas", colors.b4 ).display("#overlay");
    var form = new Form(space);
    var scale = 125;
    var maxScale = 125;

    space.refresh( false ); // no repaint per frame
    form.stroke( false );

    //// 2. Create Elements
    var world = new ParticleSystem(); // a system to track the particles
    space.add( world );

    var mouse = new Particle(); // speckles to gravitate toward the mouse, which has a larger mass
    mouse.mass = 100;

    var lastTime = 0;

    // A Speckle is a kind of Particle
    function Speckle() {
      Particle.call( this, arguments );
      this.mass = 1;
    }
    Util.extend( Speckle, Particle );

    // animate this speckle
    Speckle.prototype.animate = function( time, frame, ctx ) {
      this.play(time, frame);
      form.point( this, 1);
      if (this.x < 0 || this.x > space.size.x || this.y < 0) {
        world.remove( this );
      }
    };

    // Particle use RK4 to integrate by default. Here we change it to Euler which is faster but less accurate.
    Speckle.prototype.integrate = function(t, dt) {
      return this.integrateEuler(t, dt);
    };

    // calculate the forces
    Speckle.prototype.forces = function( state, t ) {
      var brownian = new Vector( (Math.random()-Math.random())/30, (Math.random()-Math.random())/30 ); // random
      var g = Particle.force_gravitation( state, t, this, mouse ); // mouse gravity
      return {force: brownian.add(g.force)};
    };


    //// 3. Visualize, Animate, Interact
    space.add({
      animate: function(time, fps, context) {

        // fill background
        form.fill("rgba(0,0,0,0.05)");

        form.rect( new Pair().to(space.size) );

        // fill speckles
        form.fill( "rgba(255,255,200,.1)" );

         // fill text
        form.font( scale, "Helvetica, sans-serif");
        form.text( new Point(space.size.x/16, space.size.y/8), "Cheat (day) Mode. There are no food entries here. Press 'esc' to return to reality.");

        // generate a new speckle every 25ms, remove when it's outside the space
        if (time-lastTime > 25 && world.particles.length<1000) {
          world.add( new Speckle(space.size.x/2, space.size.y/2) );
          lastTime = time;
        }
      },
      onMouseAction: function(type, x, y, evt) {
        if (type=="move") {
          var halfh = space.size.y/2;
          scale = maxScale * (1 - Math.abs(y - halfh) / halfh); // calculate scale based on mouse position
          mouse.set(x,y);
        }
      }
    });

    // 4. Start playing
    space.bindMouse();
    space.play();
}
