Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

// documentation http://docs.meteor.com/#/basic/Template-onRendered

if (Meteor.isClient) {

  // TODO: remove global variables
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
    canvas = this.find('#canvas');
    ctx = canvas.getContext('2d');
    w = canvas.width;
    h = canvas.height;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, w, h);
    loadImage(ctx);
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
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = function() {
          ctx.drawImage(image, 0, 0);
        };
        image.src =  brick.get("image")._url;
      },
      error: function(error) {
      }
    });
  }

  // Save Image to Parse
  function saveImage(action, e, row, col) {
    var brick = Parse.Object.extend("Brick");
    var query = new Parse.Query(brick);
    query.equalTo("row", row);
    query.equalTo("column", col);


    query.first({
      success: function(brick) {
        var imageData = canvas.toDataURL();
        var imageBase64 = imageData.replace(/^data:image\/(png|jpg);base64,/, ""); //magic, do not touch
        var image = new Parse.File("drawing.png", {base64: imageBase64});

        brick.set("image", image);

        brick.save().then(function() {
          console.log("Successfuly saved to parse");
        }, function(error) {
          alert("Error saving to parse");
        });
      },
      error: function(error) {
      }
    });
  }

  // Get Brick by row and column
  function findBrick(row, col) {
    var brick = Parse.Object.extend("Brick");
    var query = new Parse.Query(brick);
    query.equalTo("row", row);
    query.equalTo("column", col);

    query.first({
      success: function(brick) {
        return brick;
      },
      error: function(error) {
        return null;
      }
    });

  }

 
  // -- Draw --------------------------------------------------------- //
  // TODO new picker
  // Get color from jscolor color picker
  function pick_color(obj) {
    color = '#' + obj.color;
  }
 
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
