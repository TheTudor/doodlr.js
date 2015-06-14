Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

// documentation http://docs.meteor.com/#/basic/Template-onRendered

if(Meteor.isClient) {

  // TODO: remove global variables
  var tool;

  var canvas, ctx, w, h;

  var draw_flag = false,
    previousX = 0,
    currentX = 0,
    previousY = 0,
    currentY = 0;

  // Drawing parameters
  var color = "#000000",
    size = 2;


  // Canvas parameters
  var row, col;

  // Canvas 
  Template.canvas.onRendered(function () {
    // prepare the canvas
    canvas = this.find('#canvas');
    ctx = canvas.getContext('2d');
    w = canvas.width;
    h = canvas.height;
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
        color = e.hexToString();
      },
    });
  });


  // Events 
  Template.canvas.events({
      // Mouse events for drawing
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
      },

      // Events for choosing tools
      'click #select': function(e) {
        tool = "select";
        console.log("chosen select tool");
      },
      'click #pencil': function(e) {
        tool = "pencil";
        console.log("chosen pencil tool");
      },
      'click #brush': function(e) {
        tool = "brush";
        console.log("chosen brush tool");
      },
      'click #spray': function(e) {
        tool = "spray";
        console.log("chosen spray tool");
      },
      'click #shape': function(e) {
        tool = "shape";
        console.log("chosen shape tool");
      },
      'click #eyedrop': function(e) {
        tool = "eyedrop";
        console.log("chosen eyedropper tool");
      },


      // Event to save canvas content
      'click .save-button': function(e) {
        saveImage('click', e, row, col);
      }
    });


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

 
  // -- Drawing utilities and tools ---------------------------------- //
 
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
