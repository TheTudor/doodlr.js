// the parse package used can be added with
// meteor add timmyg13:parse-sdk
Parse.initialize("9QOijSH3c8VZ4OMuXSNtcyZ9DOlNCttX9iMsv1GL", "mbIy8g11RvZG6c2hoZ9IHumiEGszjWyACcaOcsHg");

if (Meteor.isClient) {

  //initialise popups
  Template.logInPopup.onRendered(function() {
    $('.log-popup-link').magnificPopup({
      type:'inline',
      midClick: true 
    });
  }); 

  Template.registerPopup.onRendered(function() {
    $('.reg-popup-link').magnificPopup({
      type:'inline',
      midClick: true 
    }); 
  });

  // Loading bricks for home page meta-wall
  Template.Wall.helpers({
    rows: function() {
      var rows = [];
      for (var i = 1; i <= 5; i++) {
        var blocks = []
        for (var j = 1; j <= 5; j++) {
          var id = "x" + i + "y" + j;
          blocks.push({ block_id: id });
        }
        rows.push({ blocks: blocks });
      }
      return rows;
    }
  });

  // Loading a drawing on each brick
  Template.Block.onRendered(function() {
    var block = this.find('canvas');
    var block_id = block.id;

    var ctx = block.getContext('2d');
    loadImage(block_id, ctx, block.width, block.height);
  });

  // TODO: include canvas.js here to remove duplicate function? 
  function loadImage(id, ctx, w, h) {
    var rowIndex = id.indexOf("x") + 1;
    var colIndex = id.indexOf("y") + 1;

    var row = +id.slice(rowIndex, colIndex - 1);
    var col = +id.slice(colIndex, id.length);
    console.log("Loading brick at location " + row + ", " + col);
  
    var brick = Parse.Object.extend("Brick");
    var query = new Parse.Query(brick);
    query.equalTo("row", row);
    query.equalTo("column", col);

    query.first({
      success: function(brick) {
        // found a drawing for that brick, so loads it
        if(brick != undefined) {
          var image = new Image();  
          image.setAttribute('crossOrigin', 'anonymous');
          image.onload = function() {
            ctx.drawImage(image, 0, 0, w, h);
          };
          image.src =  brick.get("image")._url;
        }
        // no brick, white canvas free for all!
        else {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, w, h); 
        }
      },
      error: function(error) {
        console.log("Parse retrieval error");
      }
    });
  }

  // Click event to redirect to canvas 
  Template.Block.events({
    'click': function(e, template) {
      var block = template.find('canvas');
      var id    = block.id;
      window.location.href = "/canvas/" + id;
    }
  });

  // User management
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
          console.log(user.get("username") + " logged in.");
        },
        error: function(user, error) {
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    }
  });
}
