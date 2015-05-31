if (Meteor.isClient) {
  Template.body.helpers({
    rows: function() {
      var rows = [];
      for (var i = 0; i < 5; i++) {
        var blocks = []
        for (var j = 0; j < 5; j++) {
          blocks.push("PLACEHOLDER");
        }
        rows.push({ blocks: blocks });
      }
      return rows;
    }
  });

}
