// the parse package used can be added with
// meteor add timmyg13:parse-sdk
Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

if (Meteor.isClient) {
  
  Template.body.helpers({
    rows: function() {
      var rows = [];
      for (var i = 0; i < 5; i++) {
        var blocks = []
        for (var j = 0; j < 5; j++) {
          blocks.push("PLACEHOLDER");
        }
        rows.push({ blocks: blocks });
      }
      return rows;
    }
  });

  Template.registerForm.events({  
    'submit form': function(event) {

      event.preventDefault();

      var username = event.target.username.value;
      var email = event.target.email.value;
      var password = event.target.password.value;
    
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

  Template.logInForm.events({  
    'submit form': function(event) {

      event.preventDefault();

      var username = event.target.username.value;
      var password = event.target.password.value;
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          console.log("User logged in.");
        },
        error: function(user, error) {
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    }
  });
}
