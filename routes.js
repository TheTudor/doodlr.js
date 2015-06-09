Router.route('/', function () {
  this.render('Wall');
});

Router.route('/canvas/:id', function() {
    var params = this.params;
    this.render('Editor', {
      data: {
        id: params.id
      }
    });
});
