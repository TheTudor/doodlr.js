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

  // tools parameters
  var pencilTexture    = null;
  var pencilTextureUrl = '/brush0.png'; 
  var pencilSize       = 2;
  var brushTexture     = null;
  var brushTextureUrl  = '/brush0.png';
  var brushSize        = 100; 
  var brushOpacity     = 0.5;
  var lineSize         = 10;
  var rectSize         = 10;

  // controller canvas parameters
  var tool = "pencil";    // default tool  -- TODO set these from the UI directly
  var color = "#000000";  // default color --
  var flag = false;       // flag used to detect mousedown + mousemove for drawing
  // getters/setters
  setTool  = function(t) { tool  = t; console.log("chose " + t + " tool."); }
  setColor = function(c) { color = c; };
  setFlag  = function(f) { flag  = f; };
  getTool  = function() { return tool;  }
  getColor = function() { return color; };
  getFlag  = function() { return flag ; };

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

  setPencilTexture = function(url) {
    pencilTextureUrl = url;
    //if(textureUrl != null) {
    //  pencilTexture = new Image();
    //  pencilTexture.src = textureUrl;
    //  pencilTexture.setAttribute('crossOrigin', 'anonymous');
    //}
    //else pencilTexture = null;
    console.log("pencil texture updated" + pencilTextureUrl);
  };
  setPencilSize = function(size) { 
    pencilSize = size;
    console.log("pencil size updated" + pencilSize);
  };
  setBrushTexture = function(url) {
    brushTextureUrl = url;
    //brushTexture = new Image();
    //brushTexture.src = textureUrl;
    //brushTexture.setAttribute('crossOrigin', 'anonymous');
    console.log("pbrush texture updated" + brushTextureUrl);
  };
  setBrushSize = function(size) {
    brushSize = size;
    console.log("brush size updated" + size);
  };
  setBrushOpacity = function(opacity) {
    brushOpacity = opacity;
  };
  setLineSize = function(size) {
    lineSize = size;
    console.log("line size updated" + size);
  },
  setRectSize = function(size) {
    rectSize = size;
    console.log("rectangle size updated" + size);
  },
  

  //
  //
  // MOUSE EVENTS ////////////////////////
  refreshCoordinates = function(newX, newY) {
    prev.x = curr.x;
    prev.y = curr.y;
    curr.x = newX + document.body.scrollLeft;
    curr.y = newY + document.body.scrollTop;
  };


  /////////////////////////////////////////////////////////////////////////////////////
  // TOOLS BEHAVIOUR //////////////

  //
  // eyedropper
  chooseColor = function(colorPicker) {
    // Get the pixel's color
    var p   = ctx.getImageData(curr.x, curr.y, 1, 1).data;
    var hex = Color.rgbToHex(p[0], p[1], p[2]);
    // Set the color picker to that color
    colorPicker.spectrum("set", hex);
    setColor(hex);
  };

  //
  // select
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
  drawDot = function() {
    if(pencilTexture == null) {
      // >>>>
      drawStream.emit(Session.get('currentId') + ':down-dot', 
                                    curr, pencilSize, color);

      drawDefaultPencilDot(curr, pencilSize, color);
    }
    else {
      var opac = 1;
      // >>>>
      drawStream.emit(Session.get('currentId') + ':down-texture', 
                                    curr, pencilSize, pencilTextureUrl, opac, color);

      drawTextureDot(curr, pencilSize, pencilTexture, opac, color); 
    }
  };
  drawLine = function() {
    if(pencilTexture == null) {
      // >>>>
      drawStream.emit(Session.get('currentId') + ':move-line', 
                                    prev, curr, pencilSize, color);
      drawDefaultPencilLine(prev, curr, pencilSize, color);
    }
    else {
      var opac = 0.5;
      // >>>>
      drawStream.emit(Session.get('currentId') + ':move-texture', 
                                    prev, curr, pencilSize, 
                                    pencilTextureUrl, opac, color);
      drawTextureLine(prev, curr, pencilSize, pencilTextureUrl, opac, color); 
    }
  };

  //
  // brush
  drawSingleStroke = function() {
    // >>>>
    drawStream.emit(Session.get('currentId') + ':down-texture', curr, brushSize, brushTextureUrl, brushOpacity,  color);

    drawTextureDot(curr, brushSize, brushTextureUrl, brushOpacity,  color); 
  };
  drawStroke = function() {
    // >>>>
    drawStream.emit(Session.get('currentId') + ':move-texture', prev, curr, brushSize, brushTextureUrl, brushOpacity, color); 

    drawTextureLine(prev, curr, brushSize, brushTextureUrl, brushOpacity, color); // TODO: smoothing opacity when stroking
  };

  //
  // shape line
  drawShapeLine1 = function() { 
    // >>>>
    drawStream.emit(Session.get('currentId') + ':down-line', curr, lineSize, color);

    drawShapeLineStartEnd(prev, curr, lineSize, color);
  };
  drawShapeLine2 = function() { 
    // >>>>
    drawStream.emit(Session.get('currentId') + ':move-line', curr, lineSize, color);

    this.drawShapeLineMove(prev, curr, lineSize, color);
  };

  //
  // shape rectangle
    drawShapeRect1 = function() { 
    // >>>>
    drawStream.emit(Session.get('currentId') + ':down-rect', curr, rectSize, color);

    this.drawShapeRectStartEnd(prev, curr, rectSize, color);
  };
  drawShapeRect2 = function() { 
    // >>>>
    drawStream.emit(Session.get('currentId') + ':move-rect', curr, restSize, color);

    this.drawShapeRectMove(prev, curr, rectSize, color);
  };


  ////////////////////////////////////////////////////////////////////////////////
  // -- DRAWING HELPERS/GLOBALS 
  // -- interact with both local and collaborator events
  // -- drawing magic here 

  // stroke drawing for pencil tool
  drawDefaultPencilDot = function(at, size, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(at.x, at.y, size, size);
    ctx.closePath();
  };
  drawDefaultPencilLine = function(from, to, size, color) {
    ctx.beginPath();

    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineWidth   = size;
    ctx.strokeStyle = color;

    ctx.stroke();
    ctx.closePath();
  };

  // texture drawing for brush
  drawTextureDot = function(at, size, textureUrl, opacity, color) {
    // update the brush with user parameters
    var brush = setTexture(size, textureUrl, opacity, color);
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(brush, at.x - brush.width/2, at.y - brush.height/2);
    ctx.restore();
  };
  drawTextureLine = function(from, to, size, textureUrl, opacity, color) {
    // update the brush with user parameters
    
    var brush = setTexture(size, textureUrl, opacity, color);

    var dist  = Dist.distance(from, to);
    var alpha = Dist.angle(from, to);
    var x, y;

    var frame = size > 5 ? Math.ceil(size/4) : 0.5;
    for(var i = 0; (i <= dist || i == 0); i+=frame) {
      x = from.x + (Math.sin(alpha) * i) - brush.width/2;
      y = from.y + (Math.cos(alpha) * i) - brush.height/2;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(brush, x, y);
      ctx.restore();
    }
  };
  setTexture = function(size, textureUrl, opacity, color) { // helper for setting texture, TODO: move inside set__ -- optimize
    //texture.setAttribute('crossOrigin', 'anonymous');
    console.log(textureUrl); // for safety
    var texture = new Image();
    texture.src = textureUrl;
    texture.setAttribute('crossOrigin', 'anonymous');
    console.log(texture);

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

  // stroke line for shape line tool
  var lines = []; // array for all lines + todo: add history canvas(bg layer)
  var l     = 0;  // current line
  drawShapeLineStartEnd = function(prev, curr, size, color) {
    console.log(prev);
    console.log(curr);
    if(lines[l] == null) {
        var line = { start: { x: curr.x, y: curr.y },
                     end  : { x: 0,      y: 0      }};
        lines.push(line);
    }
    else {
      lines[l].end = { x: curr.x, y: curr.y };
      ctx.beginPath();
      ctx.moveTo(lines[l].start.x, lines[l].start.y);
      ctx.lineTo(lines[l].end.x,   lines[l].end.y  );
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.stroke();
      console.log(lines[l]);
      l++;
    }
  }
  drawShapeLineMove = function(prev, curr, size, color) {
    console.log("imma moven"); 
  };

  // stroke rectangle 
  var rects = []; // array for all rectangles + todo: add history canvas(bg layer)
  var r     = 0;  // current rectangle
  drawShapeRectStartEnd = function(prev, curr, size, color) {
    if(rects[r] == null) {
        var rect = { start: { x: curr.x, y: curr.y },
                     size : { w: 0,      h: 0      }};
        rects.push(rect);
    }
    else {
      var x = rects[r].start.x,
          y = rects[r].start.y,
          w = curr.x - x; 
          h = curr.y - y;      rects[r].size = { w: w, h: h };      ctx.beginPath();      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.strokeRect(x, y, w, h);
    
      console.log(rects[r]);
      r++;
    }
  }
  drawShapeRectMove = function(prev, curr, size, color) {
    console.log("imma moven"); 
  };

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
  this.setLineSize = setLineSize;
  this.setRectSize = setRectSize;
  this.setTool = setTool;
  this.setColor = setColor;
  this.setFlag  = setFlag;
  this.getTool  = getTool;
  this.getColor = getColor;
  this.getFlag  = getFlag;
  this.refreshCoordinates = refreshCoordinates;
  // tools methods
  this.chooseColor = chooseColor;
  this.selectDrawPath = selectDrawPath;
  this.selectStartEndPath = selectStartEndPath;
  this.drawDot = drawDot;
  this.drawLine = drawLine;
  this.drawSingleStroke = drawSingleStroke;
  this.drawStroke = drawStroke;
  this.drawShapeLine1 = drawShapeLine1;
  this.drawShapeLine2 = drawShapeLine2;
  this.drawShapeRect1 = drawShapeRect1;
  this.drawShapeRect2 = drawShapeRect2;
  // helpers used in streams
  this.drawDefaultPencilDot = drawDefaultPencilDot;
  this.drawDefaultPencilLine = drawDefaultPencilLine;
  this.drawTextureDot = drawTextureDot;
  this.drawTextureLine = drawTextureLine;
  this.setTexture = setTexture;
  this.drawShapeLineStartEnd = drawShapeLineStartEnd;
  this.drawShapeLineMove     = drawShapeLineMove    ;
  this.drawShapeRectStartEnd = drawShapeRectStartEnd;
  this.drawShapeRectMove     = drawShapeRectMove    ;
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
    // receiver = new Receiver(Session.get('currentId'));
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
    'click #line'      : function() {
      editor.setTool("line");
    },
    'click #rectangle' : function() {
      editor.setTool("rectangle");
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


    // pop-up and down the properties for each tool
    'dblclick #canvas': function(e, template) {
      var all = template.findAll('.prop');
      removeAllMenus(all); // remove all for safety
      
      var menu;
      if(editor.getTool() == "pencil") {
        menu = template.find('#pencil-prop');
      }
      if(editor.getTool() == "brush") {
        menu = template.find('#brush-prop');
      }
      if(editor.getTool() == "line") {
        menu = template.find('#line-prop');
      }
      if(editor.getTool() == "rectangle") {
        menu = template.find('#rect-prop');
      }
      var popupX = Math.min(window.innerWidth  - 280, e.clientX); // TODO: menu.width not working?
      var popupY = Math.min(window.innerHeight - 180, e.clientY);
      menu.style.left = popupX + 'px';
      menu.style.top = popupY + 'px';
      menu.style.display = "block";
    }, 
    'click #canvas': function(e, template) {
      var all = template.findAll('.prop');
      removeAllMenus(all);
    },


    // Event to save canvas content
    'click .save-button': function(e) {
      saveImage(e, row, col);
    }
   });

  removeAllMenus = function(all) {
      all.forEach(function(elem) {
        elem.style.display = "none";
      });
   }


  ///////////////////////////////////////////////////////////////////////////////////
  // arrays of pencil and brush textures
  var pencilTextures = [ '/pencil0.png' , 
                         '/pencil1.png' , 
                         '/pencil2.png' ];
  var brushTextures  = [ '/brush0.png' , 
                         '/brush1.png' , 
                         '/brush2.png' ,
                         '/brush3.png' , 
                         '/brush4.png' ];

  // load the pencil textures into their elements
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
        console.log("invalid pencil size");  
        // TODO: add some visual error
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
        console.log("invalid brush size");  
        // TODO: add some visual error
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
        console.log("invalid brush opacity");  
        // TODO: add some visual error
      }
      else {
        slider.value = opacity * 100;
        editor.setBrushOpacity(opacity);
        console.log("set brush opacity " + opacity);
      }
    },
  });
    
     // updates canvas texture with the one chosen in UI
  updateTexture = function(all, selected, i, tool) { 
    all.forEach(function(elem) {
        elem.style.border = "0";
      }
    );
    selected.style.border = "1.5px solid yellow";
    if(editor.getTool() == "pencil") {
      if(i == 0) {
        editor.setPencilTexture(null);
      }
      else {
        editor.setPencilTexture(pencilTextures[i]);
      }
    }
    if(editor.getTool() == "brush") {
      editor.setBrushTexture(brushTextures[i]);
    }
  }

 // line properties: width 
  Template.LineProperties.events({
    // line change width
    'change #line-width': function(e, template) {
      var width = template.find('#line-width').value;
      var textField = template.find('#line-width-field');
      textField.value = width;
      editor.setLineSize(width);
      console.log("set line width " + width);
    },
    'change #line-width-field': function(e, template) {
      var slider = template.find('#line-width');
      var width = template.find('#line-width-field').value;
      if (width < 1 || width > 500) {
        console.log("invalid line width");  // TODO: add some visual error
      }
      else {
        editor.setLineOpacity(width);
        console.log("set line width " + width);
      }
    },
  });
  // rectangle properties: width 
  Template.RectProperties.events({
    // rectangle change width
    'change #rect-width': function(e, template) {
      var width = template.find('#rect-width').value;
      var textField = template.find('#rect-width-field');
      textField.value = width;
      Editor.setRectSize(width);
      console.log("set rect width " + width);
    },
    'change #rect-width-field': function(e, template) {
      var slider = template.find('#rect-width');
      var width = template.find('#rect-width-field').value;
      if (width < 1 || width > 500) {
        console.log("invalid rect width");  // TODO: add some visual error
      }
      else {
        Editor.setRectOpacity(width);
        console.log("set rect width " + width);
      }
    },
  });


  //////////////////////////////////////////////////////////////////////////////
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
        editor.drawDot();
      }
      if(editor.getTool() == "brush") {
        editor.drawSingleStroke();
      }
      if(editor.getTool() == "line") {
        editor.drawShapeLine1();
      }
      if(editor.getTool() == "rectangle") {
        editor.drawShapeRect1();
      }
    }
    if(editor.getTool() == "eyedrop") {
      editor.chooseColor($("#colorpicker"));
    }
  }
  handleMove = function(e) {
    // console.log("mouse move" + e.clientX + " " + e.clientY);
    editor.refreshCoordinates(e.clientX, e.clientY);

    if(editor.getTool() == "select") {
        editor.selectDrawPath();
    }
    if(editor.getFlag()) {   // keep drawing on mouse move 
                             // as long as mouse is down
      if(editor.getTool() == "pencil") {
        editor.drawLine();
      }
      if(editor.getTool() == "brush") {
        editor.drawStroke();
      }
      if(editor.getTool() == "line") {
        editor.drawShapeLine2();
      }
      if(editor.getTool() == "rectangle") {
        editor.drawShapeRect2();
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






