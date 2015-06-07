(function(){// Documentation - https://github.com/iron-meteor/iron-router/blob/devel/Guide.md
// the page in home.html will run at /canvas
Router.route('/', function () {
  this.render('Wall');
});
Router.route('/canvas', function () {
  this.render('Canvas');
});

})();
