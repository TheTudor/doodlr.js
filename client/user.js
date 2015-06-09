if (Meteor.isClient) {
  Template.RegisterForm.events({  
    'submit form': function(e) {

      e.preDefault();

      var username = e.target.username.value;
      var email = e.target.email.value;
      var password = e.target.password.value;
    
      user = new Parse.User()

      user.set("username", username);
      user.set("password", password);
      user.set("email", email);

      user.signUp(null, {
        success: function(user) {
          console.log("User registered.");
        },
        error: function(user, error) {
          console.log("Error: " + error.code + " " + error.message);
        }

      });
    }
  });

  Template.LogInForm.events({  
    'submit form': function(e) {

      e.preDefault();

      var username = e.target.username.value;
      var password = e.target.password.value;
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          console.log(user.get("username") + " logged in.");
        },
        error: function(user, error) {
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    }
  });
}
