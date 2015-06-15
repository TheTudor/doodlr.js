// COLOR LIBRARY
// colour conversions adapted from http://en.wikipedia.org/wiki/HSL_color_space.
var Color = {
  rgbToHex : function(r, g, b) {
    return ("#" + ((r << 16) | (g << 8) | b).toString(16));
  },

  hexToRgb : function(hex) {
   return 0; 
  },

  rgbToHsl : function(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l;

    // luminance is average of brightest and darkest       
    l = (max + min) / 2; 

    // calculate the hue
    if (max == min) {
      h = s = 0; // achromatic
    } 
    else {
      var dif = max - min;
      s = l > 0.5 
        ? dif / (2 - max - min) 
        : dif / (max + min); // saturation given by range of intensity 

      // hue is given by dominant
      switch (max) {
          case r: h = (g - b) / dif + (g < b ? 6 : 0); break;
          case g: h = (b - r) / dif + 2;               break;
          case b: h = (r - g) / dif + 4;               break;
      }
      h /= 6;
    }

    return ({ h: h, s: s, l: l });
  },

  hslToRgb : function(h, s, l) {
    var r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5  // first find chroma 
            ? l * (1 + s)  
            : l + s - l * s;
      var p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return ({
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    });
  },

  hueToRgb : function(p, q, t) {  // based on HSL to RGB formula
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
}
  

// DISTANCE LIBRARY
var Dist = {
  distance : function(point1, point2) {
    var dx = point1.x - point2.x; 
        dy = point1.y - point2.y;
    return parseInt(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
  },
  angle : function(point1, point2) {
    var dx = point1.x - point2.x, 
        dy = point1.y - point2.y;
    return Math.atan2(dx, dy);
  } 
} 




////////////////////////////////////////////////////////////////////////////////////////////////////////
Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

if(Meteor.isClient) {

  var canvas, ctx, w, h;
  var tool,
    texture, brush, scatter;   
  var color, size, opacity;

  var draw_flag = false;

  var prev      = { x:0, y:0 };
  var curr   = { x:0, y:0 };

  // Brick parameters
  var row, col;


  //
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

    // init all tools
    color = "#000000",
    size = 2;

    // defaults
    tool = "pencil";
    brush = new Image();
    brush.src = 'http://i.imgur.com/zA1il03.png';


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


  //
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
        size = 10;
        console.log("chosen brush tool");
      },
      'click #spray'  : function() {
        tool = "spray";
        size = 100;
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
        saveImage(e, row, col);
      }
    });



  // -- Drawing utilities and tools ---------------------------------- //

  //
  // Get coordinates of mouse click
  function refreshCoordinates(e) {
    prev.x = curr.x;
    prev.y = curr.y;
    curr.x = e.clientX - canvas.offsetLeft + document.body.scrollLeft;
    curr.y = e.clientY - canvas.offsetTop  + document.body.scrollTop;
  }

  // Color picking
  function pickColor(c) {
    color = c.toHexString();
  }

  function chooseColor(x, y) {
    // Get the pixel's color
    var p = ctx.getImageData(x, y, 1, 1).data;
    var hex = Color.rgbToHex(p[0], p[1], p[2]);

    // Set the color picker to that color
    $("#colorpicker").spectrum("set", hex);
    color = hex;
  }



  // Mouse events handler - points to the action to be taken depending on the tool chosen 
  function handleDown(e) {
    refreshCoordinates(e);

    if(tool == "select") {  
      selectStartEndPath(curr); 
    }

    draw_flag = true;  // on mouse down, start drawing
    if(draw_flag) {
      if(tool == "pencil") {
        drawDot(curr);
      }
      if(tool == "brush") {
        drawSingleStroke(curr);
      }
      if(tool == "spray") {
        drawSingleSpray(curr);
      }
      if(tool == "shape") {
        shapeStartPath(curr);
      }
    }

    if(tool == "eyedrop") {
      chooseColor(curr);
    }
  }
  //
  function handleMove(e) {
    refreshCoordinates(e);

    if(tool == "select") {
        selectDrawPath(curr);
    }

    if(draw_flag) {   // keep drawing on mouse move as long as mouse is down
      if(tool == "pencil") {
        drawLine(prev, curr);
      }
      if(tool == "brush") {
        drawStroke(prev, curr);
      }
      if(tool == "spray") {
        drawSpray(prev, curr);
      }
      if(tool == "shape") {
        shapeDrawPath(curr);
      }
    }
  }

  function handleUp(e) {
    draw_flag = false;  // mouse up, stop drawing
  }


  //
  // SELECTION

  // adds a pseudo div element (which is the select area)
  // to the div element underneath the canvas 

  var selectStartX, selectStartY;
  var selectarea = null;

  function selectDrawPath(curr) {
    var x = curr.x, y = curr.y;

    if (selectarea !== null) {
      selectarea.style.width  = Math.abs(x - selectStartX) + 'px';
      selectarea.style.height = Math.abs(y - selectStartY) + 'px';
      selectarea.style.left   = (x - selectStartX < 0) ? x + 'px' : selectStartX + 'px';
      selectarea.style.top    = (y - selectStartY < 0) ? y + 'px' : selectStartY + 'px';
    }
  }
  
  function selectStartEndPath(curr) {
    var x = curr.x, y = curr.y;

    if(selectarea != null) {
      console.log("end selection at (" + x + ", " + y + ")"); 
      selectarea = null;
      canvas.style.cursor = "default";
    }
    else {
      // initialise selection

      selectStartX = x;
      selectStartY = y;
      console.log("begin selection at (" + x + ", " + y + ")"); 
      selectarea = document.createElement('div');
      selectarea.className = 'selectarea';
      selectarea.style.left = x + 'px'; 
      selectarea.style.top = y + 'px';

      document.getElementById("canvas-wrapper").appendChild(selectarea);
      canvas.style.cursor = "crosshair";
    }
  }


  //
  // DRAWING - PENCIL

  function drawDot(curr) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(curr.x, curr.y, size, size);
    ctx.closePath();
  }
  function drawLine(prev, curr) {
    ctx.beginPath();

    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.lineWidth   = size;
    ctx.strokeStyle = color;

    ctx.stroke();
    ctx.closePath();
  }

 
  //
  // DRAWING - BRUSH
  function drawSingleStroke(curr) {
    ctx.drawImage(brush, curr.x - brush.height/2, curr.y - brush.height/2);
  }
  function drawStroke(prev, curr) {
    var halfH = brush.height/2;
    var halfW = brush.width/2;
    var dist  = Dist.distance(prev, curr);
    var alpha = Dist.angle(prev, curr);

    var x, y;

    for(var i = 0; (i <= dist || i == 0); i++) {
      x = prev.x + (Math.sin(alpha) * i) - halfW;
      y = prev.y + (Math.cos(alpha) * i) - halfH;
      ctx.drawImage(brush, x, y);
    }
  }

  // change brush color

 
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
  function saveImage(e, row, col) {
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
        // finds a brick, thus updates the curr one
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
    // code to run on server at prevup
  });
}
