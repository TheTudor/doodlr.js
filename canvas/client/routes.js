Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

// Documentation - https://github.com/iron-meteor/iron-router/blob/devel/Guide.md

Router.route('/', function () {
  this.render('Wall');
});

// When going to an address of the form /canvas/:x,:y, canvas.js will lookup the brick with 
// row = x and column = y in Parse and return the image as data for the canvas
Router.route('/canvas/x:iy:j', function() {
    this.render('Canvas');
});
