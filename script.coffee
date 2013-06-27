angular = window.angular

app = angular.module('gw2App', ['ngResource'])

app.config ($routeProvider, $locationProvider) ->
  $routeProvider.when('/world/:worldId', { controller: 'gw2Ctrl' })

app.controller 'gw2Ctrl', ($scope, $http, $resource, $location, $route, $routeParams, $timeout) ->
  $http.defaults.useXDomain = true
  # So CORS works event without OPTIONS requests supported by API server
  delete $http.defaults.headers.common['X-Requested-With']

  $scope.$on "$routeChangeSuccess", ($currentRoute, $previousRoute) ->
    $scope.worldId = parseInt($routeParams.worldId)

  Worlds = $resource('https://api.guildwars2.com/v1/world_names.json')
  Matches = $resource('https://api.guildwars2.com/v1/wvw/matches.json')
  MatchDetails = $resource('https://api.guildwars2.com/v1/wvw/match_details.json')
  Events = $resource('https://api.guildwars2.com/v1/events.json')

  timer = null
  $scope.interval = 0

  $scope.worlds = Worlds.query (records)->
    for r in records
      r.id = parseInt(r.id)
    
  $scope.redWorld = {}
  $scope.blueWorld = {}
  $scope.greenWorld = {}

  $scope.watchedEvents = [
    { id: "0464CB9E-1848-4AAA-BA31-4779A959DD71", name: "Claw of Jormag" },
    { id: "568A30CF-8512-462F-9D67-647D69BEFAED", name: "Tequatl the Sunless" },
    { id: "03BF176A-D59F-49CA-A311-39FC6F533F2F", name: "The Shatterer" },
    { id: "31CEBA08-E44D-472F-81B0-7143D73797F5", name: "Shadow behemoth"},
    { id: "33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4", name: "Fire elemental"},
    { id: "C5972F64-B894-45B4-BC31-2DEEA6B7C033", name: "Jungle wurm"},
    { id: "9AA133DC-F630-4A0E-BB5D-EE34A2B306C2", name: "Golem Mark II"},

    { id: "2555EFCB-2927-4589-AB61-1957D9CC70C8", name: "Balthazar"},
    { id: "A5B5C2AF-22B1-4619-884D-F231A0EE0877", name: "Melandru"},
    { id: "0372874E-59B7-4A8F-B535-2CF57B8E67E4", name: "Lyssa"},
    { id: "99254BA6-F5AE-4B07-91F1-61A9E7C51A51", name: "Grenth"},
    { id: "6A6FD312-E75C-4ABF-8EA1-7AE31E469ABA", name: "Dwayna"},

    { id: "F7D9D427-5E54-4F12-977A-9809B23FBA99", name: "Frozen Maw"},
    { id: "4B478454-8CD2-4B44-808C-A35918FA86AA", name: "Foulbear Chieftain"},
    { id: "E6872A86-E434-4FC1-B803-89921FF0F6D6", name: "Ulgoth the Mondniir"},
    { id: "95CA969B-0CC6-4604-B166-DBCCE125864F", name: "Dredge Commissar"},
    { id: "242BD241-E360-48F1-A8D9-57180E146789", name: "Taidha Covington"},
    { id: "295E8D3B-8823-4960-A627-23E07575ED96", name: "Fire Shaman"},
    { id: "A0796EC5-191D-4389-9C09-E48829D1FDB2", name: "Eye of Zaithan"}
  ]

  eventNotificationsEnabled = false

  fetch = ->
    Matches.get {}, (data) ->
      # Loop through the matches to find in wich one the selected world is participating
      for m in data.wvw_matches
        if (m.red_world_id == $scope.worldId || m.blue_world_id == $scope.worldId || m.green_world_id == $scope.worldId)
          # Found!
          $scope.matchId = m.wvw_match_id

          # Moar details pliz
          MatchDetails.get { match_id: $scope.matchId }, (data) ->
            $scope.matchDetails = data

            $scope.redWorld.score = {}
            $scope.blueWorld.score = {}
            $scope.greenWorld.score = {}

            $scope.redWorld.score['Total'] = data.scores[0]
            $scope.blueWorld.score['Total'] = data.scores[1]
            $scope.greenWorld.score['Total'] = data.scores[2]

            for map in data.maps
              $scope.redWorld.score[map.type] = map.scores[0]
              $scope.blueWorld.score[map.type] = map.scores[1]
              $scope.greenWorld.score[map.type] = map.scores[2]
          
          # Retrieve the name of the three worlds in this match
          for w in $scope.worlds
            switch w.id
              when m.red_world_id   then $scope.redWorld.name = w.name
              when m.blue_world_id  then $scope.blueWorld.name = w.name
              when m.green_world_id then $scope.greenWorld.name = w.name
                      
          break

    # Get the new states for the watched events
    Events.get { world_id: $scope.worldId }, (data) ->
      events = data.events
      for we in $scope.watchedEvents
        we.state = "Inactive"
        for e in events
          if (e && e.event_id == we.id)
            we.state = e.state
            break

 # When a world is selected...
  $scope.$watch 'worldId', ->
    if (typeof $scope.worldId != 'undefined')
      fetch()
      # Update the uri so the page for the selected world can be refreshed and bookmarked
      $location.path('/world/' + $scope.worldId)

  # Set the selected refresh time interval
  $scope.$watch('interval', setTimer)

  $scope.$watch('watchedEvents', (newVal, oldVal) ->
    for i in [0..oldVal.length - 1] by 1
      if (oldVal[i].state != 'Active' && newVal[i].state == 'Active')
        notifyEvent(newVal[i])
  , true)

  setTimer = ->
    $timeout.cancel(timer)
    if ($scope.interval != "0")
      timer = $timeout(->
        fetch()
        setTimer()
      , $scope.interval)

  $scope.desktopNotificationsCapable = ->
    (window.webkitNotifications) ? true : false

  $scope.toggleEventNotifications = ->
    if (eventNotificationsEnabled == false || (window.webkitNotifications && webkitNotifications.checkPermission() != 0))
      webkitNotifications.requestPermission(-> eventNotificationsEnabled = true; $scope.$apply() )
    else
      eventNotificationsEnabled = false

  $scope.isEventNotificationsEnabled = ->
    eventNotificationsEnabled && window.webkitNotifications && webkitNotifications.checkPermission() == 0

  notifyEvent = (e) ->
    if $scope.isEventNotificationsEnabled()
      text = '"' + e.name + '" is active NAO!'
      webkitNotifications.createNotification('', "A Wild Dragon has Appeared in Tyria!", text).show()

  $scope.refresh = ->
    fetch()
    setTimer() # Reset the timer



angular.bootstrap(document, ['gw2App'])
