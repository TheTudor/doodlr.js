(function(){
Template.__checkName("canvas");
Template["canvas"] = new Template("Template.canvas", (function() {
  var view = this;
  return HTML.Raw('<!-- color picker -->\n  <h1>Draw</h1>\n  <br>\n  <!-- canvas --> \n  <canvas id="canvas" class="canvas" width="800" height="600" style="border: 1px solid"></canvas>');
}));

})();
