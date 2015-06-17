currentCanvas = null;
editor = null;
var receiver;

Meteor.startup(function() {
  Deps.autorun(function() {
    var currentId = Session.get('currentId');
    console.log(currentCanvas);
    editor = new Editor(currentId);
    receiver = new Receiver(currentId);
  });
});

