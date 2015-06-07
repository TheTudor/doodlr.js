(function(){
Template.body.addContent((function() {
  var view = this;
  return HTML.DIV(HTML.Raw("\n    <!-- routes.js deals with it -->\n    "), Blaze.View("lookup:renderPage", function() {
    return Spacebars.mustache(view.lookup("renderPage"));
  }), "\n  ");
}));
Meteor.startup(Template.body.renderToDocument);

})();
