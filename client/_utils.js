renderBlock = function(parse_block, block, ctx) {
  console.log("Drawing image for block: " + block.id);

  if (parse_block != undefined) {
    var image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    
    image.onload = function() {
      ctx.drawImage(image, 0, 0, block.width, block.height);
    };
    image.src = parse_block.get("image")._url;

  } else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, block.width, block.height);
  }
};

loadBlockImage = function(block_template) {
  var block = block_template.find('canvas');
  var ctx = block.getContext('2d');
  console.log("Loading block: " + block.id);

  var block_class = Parse.Object.extend("Block");
  var query = new Parse.Query(block_class);
  query.equalTo("objectId", block.id);

  query.first({
    success: function(parse_block) {
      renderBlock(parse_block, block, ctx);
    },
    error: function(error) {
      cosole.log("Error retrieving image from Parse!");
    }
  });
};
