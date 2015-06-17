this.Receiver = function Receiver(id){
  console.log("receiver created");
  drawStream.on(id + ":down-dot", function(x, y){
    console.log("should be drawing dot now");
    editor.drawDot(x, y);
  });


}