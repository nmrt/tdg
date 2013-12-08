
// set main namespace
goog.provide('tdg') ;

// get requirements
goog.require('lime.Director') ;
goog.require('lime.Scene') ;
goog.require('lime.Layer') ;
goog.require('lime.Label') ;
goog.require('lime.CoverNode') ;
goog.require('goog.math.Coordinate') ;
goog.require('goog.net.XhrIo') ;
goog.require('tdg.Layer') ;
goog.require('tdg.Enemy') ;
goog.require('tdg.SpawnPoint') ;
goog.require('tdg.Cannon') ;
goog.require('lime.animation.FadeTo') ;

// loading preferences
tdg.load = function() {
  goog.net.XhrIo.send(
    'preferences.json' ,
    function(e) {
      tdg.prefs = this.getResponseJson() ;
      tdg.start() ;
    }
  ) ;
}

// entrypoint
tdg.start = function() {

  var l = tdg.prefs.level ;
  var director = new lime.Director( document.body, l.width, l.height ) ;
  var scene = new lime.Scene ;
  var field = new lime.Layer ;
  this.scanningField = new tdg.Layer ;
  this.director = director ;
  this.scene = scene ;

  // set current scene active
  director.replaceScene(scene) ;

  // TODO coordinates are scaled too
  // field.setScale(tdg.SCALE) ;
  scene.appendChild(this.scanningField) ;
  scene.appendChild(field) ;

  // fortifying cannons
  for ( var i = 0; i < tdg.prefs.cannons.length; i++ ) {
    var conf = tdg.prefs.cannons[i] ;
    var cannon = new tdg.Cannon ;
    cannon.setPosition( conf.position.x, conf.position.y ) ;
    cannon.setEnemyTypes(conf.enemyTypes) ;
    cannon.setAttackDamage(conf.attack.damage) ;
    cannon.setAttackFrequency(conf.attack.frequency) ;
    cannon.setAttackRadius(conf.attack.radius) ;
    field.appendChild(cannon) ;
    cannon.activate() ;
  }

  // building spawn points
  for ( var i = 0; i < tdg.prefs.spawnPoints.length; i++ ) {
    var conf = tdg.prefs.spawnPoints[i] ;
    var esp = new tdg.SpawnPoint ;
    esp.setPosition( conf.position.x, conf.position.y ) ;
    esp.setEnemyType(conf.enemyType) ;
    esp.setFrequency(conf.frequency) ;
    esp.setLimit(conf.limit) ;
    esp.setTrajectory(conf.trajectory) ;
    esp.setId(i) ;
    field.appendChild(esp) ;
    esp.activate() ;
  }

  goog.events.listen( window, 'keyup', function(e) {
    if ( e.keyCode == 32 )
      tdg.togglePaused() ;
  }) ;
  goog.events.listen( document, [ 'click', 'touchend' ], function(e) {
    if (e.isMouseActionButton())
      tdg.togglePaused() ;
  }) ;

}


tdg._enemies = [] ;
tdg.findEnemies = function() { return tdg._enemies }
tdg.recordEnemy = function(x) { tdg._enemies.push(x) }
tdg.removeEnemy = function(x) {

  var i ;
  if ( typeof x == 'number' )
    i = x ;
  else {
    for ( i = 0; i < tdg._enemies.length; i++ ) {
      if ( tdg._enemies[i] === x )
        break ;
    }
  }

  tdg._enemies.splice( i, 1 ) ;

}

tdg.getEnemyPrefs = function(t) {
  var prefs = tdg.prefs.enemyTypes[t] ;
  return prefs ;
}

tdg.getEnemyByType = function(t) {
  var type = tdg.getEnemyPrefs(t) ;
  var enemy = new tdg.Enemy ;
  enemy.setType(t) ;
  enemy.setColor(type.color) ;
  enemy.setHitPoints(type.hp) ;
  enemy.setSpeed(type.speed) ;
  return enemy ;
}

tdg.SCALE = 1 / 100 ;
tdg.getScaled = function(n) {
  return n / tdg.SCALE ;
}

tdg.scheduleWFreq = function( c, m, f, l ) {
  // m.call(c) ;
  // if ( l <= 1 )
  //   return ;
  lime.scheduleManager.scheduleWithDelay(
    m ,
    c ,
    1 / f * 1000 ,
    l //- 1
  ) ;
}

tdg.togglePaused = function(v) {
  if ( v === tdg.director.isPaused())
    return ;
  if ( v === undefined )
    v = !tdg.director.isPaused() ;
  tdg.director.setPaused(v) ;
}

tdg.gameOver = function(enemy) {

  var s = new lime.Scene ;
  var l = new lime.Label ;
  var a = new lime.animation.FadeTo(1) ;
  var ds = this.director.getSize() ;

  this.director.pushScene(s) ;
  enemy.makeInvincible() ;
  s.appendChild(enemy) ;

  l.setText('Game Over') ;
  l.setFontColor('red') ;
  l.setFontSize(1) ;
  l.setPosition( ds.width/2, ds.height/2 ) ;
  l.setOpacity(0) ;
  s.appendChild(l) ;

  goog.events.listen(
    a ,
    lime.animation.Event.STOP ,
    function() {
      this.togglePaused(true) ;
      // pushing our scene with label back on top
      this.director.pushScene(s) ;
    } ,
    false ,
    this
  ) ;
  l.runAction(a) ;

}

// this is required for outside access after code is compiled in
// ADVANCED_COMPILATIONS mode
goog.exportSymbol( 'tdg.start', tdg.start ) ;
