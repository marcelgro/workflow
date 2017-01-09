var module = (function() {

  // stays private
  var privateVar = [];

  return { //exposed to public

      publicFunction: function(values) {
          privateVar.push(values);
      },
      anotherPublicFunction: function() {
          return privateVar.length;
      },
      init: function() {
          //every module has this function, we call it in the views
      }

  }

}());
