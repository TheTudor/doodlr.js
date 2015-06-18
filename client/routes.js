// Documentation - https://github.com/iron-meteor/iron-router/blob/devel/Guide.md
Router.route('/', {
  path: '/',
  name: 'wall.show',
  template: 'Wall',
  onAfterAction: function() {},
  action: function() {
    this.render();
  }
});

Router.route('canvas/:id', {
  path: '/canvas/:id',   
  name: 'show.canvas',
  template: 'Canvas',
  // waitOn: function() {
  //   return [IRLibLoader.load('/client/lib/editor.js'), 
  //           IRLibLoader.load('/client/lib/color.js')]
  // },
  data: function () {
    // return VisitedBlocks.findOne({id: this.params.id});
  },

  onAfterAction: function() {
    console.log('atMAMA');
  },
  action: function() {
    console.log("ROUTER" + this.params.id);
    Session.set("currentId", this.params.id);
    this.render();
    }
});

Router.route('presentation/:id', {
  path: '/presentation/:id',
  template: 'Canvas',
  // waitOn: function() {
  //   return [IRLibLoader.load('/client/lib/editor.js'), 
  //           IRLibLoader.load('/client/lib/color.js')]
  // },
  data: function () {
    return {
      presentation_mode: true
    }
  },

  onAfterAction: function() {
  },
  action: function() {
    console.log("ROUTER" + this.params.id);
    Session.set("currentId", this.params.id);
    this.render();
    }
});
