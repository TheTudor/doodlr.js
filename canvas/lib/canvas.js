////////////////////////////////////////////////////////////////////////////////////////////////////////

// COLOUR LIBRARY
// colour conversions adapted from http://en.wikipedia.org/wiki/HSL_color_space.
var Color = {
  rgbToHex : function(r, g, b) {
    return ("#" + ((r << 16) | (g << 8) | b).toString(16));
  },

  hexToRgb : function(hex) {
// TODO   return 0; 
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
// DRAWING LIBRARY

// Tools objects
var Select = {
  // adds a pseudo div element (which is the select area)
  // to the div element underneath the canvas 
  selectStartX:  0, 
  selectStartY:  0,
  selectarea:    null,
  canvasWrapper: null,
  setSelect: function(canvasWrapper) {
    this.canvasWrapper = canvasWrapper;
  },
  // Drawing the area
  onMouseMove: function() {
    var x  = Mouse.curr.x,      y  = Mouse.curr.y,
        x0 = this.selectStartX, y0 = this.selectStartY;
    if (this.selectarea !== null) {
      this.selectarea.style.width  = Math.abs(x - x0) + 'px' ;
      this.selectarea.style.height = Math.abs(y - y0) + 'px' ;
      this.selectarea.style.left   = (x - x0 < 0) ? x + 'px' : x0 + 'px';
      this.selectarea.style.top    = (y - y0 < 0) ? y + 'px' : y0 + 'px';
    }
  },
  onMouseDown: function(wrapperObject) {
    var x = Mouse.curr.x, y = Mouse.curr.y;

    if(this.selectarea != null) {
      console.log("end selection at (" + x + ", " + y + ")"); 
      this.selectarea = null;
      Editor.can.style.cursor = "default";
    }
    else {
      // initialise selection
      this.selectStartX = x;
      this.selectStartY = y;
      console.log("begin selection at (" + x + ", " + y + ")"); 
      this.selectarea = document.createElement('div');
      this.selectarea.className = 'selectarea';
      this.selectarea.style.left = x + 'px'; 
      this.selectarea.style.top = y + 'px';

      wrapperObject.appendChild(this.selectarea);
      Editor.can.style.cursor = "crosshair";
    }
  }
}

var Pencil = {
  texture: null,
  size:    2,
  opacity: 1,
  setPencil: function(textureUrl, userSize, userOpacity) {
    this.size = userSize;
    this.texture = new Image();
    this.texture.src = textureUrl;
    this.texture.setAttribute('crossOrigin', 'anonymous');
    this.opacity = userOpacity;
  },
  // Drawing functions
  onMouseDown: function() {
    if(this.texture == null) {
      Editor.drawDot(this.size, this.opacity);
    }
    else
      Editor.drawDotWithTexture(this.texture, this.size, this.opacity);
  },
  onMouseMove: function() {
    if(this.texture == null) {
      Editor.drawLine(this.size, this.opacity);
    }
    else
      Editor.drawLineWithTexture(this.texture, this.size, this.opacity);
  },
}

var Brush = {
  texture: null,
  sizeX:   10,
  sizeY:   10,
  opacity: 1, 
  setBrush: function(textureUrl, userSize, userOpacity) {
    this.texture = new Image();
    this.texture.src = textureUrl;
    this.texture.setAttribute('crossOrigin', 'anonymous');
    this.sizeX = userSize;
    this.sizeY = userSize; // TODO: proportional size
    this.opacity = userOpacity;
  },
  // Drawing functions
  onMouseDown: function() {
    Editor.drawDotWithTexture (this.texture, this.sizeX, this.sizeY, this.opacity);
  },
  onMouseMove: function() {
    Editor.drawLineWithTexture(this.texture, this.sizeX, this.sizeY, this.opacity);
  }
}

var Spray = {
  texture: null,
  stencil: null,
  size   : 100,
  setSpray: function(userSize, textureUrl, stencilUrl) {
    this.size = userSize;
    this.texture = new Image();
    this.texture.src = textureUrl;
    this.texture.setAttribute('crossOrigin', 'anonymous');
    this.stencil = new Image();
    this.stencil.src = stencilUrl;
    this.stencil.setAttribute('crossOrigin', 'anonymous');
  },
  // Drawing functions
  onMouseDown: function() {
    // Editor.DrawDotWithTexture(texture, sizeX, sizeY);
  },
  onMouseMove: function() {
    // Editor.DrawLineWithTexture(texture, sizeX, sizeY);
  }
}

var Shape = { done: 0 } //TODO 

var Eyedrop = {
  colorPicker: null,
  setEyedrop: function(colorPicker) {
    this.colorPicker = colorPicker;
  },
  onMouseDown: function() {
    // Get the pixel's color
    var p   = Editor.ctx.getImageData(Mouse.curr.x, Mouse.curr.y, 1, 1).data;
    var hex = Color.rgbToHex(p[0], p[1], p[2]);
    // Set the color picker to that color
    this.colorPicker.spectrum("set", hex);
    Editor.setColor(hex);
  },
  onMouseMove: function() {
    // nothing to be done here :)
  }
}


// Mouse object
var Mouse = {   
  // "point" types for mouse coordinates
  prev: { x:0, y:0 },
  curr: { x:0, y:0 },
  refreshCoordinates: function(e) {
    this.prev.x = this.curr.x;
    this.prev.y = this.curr.y;
    this.curr.x = e.clientX - Editor.can.offsetLeft + document.body.scrollLeft;
    this.curr.y = e.clientY - Editor.can.offsetTop  + document.body.scrollTop;
  }
}

// Object with all the editor data
var Editor = {
  // canvas
  can: null,
  ctx: null,
  w:   0,
  h:   0,

  // tools and color
  tool:      "pencil",    
  color:     "#000000",

  // flag used to detect mousedown + mousemove for drawing
  flag: false,

  // Initialise
  canvasInit: function(canvasObject) {
    this.can = canvasObject;
    this.ctx = this.can.getContext('2d');
    this.w = this.can.width;
    this.h = this.can.height;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.w, this.h);
  },

  // setters
  setTool: function(toolName) {
    this.tool = toolName;
    console.log("chose " + this.tool + " tool.");
  },
  setColor: function(c) { this.color = c; },
  setFlag:  function(f) { this.flag  = f; },

  // handle mouse events
  handleDown: function(e) {
    Mouse.refreshCoordinates(e);

    if(this.tool == "select") {  
      Select.onMouseDown();
    }
    this.setFlag(true);
    if(this.flag) {  // start drawing once the draw flag is set
      if(this.tool == "pencil") {
        Pencil.onMouseDown();
      }
      if(this.tool == "brush") {
        Brush.onMouseDown();
      }
      if(this.tool == "spray") {
        Spray.onMouseDown();
      }
      if(this.tool == "shape") {
        Shape.onMouseDown();
      }
    }
    if(this.tool == "eyedrop") {
      Eyedrop.onMouseDown();
    }
  },
  handleMove: function(e) {
    Mouse.refreshCoordinates(e);

    if(this.tool == "select") {  
      Select.onMouseMove();
    }
    if(this.flag) {  // keep drawing on mouse move as long as mouse is down 
      if(this.tool == "pencil") {
        Pencil.onMouseMove();
      }
      if(this.tool == "brush") {
        Brush.onMouseMove();
      }
      if(this.tool == "spray") {
        Spray.onMouseMove();
      }
      if(this.tool == "shape") {
        Shape.onMouseMove();
      }
    }
  },
  handleUp: function(e) {
    this.setFlag(false);  // mouse up, stop drawing
  },

  // Drawing helpers
  drawDot: function(size, opacity) {  // TODO: opacity
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(Mouse.curr.x, Mouse.curr.y, size, size);
    this.ctx.closePath();
  },
  drawLine: function(size, opacity) { // TODO: opacity
    this.ctx.beginPath();
    this.ctx.moveTo(Mouse.prev.x, Mouse.prev.y);
    this.ctx.lineTo(Mouse.curr.x, Mouse.curr.y);
    this.ctx.lineWidth   = size;
    this.ctx.strokeStyle = this.color;
    this.ctx.stroke();
    this.ctx.closePath();
  },
  drawDotWithTexture: function(texture, sizeX, sizeY, opacity) { // TODO: opacity
    this.ctx.drawImage(texture, Mouse.curr.x - sizeX/2, Mouse.curr.y - sizeY/2);
  },
  drawLineWithTexture: function(texture, sizeX, sizeY, opacity) {
    var halfH = sizeX/2;
    var halfW = sizeY/2;
    var dist  = Dist.distance(Mouse.prev, Mouse.curr);
    var alpha = Dist.angle   (Mouse.prev, Mouse.curr);
    var x, y;
    for(var i = 0; (i <= dist || i == 0); i++) {
      x = Mouse.prev.x + (Math.sin(alpha) * i) - halfW;
      y = Mouse.prev.y + (Math.cos(alpha) * i) - halfH;
      this.ctx.drawImage(texture, x, y);
    }
  }

}



////////////////////////////////////////////////////////////////////////////////////////////////////////

if(Meteor.isClient) {
  // Brick parameters
  var row, col;

  // Canvas 
  Template.canvas.onRendered(function () {
    // prepare the canvas
    canvas = this.find('#canvas');
    Editor.canvasInit(canvas);
    loadImage(Editor.ctx);
 
    // init tools/default
    Select.setSelect(document.getElementById("canvas-wrapper"));
    Pencil.setPencil(null, 2, 1);
    Brush.setBrush('http://i.imgur.com/zA1il03.png', 10, 1);

    // TODO: can't colorprick from brush strokes!!!
    console.log(Brush.texture.getAttribute('crossOrigin')); 

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
        Editor.setColor(c.toHexString());
      },
    });

    Eyedrop.setEyedrop($("#colorpicker"));
  });


  //
  // Events 
  Template.canvas.events({
    // Events for choosing tools
    'click #select' : function() {
      Editor.setTool("select");
    },
    'click #pencil' : function() {
      Editor.setTool("pencil");
    },
    'click #brush'  : function() {
      Editor.setTool("brush");
    },
    'click #spray'  : function() {
      Editor.setTool("spray");
    },
    'click #shape'  : function() {
      Editor.setTool("shape");
    },
    'click #eyedrop': function() {
      Editor.setTool("eyedrop");
    },

    // Mouse events for drawing
    'mousedown #canvas': function(e) {
      Editor.handleDown(e);
    },
    'mouseup #canvas': function(e) {
      Editor.handleUp(e);
    },
    'mousemove #canvas': function(e) {
      Editor.handleMove(e);
    },
    'mouseout #canvas': function(e) {
      Editor.handleUp(e);
    },

    // Event to save canvas content
    'click .save-button': function(e) {
      saveImage(e, row, col);
    }
   });

}

////////////////////////////////////////////////////////////////////////////////////////////////////////
Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

// Load Image from Parse
loadImage = function(ctx) {
  var url = window.location.href;
  var rowIndex = url.indexOf("x") + 1;
  var colIndex = url.indexOf("y") + 1;
  
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
saveImage = function(e, row, col) {
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






