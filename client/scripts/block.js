if (Meteor.isClient) {
  
  Template.Block.onRendered(function() {
    var canvas = this.find("canvas");
    loadBlockImage(canvas);
  });

  Template.Block.events({
    'click' : function(e, template) {
      var canvas = template.find("canvas");
      Router.go("/canvas/" + canvas.id);
    }
  });
}
