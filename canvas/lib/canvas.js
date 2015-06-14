Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

// documentation http://docs.meteor.com/#/basic/Template-onRendered

if(Meteor.isClient) {

  // TODO: remove global variables
  var canvas, ctx, w, h;

  // Drawing parameters
  var color = "#000000",
    size = 2;
  var tool;
  var texture, brush, scatter;
  var draw_flag = false,
    x_0 = 0, x  = 0,
    y_0 = 0, y  = 0;

  // Brick parameters
  var row, col;

  // Canvas 
  Template.canvas.onRendered(function () {
    // prepare the canvas
    canvas = this.find('#canvas');
    ctx = canvas.getContext('2d');
    w = canvas.width;
    h = canvas.height;
    shift_x = canvas.left;
    shift_y = canvas.top;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    loadImage(ctx);

    // init the color picker
    $("#colorpicker").spectrum({
      color: "#000",
      showInput: true,
      className: "full-spectrum",
      showPalette: false,
      showSelectionPalette: true,
      maxSelectionSize: 10,
      preferredFormat: "hex",
      localStorageKey: "spectrum.homepage",
      change: function(c) {
        pickColor(c);
      },
    });
  });


  // Events 
  Template.canvas.events({
      // Events for choosing tools
      'click #select' : function() {
        tool = "select";
        console.log("chosen select tool");
      },
      'click #pencil' : function() {
        tool = "pencil";
        console.log("chosen pencil tool");
      },
      'click #brush'  : function() {
        tool = "brush";
        console.log("chosen brush tool");
      },
      'click #spray'  : function() {
        tool = "spray";
        console.log("chosen spray tool");
      },
      'click #shape'  : function() {
        tool = "shape";
        console.log("chosen shape tool");
      },
      'click #eyedrop': function() {
        tool = "eyedrop";
        console.log("chosen eyedropper tool");
      },

      // Mouse events for drawing
      'mousedown #canvas': function(e) {
        handleDown(e);
      },
      'mouseup #canvas': function(e) {
        handleUp(e);
      },
      'mousemove #canvas': function(e) {
        handleMove(e);
      },
      'mouseout #canvas': function(e) {
        handleUp(e);
      },

      // Event to save canvas content
      'click .save-button': function(e) {
        saveImage('click', e, row, col);
      }
    });


  // -- Drawing utilities and tools ---------------------------------- //
  // Color picking
  function pickColor(c) {
    color = c.toHexString();
  }

  function chooseColor(x, y) {
    // Get the pixel's color
    var p = ctx.getImageData(x, y, 1, 1).data;
    var hex = "#" + (rgbToHex(p[0], p[1], p[2]));

    // Set the color picker to that color
    $("#colorpicker").spectrum("set", hex);
    color = hex;

  }

  function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
  }


  // Mouse events handler - points to the action to be taken depending on the tool chosen 
  function handleDown(e) {
    x_0 = x;
    y_0 = y;
    x = e.clientX - canvas.offsetLeft;
    y = e.clientY - canvas.offsetTop;

    draw_flag = true;
    if(draw_flag) {
      if(tool == "select") {  
        selectStartPath(x, y);
      }
      if(tool == "pencil") {
        drawDot(x, y);
      }
      if(tool == "brush") {
        drawDot(x, y);
      }
      if(tool == "spray") {
        drawDot(x, y);
      }
      if(tool == "shape") {
        shapeStartPath(x, y);
      }
      if(tool == "eyedrop") {
        chooseColor(x, y);
      }
    }
  }

  function handleMove(e) {
    if(draw_flag) {
      x_0 = x;
      y_0 = y;
      x = e.clientX - canvas.offsetLeft;
      y = e.clientY - canvas.offsetTop;

      if(tool == "select") {
        selectDrawPath(x, y);
      }
      if(tool == "pencil") {
        drawLine(x_0, y_0, x, y);
      }
      if(tool == "brush") {
        drawLine(x_0, y_0, x, y);
      }
      if(tool == "spray") {
        drawLine(x_0, y_0, x, y);
      }
      if(tool == "shape") {
        shapeDrawPath(x, y);
      }
    }
  }

  function handleUp(e) {
    draw_flag = false;
  }


  // Draws a dot at coordinates (currentX, currentY) 
  // with lineWidth of size @size and strokeStyle of color @color
  function drawDot(x, y) {
    ctx.beginPath();

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);

    ctx.closePath();
  }

  // Draws a line between coordinates (previousX, previousY), (currentX, currentY) 
  // with lineWidth of size @size and strokeStyle of color @color
  function drawLine(x_0, y_0, x, y) {
    ctx.beginPath();

    ctx.moveTo(x_0, y_0);
    ctx.lineTo(x, y);
    ctx.lineWidth   = size;
    ctx.strokeStyle = color;

    ctx.stroke();
    ctx.closePath();
  }

 
  // -- Database ----------------------------------------------------- //
  // Load Image from Parse
  function loadImage(ctx) {
    var url = window.location.href;
    var rowIndex = url.indexOf("x") + 1;
    var colIndex = url.indexOf("y") + 1;
    
    // TODO: remove global
    row = +url.slice(rowIndex, colIndex - 1);
    col = +url.slice(colIndex, url.length);
    console.log("Loading brick at location " + row + ", " + col);
  
    var brick = Parse.Object.extend("Brick");
    var query = new Parse.Query(brick);
    query.equalTo("row", row);
    query.equalTo("column", col);

    query.first({
      success: function(brick) {
        if(brick != undefined) {
          var image = new Image();
          image.setAttribute('crossOrigin', 'anonymous');
          image.onload = function() {
            ctx.drawImage(image, 0, 0);
          };
          image.src =  brick.get("image")._url;
        }
      },
      error: function(error) {
        // It's just a clean canvas!
      }
    });
  }

  // Save Image to Parse
  function saveImage(action, e, row, col) {
    // First get the image
    var imageData = canvas.toDataURL();
    var imageBase64 = imageData.replace(/^data:image\/(png|jpg);base64,/, ""); //magic, do not touch
    var image = new Parse.File("drawing.png", {base64: imageBase64});

    // try to query for a brick
    var brick = Parse.Object.extend("Brick");
    var query = new Parse.Query(brick);
    query.equalTo("row", row);
    query.equalTo("column", col);


    query.first({
      success: function(brick) {
        // finds a brick, thus updates the current one
        if(brick != undefined) {
          brick.set("image", image);

          brick.save().then(function() {
            console.log("Successfuly saved brick (" + row + ", " + col + ") to Parse");
          }, function(error) {
            console.log("Error saving to Parse");
          });
        }
        // it's a new drawing! create a brick
        else {
          var newBrick = new Parse.Object("Brick");
          newBrick.set("row", row);
          newBrick.set("column", col);
          newBrick.set("image", image);
          newBrick.save().then(function() {
            console.log("Successfuly saved brick (" + row + ", " + col + ") to Parse");
          }, function(error) {
            alert("Error saving to parse");
          });
        }
      },
      error: function(error) {
        console.log("Parse retrieval error");
      }
    });
  }

 

}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
