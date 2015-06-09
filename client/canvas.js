if (Meteor.isClient) {
 
  var canv;

  Template.Canvas.onRendered(function () {
    canvas = this.find("canvas");
    ctx = canvas.getContext("2d");
    init_ctx(ctx);
    loadBlockImage(canvas);
  });


  Template.Canvas.events({
    'mousemove': function(e) {
      console.log("Hey");
      draw(e);
    }
  });

  Template.Editor.events({
    'click .save-button': function(e) {
      saveBlockImage(canvas);
    }
  });

}
