this.Receiver = function Receiver(id){
  console.log("receiver created"); // creates receiver

  // stream listeners furr each event emitter.
  drawStream.on(id + ":down-dot", function(at, curr, pencilSize, color) {
    editor.drawDefaultPencilDot(at, curr, pencilSize, color);
  });
  
  drawStream.on(id + ":down-texture", function(curr, pencilSize, pencilTexture, opac, color) {
    editor.drawTextureDot(curr, pencilSize, pencilTexture, opac, color); 
  });

  drawStream.on(id + ":move-line", function(prev, curr, pencilSize, color) {
    editor.drawDefaultPencilLine(prev, curr, pencilSize, color)
  });

  drawStream.on(id + ":move-texture", function(prev, curr, pencilSize, pencilTexture, opac, color) {
    editor.drawTextureLine(prev, curr, pencilSize, pencilTexture, opac, color); 
  });

  drawStream.on(id + ':down-sline', function(prev, curr, lineSize, color) {
    editor.drawShapeLineStartEnd(prev, curr, lineSize, color); 
  });

  drawStream.on(id + ':move-sline', function(prev, curr, lineSize, color) {
    editor.drawShapeLineMove(prev, curr, lineSize, color);
  });

  drawStream.on(id + ':down-rect', function(prev, curr, rectSize, color) {
    editor.drawShapeRectStartEnd(prev, curr, rectSize, color);
  });
  
  drawStream.on(id + ':move-rect', function(prev, curr, restSize, color) {
    editor.drawShapeRectMove(prev, curr, rectSize, color);
  });

  // ADD HERE every @id + 'eventname' being listened to
  this.close = function() {
    drawStream.removeAllListeners(id + ':down-dot');
    drawStream.removeAllListeners(id + ':down-texture');
    drawStream.removeAllListeners(id + ':down-sline');
    drawStream.removeAllListeners(id + ':down-rect');
    drawStream.removeAllListeners(id + ':move-line');
    drawStream.removeAllListeners(id + ':move-texture');
    drawStream.removeAllListeners(id + ':move-sline');
    drawStream.removeAllListeners(id + ':move-rect');

  }



}