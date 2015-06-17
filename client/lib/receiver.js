this.Receiver = function Receiver(id){
  console.log("receiver created");
  
  drawStream.on(id + ":down-dot", function(at) {
    console.log("should be drawing dot now");
    editor.drawDot(at.x, at.y);
  });

  drawStream.on(id + ":move-line", function(from, to) {
    console.log("drawing line"  + id);
    editor.drawLine(from, to);
  });


}