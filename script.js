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
    { id: "03BF176A-D59F-49CA-A311-39FC6F533F2F", name: "The Shatterer" },
    { id: "31CEBA08-E44D-472F-81B0-7143D73797F5", name: "Shadow behemoth."},
    { id: "33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4", name: "Fire elemental"},
    { id: "C5972F64-B894-45B4-BC31-2DEEA6B7C033", name: "Jungle wurm"},
    { id: "9AA133DC-F630-4A0E-BB5D-EE34A2B306C2", name: "Golem Mark II"}
  ]

  var eventNotificationsEnabled = false;

  var fetch = function() {
    Matches.get({}, function(data) {
      // Loop through the matches to find in wich one the selected world is participating
      for (var i = 0; i < data.wvw_matches.length; i++) {
        m = data.wvw_matches[i];
        if (m.red_world_id == $scope.worldId || m.blue_world_id == $scope.worldId || m.green_world_id == $scope.worldId) {
          // Found!
          $scope.matchId = m.wvw_match_id;

          // Moar details pliz
          MatchDetails.get({ match_id: $scope.matchId }, function(data) {
            $scope.matchDetails = data;

            $scope.redWorld.score = {};
            $scope.blueWorld.score = {};
            $scope.greenWorld.score = {};

            $scope.redWorld.score['Total'] = data.scores[0];
            $scope.blueWorld.score['Total'] = data.scores[1];
            $scope.greenWorld.score['Total'] = data.scores[2];

            for (var j = 0; j < data.maps.length; j++) {
              map = data.maps[j];
              $scope.redWorld.score[map.type] = map.scores[0];
              $scope.blueWorld.score[map.type] = map.scores[1];
              $scope.greenWorld.score[map.type] = map.scores[2];
            }
          });
          
          // Retrieve the name of the three worlds in this match
          for (var j = 0; j < $scope.worlds.length; j++) {
            w = $scope.worlds[j];
            if (m.red_world_id == w.id)   { $scope.redWorld.name = w.name; }
            if (m.blue_world_id == w.id)  { $scope.blueWorld.name = w.name; }
            if (m.green_world_id == w.id) { $scope.greenWorld.name = w.name; }
          }

          break;
        }
      }
    });

    // Get the new states for the watched events
    Events.get({ world_id: $scope.worldId }, function(data) {
      events = data.events;
      for (var i = 0; i < $scope.watchedEvents.length; i++) {
        we = $scope.watchedEvents[i];
        we.state = "Inactive";
        for (var j = 0; j < events.length; j++) {
          e = events[j];
          if (e && e.event_id == we.id) {
            we.state = e.state;
            break;
          }
        }
      }
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

  // Set the selected refresh time interval
  $scope.$watch('interval', setTimer);

  $scope.$watch('watchedEvents', function(newVal, oldVal) {
    for (var i = 0; i < oldVal.length; i++) {
      if (oldVal[i].state != 'Active' && newVal[i].state == 'Active') {
        notifyEvent(newVal[i]);
      }
    }
  }, true);

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

  var notifyEvent = function(e) {
    if ($scope.isEventNotificationsEnabled()) {
      text = '"' + e.name + '" is active NAO!';
      webkitNotifications.createNotification('', "A Wild Dragon has Appeared in Tyria!", text).show();
    }
  }

  $scope.refresh = function() {
    fetch();
    setTimer(); // Reset the timer;
  }
});