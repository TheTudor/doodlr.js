(function(){
Template.__checkName("Wall");
Template["Wall"] = new Template("Template.Wall", (function() {
  var view = this;
  return [ Spacebars.include(view.lookupTemplate("registerForm")), "\n  ", Spacebars.include(view.lookupTemplate("logInForm")), "\n\n  ", HTML.DIV({
    "class": "wall"
  }, "\n    ", Blaze.Each(function() {
    return Spacebars.call(view.lookup("rows"));
  }, function() {
    return [ "\n      ", HTML.DIV({
      "class": "row"
    }, "\n      ", Blaze.Each(function() {
      return Spacebars.call(view.lookup("blocks"));
    }, function() {
      return [ "\n        ", Spacebars.include(view.lookupTemplate("block")), "\n      " ];
    }), "\n      "), "\n    " ];
  }), "\n  ") ];
}));

Template.__checkName("block");
Template["block"] = new Template("Template.block", (function() {
  var view = this;
  return HTML.Raw('<canvas id="block_" class="block"></canvas>');
}));

Template.__checkName("registerForm");
Template["registerForm"] = new Template("Template.registerForm", (function() {
  var view = this;
  return HTML.Raw('<form action="" method="GET">\n    Username: <input type="text" name="username"><br>\n    Email: <input type="email" name="email"><br>\n    Password: <input type="password" name="password"><br>\n    <input type="submit" value="Register">\n  </form>');
}));

Template.__checkName("logInForm");
Template["logInForm"] = new Template("Template.logInForm", (function() {
  var view = this;
  return HTML.Raw('<form action="" method="GET">\n    Username: <input type="text" name="username"><br>\n    Password: <input type="password" name="password"><br>\n    <input type="submit" value="Log in">\n  </form>');
}));

})();
