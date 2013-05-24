<!doctype html> 
<html> 

<head>
  <meta charset="utf-8">
  <title>GW2API - AngularJS</title>
  <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css" rel="stylesheet">
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.4/angular.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.4/angular-resource.min.js"></script>
  <script src="script.js"></script>
  <style>
    .infos {
      font-size: 0.8em;
      margin-top: 1em;
    }
  </style>
</head> 

<body ng-app="gw2App" ng-controller="gw2Ctrl">
  <div class="container">

    <div class="navbar">
      <div class="navbar-inner">
        <div class="brand">Guild Wars 2 API + AngularJS</a>
      </div>
    </div>

    <div class="row">
      <div class="span3">
        <label for="world_select">World</label>
        <select id="world_select" ng-model="worldId" ng-options="world.id as world.name for world in worlds"></select>

        <label for="interval_select">Refresh every</label>
        <select id="interval_select" ng-model="interval">
          <option value="10000">10s</option>
          <option value="30000">30s</option>
          <option value="60000">1min</option>
          <option value="300000">5min</option>
          <option value="0">... time I hit the refresh button</option>
        </select>

        <button class="btn" ng-click="refresh()">Refresh</button>

        <button class="btn btn-primary" ng-click="toggleEventNotifications()" ng-disabled="!desktopNotificationsCapable()" title="Desktop notifications, webkit only">{{ isEventNotificationsEnabled() && 'Disable notifications' || 'Can I Has Notify?' }} </button>

        <p class="infos">
          Select a world, a refresh interval (or not) and that's it. If you have a Webkit browser (Chrome or Safari) you can also receive desktop notifications for "Active" dragon events by pressing the big blue button.
        </p>
        <hr>
        <p class="infos">
          <a href="https://forum-en.guildwars2.com/forum/community/api/AngularJS-example/" target="_blank">GW2 forum's thread (for feedback)</a> -
           <a href="https://gist.github.com/AlSquire/5624137" target="_blank">Source</a><br>
          By AlSquire.9203 (donations of silvers, minis, precursors, pictures of quaggans... are welcomed)
        </p>
      </div>

      <section id="wvw" class="span4">
        <h2>WvW</h2>
        <section>
          <h3>Red: {{redWorld.name}}</h3>
          {{redWorld.score}}
        </section>
        <section>
          <h3>Blue: {{blueWorld.name}}</h3>
          {{blueWorld.score}}
        </section>
        <section>
          <h3>Green: {{greenWorld.name}}</h3>
          {{greenWorld.score}}
        </section>
      </section>

      <section id="watched_events" class="span4">
        <h2>Dragons watcher</h2>
        <section ng-repeat="e in watchedEvents" class="state_{{e.state | lowercase}}">
          <h3>{{e.name}}</h3>
          {{e.state}}
        </section>
      </section>
    </div>
  </div>

</body>
</html>