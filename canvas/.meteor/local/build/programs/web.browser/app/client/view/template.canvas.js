(function(){
Template.__checkName("canvas");
Template["canvas"] = new Template("Template.canvas", (function() {
  var view = this;
  return HTML.Raw('<!-- canvas --> \n  <div id="canvas-wrapper">\n  <canvas id="canvas" class="canvas" width="1280" height="720"></canvas>\n  </div>\n  <!-- save button - saves current canvas contents to database -->\n  <div id="tools">\n    <div id="select">  </div>\n    <div id="pencil">  </div>\n    <div id="brush">   </div>\n    <div id="spray">   </div>\n    <div id="shape">   </div>\n    <div id="eyedrop"> </div>\n    <!-- colorpicker \n         meteor add ryanswapp:spectrum-colorpicker -->\n    <input type="text" id="colorpicker">\n  </div>\n \n  <button class="save-button">Save</button>');
}));

})();
