////////////////////////////////////////////////////////////////////////////////////////////////////////

// COLOUR LIBRARY
// colour conversions adapted from http://en.wikipedia.org/wiki/HSL_color_space.
var Color = {
  rgbToHex : function(r, g, b) {
    return ("#" + ((r << 16) | (g << 8) | b).toString(16));
  },

  hexToRgb : function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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
// Object with all the editor data
this.Editor = function Editor(id) {
  
  // canvas
  var can = currentCanvas;
  if (can) {
    var ctx = can.getContext('2d');
    var w = can.width;
    var h = can.height;
  }

  // ctx.fillStyle = '#fff';
  // ctx.fillRect(0, 0, this.w, this.h);
  
  console.log(can);

  // tools and their parameters
  var tool = "pencil";    // default tool

  var pencilTexture = null; 
  var pencilSize    = 2;
  var brushTexture  = null;
  var brushSize     = 100; 
  var brushOpacity  = 0.5;
  var sprayTexture  = null; 
  var sprayStencil  = null;
  var spraySize     = 100;
  var sprayOpacity  = 0.5;
  
  var color = "#000000";

  // flag used to detect mousedown + mousemove for drawing
  var flag = false;

  // "point" types for mouse coordinates
  var prev = { x:0, y:0 };
  var curr = { x:0, y:0 };
  this.prev = prev;
  this.curr = curr;


  getPos = function(e) {
    return { x: e.clientX, y: e.clientY };
  };


  //
  //
  // INITIALISE AND SETTERS /////////////
  canvasInit = function(canvasObject) {
  // can = canvasObject; 
  // ctx = can.getContext('2d');
  // w = can.width;
  // h = can.height;
};

  // setPencilTexture(null);
  // setBrushTexture("/brush1.png");



  setTool = function(toolName) {
    tool = toolName;
    console.log("chose " + tool + " tool.");
  };
  getTool = function() {
    return tool;
  };

  setPencilTexture = function(textureUrl) {
    if(textureUrl != null) {
      pencilTexture = new Image();
      pencilTexture.src = textureUrl;
      pencilTexture.setAttribute('crossOrigin', 'anonymous');
    }
    else pencilTexture = null;
    console.log("pencil texture updated" + textureUrl);
  };
  setPencilSize = function(pencilSize) {
    pencilSize = pencilSize;
  };
  setBrushTexture = function(textureUrl) {
    brushTexture = new Image();
    brushTexture.src = textureUrl;
    brushTexture.setAttribute('crossOrigin', 'anonymous');
  };
  setBrushSize = function(brushSize) {
    brushSize = brushSize;
  };
  setBrushOpacity = function(brushOpacity) {
    brushOpacity = brushOpacity;
  };
  setSpray = function(userSize, textureUrl, stencilUrl, sprayOpacity) {
    size = userSize;
    sprayTexture = new Image();
    sprayTexture.src = textureUrl;
    sprayTexture.setAttribute('crossOrigin', 'anonymous');
    sprayStencil = new Image();
    sprayStencil.src = stencilUrl;
    sprayStencil.setAttribute('crossOrigin', 'anonymous');
    sprayOpacity = sprayOpacity;
  };

  setColor = function(c) { color = c; };
  setSize =  function(s) { size  = s; };
  setFlag =  function(f) { flag  = f; };
  getColor = function() { return color; };
  getSize =  function() { return size ; };
  getFlag =  function() { return flag ; };

  //
  //
  // MOUSE EVENTS ////////////////////////
  refreshCoordinates = function(e) {
    prev.x = curr.x;
    prev.y = curr.y;
    curr.x = e.clientX - can.offsetLeft + document.body.scrollLeft;
    curr.y = e.clientY - can.offsetTop  + document.body.scrollTop;
  };


  //
  //
  // TOOLS BEHAVIOUR //////////////

  //
  // Eyedropper tool
  chooseColor = function(colorPicker) {
    // Get the pixel's color
    var p   = ctx.getImageData(curr.x, curr.y, 1, 1).data;
    var hex = Color.rgbToHex(p[0], p[1], p[2]);
    // Set the color picker to that color
    colorPicker.spectrum("set", hex);
    setColor(hex);
  };

  //
  // Select tool
  // adds a pseudo div element (which is the select area)
  // to the div element underneath the canvas 
  var selectStartX = 0;
  var selectStartY = 0;
  var selectarea = null;

  selectDrawPath = function() {
    var x  = curr.x,       y = curr.y,
        x0 = selectStartX, y0 = selectStartY;
    if (selectarea !== null) {
      selectarea.style.width  = Math.abs(x - x0) + 'px' ;
      selectarea.style.height = Math.abs(y - y0) + 'px' ;
      selectarea.style.left   = (x - x0 < 0) ? x + 'px' : x0 + 'px';
      selectarea.style.top    = (y - y0 < 0) ? y + 'px' : y0 + 'px';
    }
  };
  selectStartEndPath = function(wrapperObject) {
    var x = curr.x, y = curr.y;

    if(selectarea != null) {
      console.log("end selection at (" + x + ", " + y + ")"); 
      selectarea = null;
      can.style.cursor = "default";
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

      console.log(wrapperObject);
      wrapperObject.appendChild(selectarea);
      can.style.cursor = "crosshair";
    }
  };

  //
  // pencil
  drawDot = function(toX, toY) {
    console.log("drawing dot");
    if(pencilTexture == null) {
      drawDefaultPencilDot(toX, toY, pencilSize, color);
    }
    else {
      drawTextureDot(pencilSize, pencilTexture, 1, color); 
    }
  };
  drawLine = function() {
    if(pencilTexture == null) {
      drawDefaultPencilLine(pencilSize, color);
    }
    else {
      drawTextureLine(pencilSize, pencilTexture, 0.5, color); 
    }
  };

  //
  // brush
  drawSingleStroke = function() {
    drawTextureDot(brushSize, brushTexture, brushOpacity,  color); 
  };
  drawStroke = function() {
    drawTextureLine(brushSize, brushTexture, brushOpacity, color); // TODO: smoothing opacity when stroking 
  };

  // DRAWING HELPERS + NON-DEXTURE DRAWING
  drawDefaultPencilDot = function(hereX, hereY, size, color) {
    console.log("hello from drawer");
    console.log("drawing at " + hereX + ' ' + hereY);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(hereX, hereY, size, size);
    ctx.closePath();
  };
  drawDefaultPencilLine = function(size, color) {
    ctx.beginPath();

    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.lineWidth   = size;
    ctx.strokeStyle = color;

    ctx.stroke();
    ctx.closePath();
  };
  // drawing helper
  drawTextureDot = function(size, texture, opacity, color) {
    // update the brush with user parameters
    var brush = setTexture(size, texture, opacity, color);
 
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(brush, curr.x - brush.width/2, curr.y - brush.height/2);
    ctx.restore();
  };
  drawTextureLine = function(size, texture, opacity, color) {
    // update the brush with user parameters
    var brush = setTexture(size, texture, opacity, color);

    var dist  = Dist.distance(prev, curr);
    var alpha = Dist.angle(prev, curr);
    var x, y;

    var frame = size > 5 ? Math.ceil(size/4) : 0.5;
    for(var i = 0; (i <= dist || i == 0); i+=frame) {
      x = prev.x + (Math.sin(alpha) * i) - brush.width/2;
      y = prev.y + (Math.cos(alpha) * i) - brush.height/2;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(brush, x, y);
      ctx.restore();
    }
  };
  setTexture = function(size, texture, opacity, color) {
    texture.setAttribute('crossOrigin', 'anonymous'); // for safety
    var h = texture.height, w = texture.width;
    var scale = size / Math.max(w, h); 
    // create a ghost canvas which is not added to the page, for manipulating the image
    var bcanvas = document.createElement('canvas');
    var bctx = bcanvas.getContext('2d');
    bcanvas.width = w * scale, bcanvas.height = h * scale;

    // scale
    bctx.drawImage(texture, 0, 0, w * scale, h * scale);
    var imgdata = bctx.getImageData(0, 0, w * scale, h * scale);
    // change colors
    var rgba = imgdata.data;
    var rgb  = Color.hexToRgb(color);
    for (var px = 0; px < rgba.length; px += 4) { 
      rgba[px  ] = rgb.r;
      rgba[px+1] = rgb.g;
      rgba[px+2] = rgb.b;
    }
    bctx.putImageData(imgdata, 0, 0);
    return bcanvas;  
  };
  // There but for the grace of god go I.
  // http://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas
  // scaleImageData : function(c, imageData, scale) {
  //   var scaled = c.createImageData(imageData.width * scale, imageData.height * scale);
  // 
  //   for(var row = 0; row < imageData.height; row++) {
  //     for(var col = 0; col < imageData.width; col++) {
  //       var sourcePixel = [
  //         imageData.data[(row * imageData.width + col) * 4 + 0],
  //         imageData.data[(row * imageData.width + col) * 4 + 1],
  //         imageData.data[(row * imageData.width + col) * 4 + 2],
  //         imageData.data[(row * imageData.width + col) * 4 + 3]
  //       ];
  //       for(var y = 0; y < scale; y++) {
  //         var destRow = row * scale + y;
  //         for(var x = 0; x < scale; x++) {
  //           var destCol = col * scale + x;
  //           for(var i = 0; i < 4; i++) {
  //             scaled.data[(destRow * scaled.width + destCol) * 4 + i] =
  //               sourcePixel[i];
  //           }
  //         }
  //       }
  //     }
  //   }
  // 
  //   return scaled;
  // }

  //////////////////
  ////EXPOSE API//// (everyFunction) = everyFunction
  //////////////////
  getCtx = function() {
    return ctx;
  };
  getCanvas = function() {
    return can;
  };
  this.getCtx = getCtx;
  this.getCanvas = getCanvas;

  this.getPos = getPos;
  this.canvasInit = canvasInit;
  this.setPencilTexture = setPencilTexture;
  this.setPencilSize = setPencilSize;
  this.setBrushTexture = setBrushTexture;
  this.setBrushSize = setBrushSize;
  this.setBrushOpacity = setBrushOpacity;
  this.setTool = setTool;
  this.setSpray = setSpray;
  this.setColor = setColor;
  this.setFlag  = setFlag;
  this.setSize  = setSize;
  this.getTool  = getTool;
  this.getColor = getColor;
  this.getFlag  = getFlag;
  this.getSize  = getSize;
  this.refreshCoordinates = refreshCoordinates;
  this.chooseColor = chooseColor;
  this.selectDrawPath = selectDrawPath;
  this.selectStartEndPath = selectStartEndPath;
  this.drawDot = drawDot;
  this.drawLine = drawLine;
  this.drawSingleStroke = drawSingleStroke;
  this.drawStroke = drawStroke;
  this.drawDefaultPencilDot = drawDefaultPencilDot;
  this.drawDefaultPencilLine = drawDefaultPencilLine;
  this.drawTextureDot = drawTextureDot;
  this.drawTextureLine = drawTextureLine;
  this.setTexture = setTexture;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////

 // Brick parameters
  var row, col;


  // Canvas 
  Template.Canvas.onRendered(function () {
    // prepare the canvas
    console.log(editor);
    currentCanvas = this.find('#canvas');
    editor = new Editor(Session.get('currentId'));
    console.log(editor);
    // editor.canvasInit(canvas);
    console.log(editor.getCtx());
    loadImage(editor.getCtx());
 
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
        editor.setColor(c.toHexString());
      },
    });
  });


  //
  // Events 
  Template.Canvas.events({
    // Events for choosing tools
    'click #select' : function() {
      editor.setTool("select");
    },
    'click #pencil' : function() {
      editor.setTool("pencil");
    },
    'click #brush'  : function() {
      editor.setTool("brush");
    },
    'click #spray'  : function() {
      editor.setTool("spray");
    },
    'click #shape'  : function() {
      editor.setTool("shape");
    },
    'click #eyedrop': function() {
      editor.setTool("eyedrop");
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

  // arrays of pencil and brush textures
  var pencilTextures = [ '/pencil0.png', '/pencil1.png', '/pencil2.png'  ];
  var brushTextures  = [ '/brush0.png', '/brush1.png', '/brush2.png', '/brush3.png', '/brush4.png' ];
  // load pencil the textures into their elements
  Template.PencilProperties.helpers({
    pencilTextures: function() {
      var textures = [];
      for(var i = 0; i < pencilTextures.length; i++) {
        var id = 'pencil' + i;
        textures.push({ id: id, image: pencilTextures[i] });
      }
      return textures;
    }
  });
  // load the brush textures into their elements
  Template.BrushProperties.helpers({
    brushTextures: function() {
      var textures = [];
      for(var i = 0; i < brushTextures.length; i++) {
        var id = 'brush' + i;
        textures.push({ id: id, image: brushTextures[i] });
      }
      return textures;
    }
  });

  // pencil properties: texture, size
  Template.PencilProperties.events({
    // pencil change texture
    'click #pencil0': function(e, template) {
      var allTextures = template.findAll('.pencilTexture');
      var textureImg  = template.find('#pencil0');
      updateTexture(allTextures, textureImg, 0, "pencil");
    },
    'click #pencil1': function(e, template) {
      var allTextures = template.findAll('.pencilTexture');
      var textureImg  = template.find('#pencil1');
      updateTexture(allTextures, textureImg, 1, "pencil");
    },
    'click #pencil2': function(e, template) {
      var allTextures = template.findAll('.pencilTexture');
      var textureImg  = template.find('#pencil2');
      updateTexture(allTextures, textureImg, 2, "pencil");
    },
    // pencil change width
    'change #pencil-width': function(e, template) {
      var size = template.find('#pencil-width').value;
      var textField = template.find('#pencil-width-field');
      textField.value = size;
      editor.setPencilSize(size);
      console.log("set pencil size " + size);
    },
    'change #pencil-width-field': function(e, template) {
      var slider = template.find('#pencil-width');
      var size = template.find('#pencil-width-field').value;
      if (size < 1 || size > 4) {
        console.log("invalid pencil size");  // TODO: add some visual error
      }
      else {
        slider.value = size;
        editor.setPencilSize(size);
        console.log("set pencil size " + size);
      }
    },
    
  });
  // brush properties: texture, size, opacity
  Template.BrushProperties.events({
    // brush change texture
    'click #brush0': function(e, template) {
      var allTextures = template.findAll('.brushTexture');
      var textureImg  = template.find('#brush0');
      updateTexture(allTextures, textureImg, 0, "brush");
    },
    'click #brush1': function(e, template) {
      var allTextures = template.findAll('.brushTexture');
      var textureImg  = template.find('#brush1');
      updateTexture(allTextures, textureImg, 1, "brush");
    },
    'click #brush2': function(e, template) {
      var allTextures = template.findAll('.brushTexture');
      var textureImg  = template.find('#brush2');
      updateTexture(allTextures, textureImg, 2, "brush");
    },
    'click #brush3': function(e, template) {
      var allTextures = template.findAll('.brushTexture');
      var textureImg  = template.find('#brush3');
      updateTexture(allTextures, textureImg, 3, "brush");
    },
    'click #brush4': function(e, template) {
      var allTextures = template.findAll('.brushTexture');
      var textureImg  = template.find('#brush4');
      updateTexture(allTextures, textureImg, 4, "brush");
    },
    // brush change width
    'change #brush-width': function(e, template) {
      var size = template.find('#brush-width').value;
      var textField = template.find('#brush-width-field');
      textField.value = size;
      editor.setBrushSize(size);
      console.log("set brush size " + size);
    },
    'change #brush-width-field': function(e, template) {
      var slider = template.find('#brush-width');
      var size = template.find('#brush-width-field').value;
      if (size < 1 || size > 4) {
        console.log("invalid brush size");  // TODO: add some visual error
      }
      else {
        slider.value = size;
        editor.setBrushSize(size);
        console.log("set brush size " + size);
      }
    },
    // brush change opacity
    'change #brush-opacity': function(e, template) {
      var opacity = template.find('#brush-opacity').value/100;
      var textField = template.find('#brush-opacity-field');
      textField.value = opacity;
      editor.setBrushOpacity(opacity);
      console.log("set brush opacity " + opacity);
    },
    'change #brush-opacity-field': function(e, template) {
      var slider = template.find('#brush-opacity');
      var opacity = template.find('#brush-opacity-field').value;
      if (opacity < 0 || opacity > 1) {
        console.log("invalid brush opacity");  // TODO: add some visual error
      }
      else {
        slider.value = opacity * 100;
        editor.setBrushOpacity(opacity);
        console.log("set brush opacity " + opacity);
      }
    },
  });
    
  updateTexture = function(all, selected, i, tool) {
    all.forEach(function(elem) {
        elem.style.border = "0";
      }
    );
    selected.style.border = "1.5px solid yellow";
    if(tool == "pencil") {
      if(i == 0) {
        console.log(i);
        editor.setPencilTexture(null);
      }
      else {
        editor.setPencilTexture(pencilTextures[i]);
      }
    }
    if(tool == "brush")  editor.setBrushTexture(brushTextures[i]);
  }


  //
  // Mouse event handlers
  handleDown = function(e) {
    console.log("mouse down" + e.clientX + " " + e.clientY);
    editor.refreshCoordinates(e.clientX, e.clientY);

    if(editor.getTool() == "select") {  
      editor.selectStartEndPath(document.getElementById("canvas-wrapper")); 
    }
    editor.setFlag(true);  // on mouse down, start drawing
    console.log(editor.getFlag()); console.log(editor.getTool());
    if(editor.getFlag()) {
      if(editor.getTool() == "pencil") {
        console.log("MUIE");
        editor.drawDot(e.clientX, e.clientY);
        drawStream.emit(Session.get('currentId') + ':down-dot', e.clientX, e.clientY);
      }
      if(editor.getTool() == "brush") {
        editor.drawSingleStroke();
      }
      if(editor.getTool() == "spray") {
        editor.drawSingleSpray();
      }
      if(editor.getTool() == "shape") {
        editor.shapeStartPath();
      }
    }
    if(editor.getTool() == "eyedrop") {
      editor.chooseColor($("#colorpicker"));
    }
  }
  handleMove = function(e) {
    // console.log("mouse move" + e.clientX + " " + e.clientY);
    editor.refreshCoordinates(e);

    if(editor.getTool() == "select") {
        editor.selectDrawPath();
    }
    if(editor.getFlag()) {   // keep drawing on mouse move as long as mouse is down
      if(editor.getTool() == "pencil") {
        editor.drawLine();
      }
      if(editor.getTool() == "brush") {
        editor.drawStroke();
      }
      if(editor.getTool() == "spray") {
        editor.drawSpray();
      }
      if(editor.getTool() == "shape") {
        editor.shapeDrawPath();
      }
    }
  }
  handleUp = function(e) {
    editor.setFlag(false);  // mouse up, stop drawing
  }



////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        console.log("loading image");
      }
      else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, editor.getCanvas().width, editor.getCanvas().height);
        console.log("setting white background");
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
  var imageData = currentCanvas.toDataURL();
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






