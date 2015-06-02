drawStream = new Meteor.Stream('draw');

// documentation http://docs.meteor.com/#/basic/Template-onRendered


if (Meteor.isClient) {

  // TODO: remove global variables
  var canvas, ctx, w, h;

  var draw_flag = false,
    previousX = 0,
    currentX = 0,
    previousY = 0,
    currentY = 0;

  // Drawing parameters
  var color = "#000000",
    size = 2;


  // Canvas 
  Template.canvas.onRendered(function () {
    canvas = this.find('canvas').value;
    console.log(canvas.id); // HERE IS WHERE IT FAILS
    ctx = canvas[0].getContext('2d');
    w = canvas.width;
    h = canvas.height;
    ctx.fillRect(0, 0, w, h);
  });


  // Events 
  Template.canvas.events({
      'mousedown': function(e) {
        get_coordinates('down', e);
      },
      'mouseup': function(e) {
        get_coordinates('up', e);
      },
      'mousemove': function(e) {
        get_coordinates('move', e);
      },
      'mouseout': function(e) {
        get_coordinates('out', e);
      }
    });


  // -- Draw --------------------------------------------------------- //
  // TODO new picker
  // Get color from jscolor color picker
  function pick_color(obj) {
    color = '#' + obj.color;
  }
 
  // Draws a dot at coordinates (currentX, currentY) 
  // with lineWidth of size @size and strokeStyle of color @color
  function draw_dot() {
    ctx.beginPath();

    ctx.fillStyle = color;
    ctx.fillRect(currentX, currentY, size, size);

    ctx.closePath();
  }

  // Draws a line between coordinates (previousX, previousY), (currentX, currentY) 
  // with lineWidth of size @size and strokeStyle of color @color
  function draw_line() {
    ctx.beginPath();

    ctx.moveTo(previousX, previousY);
    ctx.lineTo(currentX, currentY);
    ctx.lineWidth   = size;
    ctx.strokeStyle = color;

    ctx.stroke();
    ctx.closePath();
  }

  // Gets coordinates of mouse click and performs corresponding action
  // Actual drawing happens here 
  function get_coordinates(action, e) {
    // On mousedown, draw first dot on location
    if (action == 'down') {
      previousX = currentX;
      previousY = currentY;
      currentX = e.clientX - canvas.offsetLeft;
      currentY = e.clientY - canvas.offsetTop;

      draw_flag = true;
      if (draw_flag) {
        draw_dot();
      }
    }
    // On mouse up or mouse out, no action (can't draw outside canvas)
    if (action == 'up' || action == "out") {
      draw_flag = false;
    }
    // On mousemove, draw line between move coordinates
    if (action == 'move') {
      if (draw_flag) {
          previousX = currentX;
          previousY = currentY;
          currentX = e.clientX - canvas.offsetLeft;
          currentY = e.clientY - canvas.offsetTop;

          draw_line();
      }
    }
  }


}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
