
brush_color = "#000";
brush_size = 2;
ctx = null;

current_x = 0;
current_y = 0;
previous_x = 0;
previous_y = 0;

init_ctx = function(ctx) {
  ctx = ctx;
};

update_brush_color = function(color) {
  brush_color = color;
}

update_brush_size = function(size) {
  brush_size = size;
};

drawDot = function(x, y) {
  halfSize = Math.floor(brush_size / 2);
  
  new_x = x - halfSize;
  new_y = y - halfSize;

  ctx.fillRect(new_x, new_y, brush_size, brush_size);
};

drawLine = function(x1, y1, x2, y2) {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = brush_color;
  ctx.lineWidth = brush_size;
  ctx.stroke();
};

draw = function(e) {
  previous_x = current_x;
  previous_y = current_y;
  current_x = e.clientX;
  current_y = e.clientY;

  drawLine(previous_x, previous_y, current_x, current_y);
};
