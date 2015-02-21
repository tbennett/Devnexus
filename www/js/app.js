angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.factory('sessions', function($http, $q, $stateParams) {
  var sessions = {};
  sessions.list = [];

  sessions.all = function() {
    return $http.get('https://devnexus.com/s/presentations.json')
      .then(function(response) {
        var rawData = response.data.presentationList.presentation
        for (i = 0; i < rawData.length; i++) {
          sessions.list.push(rawData[i]);
        }
      });
  };
  sessions.ready = $q.when(sessions.all());
  return sessions;
})



.service('session', function(sessions, $stateParams){
  session.byId = function(id) {
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].id === id) return sessions[i];
    }
  };
  return sessions.byId($stateParams.sessionId);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('sessions', {
      url: '/sessions',
      templateUrl: 'templates/sessions.html',
      controller: 'SessionsCtrl'
    })
    .state('session', {
      url: '/sessions/:sessionId',
      controller: 'SessionCtrl',
      templateUrl: 'templates/session.html'
    });
  $urlRouterProvider.otherwise('/sessions');
})

.controller('SessionsCtrl', function($scope, sessions, $ionicLoading) {
  $ionicLoading.show({
    template: '<ion-spinner class="spinner-light"></ion-spinner>'
  });

  sessions.ready.then(function() {
    $ionicLoading.hide();
    console.log(sessions.list[1].id);
});

  $scope.sessions = sessions.list;

})

.controller('SessionCtrl', function($scope, session, $stateParams, $cordovaSocialSharing, $cordovaCamera) {
  sessions.ready.then(function() {
    $scope.session = session.byId[$stateParams.sessionId];

  });


  $scope.share = function(session) {
    // Message var that grabs the session title and speaker info
    var message = "Attending " + session.title + " by " + session.speakers[0].firstName + " " + session.speakers[0].lastName + ". #DevNexus2015";

    //Lets call the camper api
    $cordovaCamera.getPicture().then(function(imageURI) {
      //create a photo var that will grab the image data
      //from the imageURI create by camera plugin
      var photo = imageURI;
      //Lets share that via social sharing plugin
      $cordovaSocialSharing
      //Share via twitter, and pass in the message & photo
        .shareViaTwitter(message, photo)
        .then(function(result) {
          // Success!
          console.log("Success!");
          //Write to console if everything worked
        }, function(err) {
          //If for some reason the app doesn work,
          //Show an alert to inform the user
          alert("Ruh-roh, looks like something went wrong :(");
        });
      //End Social sharing code

    }, function(err) {
      //If there's an error with the camera, lets log that error
      console.log(err);
    }, {
      // Variables that we pass into the camera api
      quality: 75,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: false
    });
  };
});
