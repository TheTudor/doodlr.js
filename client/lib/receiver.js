this.Receiver = function Receiver(id){
  console.log("receiver created"); // creates receiver

  // stream listeners furr each event emitter.
  drawStream.on(id + ":down-dot", function(at, curr, pencilSize, color) {
    console.log("should be drawing dot now");
    editor.drawDefaultPencilDot(at, curr, pencilSize, color);
  });
  
  drawStream.on(id + ":down-texture", function(curr, pencilSize, pencilTexture, opac, color) {
    editor.drawTextureDot(curr, pencilSize, pencilTexture, opac, color); 
  });


  drawStream.on(id + ":move-line", function(prev, curr, pencilSize, color) {
    console.log("drawing line"  + id);
    editor.drawDefaultPencilLine(prev, curr, pencilSize, color)
  });

  drawStream.on(id + ":move-texture", function(prev, curr, pencilSize, pencilTexture, opac, color) {
    console.log("receiver" + pencilTexture);
    editor.drawTextureLine(prev, curr, pencilSize, pencilTexture, opac, color); 
  });

  // ADD HERE every @id + 'eventname' being listened to
  this.close = function() {
    drawStream.removeAllListeners(id + ':down-dot');
    drawStream.removeAllListeners(id + ':down-texture');
    drawStream.removeAllListeners(id + ':move-line');
    drawStream.removeAllListeners(id + ':move-texture');
  }



}