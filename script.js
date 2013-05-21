angular.module('gw2App', ['ngResource']).controller('gw2Ctrl', function ($scope, $http, $resource) {
  $http.defaults.useXDomain = true;
  // So CORS works event without OPTIONS requests supported by API server
  delete $http.defaults.headers.common['X-Requested-With'];

  Worlds = $resource('https://api.guildwars2.com/v1/world_names.json');
  Matches = $resource('https://api.guildwars2.com/v1/wvw/matches.json');
  MatchDetails = $resource('https://api.guildwars2.com/v1/wvw/match_details.json');

  $scope.worlds = Worlds.query();
  $scope.redWorld = {};
  $scope.blueWorld = {};
  $scope.greenWorld = {};

  // When a world is selected...
  $scope.$watch('worldId', function() {
    Matches.get({}, function(data) {
      // Loop through the matches to find the one in wich the selected world is participating
      for(i = 0; i < data.wvw_matches.length; i++) {
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
          for (j= 0; j < $scope.worlds.length; j++) {
            w = $scope.worlds[j];
            if (m.red_world_id == w.id)   { $scope.redWorld.name = w.name; }
            if (m.blue_world_id == w.id)  { $scope.blueWorld.name = w.name; }
            if (m.green_world_id == w.id) { $scope.greenWorld.name = w.name; }
          }
          break;
        }
      }
    });
  });
});