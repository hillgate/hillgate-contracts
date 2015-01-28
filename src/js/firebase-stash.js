function getFirebaseUserName(token, id) {
  var firebaseUrl = 'https://amber-inferno-2148.firebaseio.com/';
  var myFirebaseRef = new Firebase(firebaseUrl);

  myFirebaseRef.authWithCustomToken(token, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Login Succeeded!", authData);
      myFirebaseRef.child("users/" + id).on("value", function(snapshot) {
        console.log(snapshot.val().name);  // Alerts "San Francisco"
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }
  });
}

$.ajax({
  url: "http://localhost:5000/api/firebase",
  xhrFields: {withCredentials: true}
}).done(function(data) {
  getFirebaseUserName(data ,'54c2a70b3cdb74e83e267467')
});
