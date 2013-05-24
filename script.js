var app = angular.module('gw2App', ['ngResource']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/world/:worldId', { controller: 'gw2Ctrl' })
});

app.controller('gw2Ctrl', function($scope, $http, $resource, $location, $route, $routeParams, $timeout) {
  $http.defaults.useXDomain = true;
  // So CORS works event without OPTIONS requests supported by API server
  delete $http.defaults.headers.common['X-Requested-With'];

  $scope.$on("$routeChangeSuccess", function($currentRoute, $previousRoute) {
    $scope.worldId = $routeParams.worldId;
  });

  Worlds = $resource('https://api.guildwars2.com/v1/world_names.json');
  Matches = $resource('https://api.guildwars2.com/v1/wvw/matches.json');
  MatchDetails = $resource('https://api.guildwars2.com/v1/wvw/match_details.json');
  Events = $resource('https://api.guildwars2.com/v1/events.json');

  var timer;
  $scope.interval = 0;

  $scope.worlds = Worlds.query();
  $scope.redWorld = {};
  $scope.blueWorld = {};
  $scope.greenWorld = {};

  $scope.watchedEvents = [
    { id: "0464CB9E-1848-4AAA-BA31-4779A959DD71", name: "Claw of Jormag" },
    { id: "568A30CF-8512-462F-9D67-647D69BEFAED", name: "Tequatl the Sunless" },
    { id: "03BF176A-D59F-49CA-A311-39FC6F533F2F", name: "The Shatterer" }
  ]

  var eventNotificationsEnabled = false;
  var eventsToNotify = [];

  var fetch = function() {
    Matches.get({}, function(data) {
      // Loop through the matches to find the one in wich one the selected world is participating
      for (var i = 0; i < data.wvw_matches.length; i++) {
        m = data.wvw_matches[i];
        if (m.red_world_id == $scope.worldId || m.blue_world_id == $scope.worldId || m.green_world_id == $scope.worldId) {
          // Found!
          $scope.matchId = m.wvw_match_id;

          // Moar details pliz
          MatchDetails.get({ match_id: $scope.matchId }, function(data) {
            $scope.matchDetails = data;
            $scope.redWorld.score = data.scores[0];
            $scope.blueWorld.score = data.scores[1];
            $scope.greenWorld.score = data.scores[2];
          });
          
          // Retrieve the name of the three worlds in this match
          for (var j = 0; j < $scope.worlds.length; j++) {
            w = $scope.worlds[j];
            if (m.red_world_id == w.id)   { $scope.redWorld.name = w.name; }
            if (m.blue_world_id == w.id)  { $scope.blueWorld.name = w.name; }
            if (m.green_world_id == w.id) { $scope.greenWorld.name = w.name; }
          }

          // Get the new states for the watched events
          for (var i = 0; i < $scope.watchedEvents.length; i++) {
            we = $scope.watchedEvents[i];
            we.state = Events.get({ world_id: $scope.worldId, event_id: we.id}).$then(function(result) {
              e = result.data.events[0];
              return (e && e.state) ? e.state : "Inactive";
            });
          }

          break;
        }
      }
      notify();
    });
  }

 // When a world is selected...
  $scope.$watch('worldId', function() {
    if (typeof $scope.worldId != 'undefined') {
      fetch();
      // Update the uri so the page for the selected world can be refreshed and bookmarked
      $location.path('/world/' + $scope.worldId);
    }
  });

  $scope.$watch('interval', setTimer);

  var setTimer = function() {
    $timeout.cancel(timer);
    if ($scope.interval != "0") {
      timer = $timeout(function() {
        fetch();
        setTimer();
      }, $scope.interval);
    }
  }

  $scope.desktopNotificationsCapable = function() {
    return (window.webkitNotifications) ? true : false;
  }

  $scope.toggleEventNotifications = function() {
    if (eventNotificationsEnabled == false || (window.webkitNotifications && webkitNotifications.checkPermission() != 0)) {
      webkitNotifications.requestPermission(function() { eventNotificationsEnabled = true; $scope.$apply(); });
    } else {
      eventNotificationsEnabled = false;
    }
  }

  $scope.isEventNotificationsEnabled = function() {
    return eventNotificationsEnabled && window.webkitNotifications && webkitNotifications.checkPermission() == 0;
  }

  var addNotifyEvent = function(e) {
    if ($scope.isEventNotificationsEnabled()) { eventsToNotify.push(e); }
  }

  var notify = function() {
    if (eventsToNotify.length > 0 && $scope.isEventNotificationsEnabled()) {
      var text = "";
      for (var i = 0; i < eventsToNotify.length; i++) {
        text = text + '"' + eventsToNotify[i].name + '" is active NAO!';
        text = text + "\n";
      }
      webkitNotifications.createNotification('', "A Wild Dragon has Appeared in Tyria!", text).show();
    }
  }
});