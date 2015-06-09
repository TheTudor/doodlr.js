if (Meteor.isClient) {
  
  Template.Block.onRendered(function() {
    loadBlockImage(this);
  });

  Template.Block.events({
    'click' : function(e, template) {
      var block = template.find('canvas');
      var id = block.id;
      Router.go("/canvas/" + id);
    }
  });
}
