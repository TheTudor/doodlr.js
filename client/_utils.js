renderBlockImage = function(block, canvas) {
  console.log("Drawing image for block: " + canvas.id);
  
  var ctx = canvas.getContext('2d');

  if (block != undefined) {
    var image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    
    image.onload = function() {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = block.get("image")._url;

  } else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};


loadBlockImage = function(canvas) {
  console.log("Loading block: " + canvas.id);

  var block_class = Parse.Object.extend("Block");
  var query = new Parse.Query(block_class);
  query.equalTo("objectId", canvas.id);

  query.first({
    success: function(block) {
      renderBlockImage(block, canvas);
    },
    error: function(error) {
      cosole.log("Error retrieving image from Parse!");
    }
  });
};


saveBlockImage = function(canvas) {
  console.log("Saving block: " + canvas.id);

  var imageData = canvas.toDataURL();
  var imageBase64 = imageData.replace(/^data:image\/(png|jpg);base64,/, "");
  var image = new Parse.File("drawing.png", {base64: imageBase64});

  var block_class = Parse.Object.extend("Block");
  var query = new Parse.Query(block_class);
  query.equalTo("objectId", canvas.id);

  query.first({
    success: function(block) {
      if (block === undefined) {
        var block = new Parse.Object("Block");
      } 
      
      block.set("image", image);
      
      block.save().then(
        function() {
          console.log("Successfuly saved block: " + canvas.id);
        }, function(error) {
          console.log("Error saving to Parse");
        }
      );
    },

    error: function(error) {
      console.log("Parse retrieval error");
    }
  });
};
