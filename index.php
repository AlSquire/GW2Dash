<!doctype html> 
<html> 

<head>
  <meta charset="utf-8">
  <title>GW2API - AngularJS</title>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.4/angular.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.4/angular-resource.min.js"></script>
  <script src="script.js"></script>
</head> 

<body ng-app="gw2App">
  <div ng-controller="gw2Ctrl">
    <h1>Guild Wars 2 API + AngularJS</h1>

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

    <section id="wvw">
      <h1>WvW</h1>
      <section>
        <h2>Red world: {{redWorld.name}}</h2>
        {{redWorld.score}}
      </section>
      <section>
        <h2>Blue world: {{blueWorld.name}}</h2>
        {{blueWorld.score}}
      </section>
      <section>
        <h2>Green world: {{greenWorld.name}}</h2>
        {{greenWorld.score}}
      </section>
    </section>

    <section id="watched_events">
      <h1>Dragons & co</h1>
      <section ng-repeat="e in watchedEvents" class="state_{{e.state.toLowerCase()}}">
        <h2>{{e.name}}</h2>
        {{e.state}}
      </section>
    </section>

  </div>
</body>
</html>