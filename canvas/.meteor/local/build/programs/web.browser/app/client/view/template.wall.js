(function(){
Template.__checkName("Wall");
Template["Wall"] = new Template("Template.Wall", (function() {
  var view = this;
  return [ HTML.DIV({
    "class": "header"
  }, "\n    ", HTML.Raw('<div class="name">\n    <a href="/"><h1>Doodlr.js</h1></a> \n    <!-- register and login are links to pop-up forms, using magnific popup\n         meteor add gabrielengel:konecty-magnific-popup\n      -->\n    </div>'), "\n    ", HTML.DIV({
    "class": "user"
  }, "\n    ", Spacebars.include(view.lookupTemplate("logInPopup")), " ", HTML.Raw("&nbsp;"), " | ", HTML.Raw("&nbsp;"), " \n    ", Spacebars.include(view.lookupTemplate("registerPopup")), "\n    "), "\n  "), HTML.Raw("\n\n  <!-- hidden divs to be loaded in popups -->\n  "), HTML.DIV({
    id: "reg-popup",
    "class": "mfp-hide"
  }, "\n    ", Spacebars.include(view.lookupTemplate("registerForm")), "\n  "), "\n  ", HTML.DIV({
    id: "log-popup",
    "class": "mfp-hide"
  }, "\n    ", Spacebars.include(view.lookupTemplate("logInForm")), "\n  "), HTML.Raw("\n\n  <!-- main wall view with all the bricks -->\n  "), HTML.DIV({
    "class": "wall"
  }, "\n    ", Blaze.Each(function() {
    return Spacebars.call(view.lookup("rows"));
  }, function() {
    return [ "\n      ", HTML.DIV({
      "class": "row"
    }, "\n      ", Blaze.Each(function() {
      return Spacebars.call(view.lookup("blocks"));
    }, function() {
      return [ "\n        ", Spacebars.include(view.lookupTemplate("Block")), "\n      " ];
    }), "\n      "), "\n    " ];
  }), "\n  ") ];
}));

Template.__checkName("Block");
Template["Block"] = new Template("Template.Block", (function() {
  var view = this;
  return HTML.CANVAS({
    id: function() {
      return Spacebars.mustache(view.lookup("block_id"));
    },
    "class": "block"
  });
}));

Template.__checkName("registerPopup");
Template["registerPopup"] = new Template("Template.registerPopup", (function() {
  var view = this;
  return HTML.Raw('<a href="#reg-popup" class="reg-popup-link">Register</a>');
}));

Template.__checkName("logInPopup");
Template["logInPopup"] = new Template("Template.logInPopup", (function() {
  var view = this;
  return HTML.Raw('<a href="#log-popup" class="log-popup-link">Log in</a>');
}));

Template.__checkName("registerForm");
Template["registerForm"] = new Template("Template.registerForm", (function() {
  var view = this;
  return HTML.Raw('<form action="" method="GET">\n    <label>Username</label> <br><input type="text" name="username"><br>\n    <label>Email   </label> <br><input type="email" name="email"><br>\n    <label>Password</label> <br><input type="password" name="password"><br>\n    <input type="submit" value="REGISTER">\n  </form>');
}));

Template.__checkName("logInForm");
Template["logInForm"] = new Template("Template.logInForm", (function() {
  var view = this;
  return HTML.Raw('<form action="" method="GET">\n    <label>Username</label> <br><input type="text" name="username"><br>\n    <label>Password</label> <br><input type="password" name="password"><br>\n    <input type="submit" value="LOGIN">\n  </form>');
}));

})();
