var canvas, 
    ctx, 
    draw_flag = false,
    previousX = 0,
    currentX = 0,
    previousY = 0,
    currentY = 0;

// Drawing parameters
var color = "#000",
    size = 2;


// Prepare the canvas and assign controllers for all mouse events
function canvas_init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;

  canvas.addEventListener("mousemove", function (e) { get_coordinates('move', e) }, false);
  canvas.addEventListener("mousedown", function (e) { get_coordinates('down', e) }, false);
  canvas.addEventListener("mouseup",   function (e) { get_coordinates('up'  , e) }, false);
  canvas.addEventListener("mouseout",  function (e) { get_coordinates('out' , e) }, false);
}

// Get color from jscolor color picker
function pick_color(obj) {
  color = '#' + obj.color;
}

// Draws a dot at coordinates (currentX, currentY) 
// with lineWidth of size @size and strokeStyle of color @color
function draw_dot() {
  ctx.beginPath();

  ctx.fillStyle = color;
  ctx.fillRect(currentX, currentY, 2, 2);

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
