currentCanvas = null;
editor = null;
receiver = null;

Meteor.startup(function() {
  Deps.autorun(function() {
    if(editor){
      receiver.close();
    }
    var currentId = Session.get('currentId');
    console.log(currentCanvas);
    editor = new Editor(currentId);
    receiver = new Receiver(currentId);
  });
});

