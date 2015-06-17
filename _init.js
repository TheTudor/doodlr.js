Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");
drawStream = new Meteor.Stream("draw");

if(Meteor.isServer) {
  drawStream.permissions.read(function() {
  return true;
  });

  drawStream.permissions.write(function() {
    return true;
  });
}