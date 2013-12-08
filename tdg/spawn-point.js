
goog.provide('tdg.SpawnPoint') ;

goog.require('tdg.Layer') ;
goog.require('lime.Sprite') ;
goog.require('lime.Label') ;

tdg.SpawnPoint = function() {

  tdg.Layer.call(this) ;

  var w = h = tdg.getScaled(1) ;
  this._wall = new lime.Sprite ;
  this._label = new lime.Label ;

  this.setEnemyType('black') ;
  this.setFrequency(1) ;
  this.setLimit(1) ;
  this.setTrajectory([]) ;
  this.setId(1) ;

  this._wall.setAnchorPoint( 0, 0 ) ;
  this._label.setAnchorPoint( 0, 0 ) ;
  this._wall.setSize( w, h ) ;
  this._label.setSize( w, h ) ;
  this._label.setFontSize(h) ;

  this.appendChild(this._wall) ;
  this.appendChild(this._label) ;

}
goog.inherits( tdg.SpawnPoint, tdg.Layer ) ;

tdg.SpawnPoint.prototype.activate = function() {
  var freq = this.getFrequency() ;
  var limit = this.getLimit() ;
  var prefs = this.getEnemyPrefs() ;
  var msg = 'No such enemy type: ' + this.getEnemyType() ;
  msg += '; SpawnPoint #' + this.getId() ;
  if (!prefs)
    alert(msg) ;
  else
    tdg.scheduleWFreq( this, this.spawn, freq, limit ) ;
}

tdg.SpawnPoint.prototype.spawn = function(dt) {
  var et = this.getEnemyType() ;
  var tr = this.getTrajectory() ;
  var enemy = tdg.getEnemyByType(et) ;
  enemy.setPosition(this.getPosition()) ;
  this.getParent().appendChild(enemy) ;
  enemy.moveTo(tr) ;
  tdg.recordEnemy(enemy) ;
}

tdg.SpawnPoint.prototype.getEnemyType = function() { return this._enemyType }
tdg.SpawnPoint.prototype.setEnemyType = function(v) {
  var ww = tdg.getScaled(0.1) ;
  this._enemyType = v ;
  this._wall.setStroke( ww, this.getEnemyColor()) ;
}

tdg.SpawnPoint.prototype.getEnemyColor = function() {
  var prefs = this.getEnemyPrefs() ;
  return prefs ? prefs.color : '' ;
}

tdg.SpawnPoint.prototype.getEnemyPrefs = function() {
  return tdg.getEnemyPrefs(this.getEnemyType()) ;
}

tdg.SpawnPoint.prototype.getFrequency = function() { return this._frequency }
tdg.SpawnPoint.prototype.setFrequency = function(v) { this._frequency = v }

tdg.SpawnPoint.prototype.getLimit = function() { return this._limit }
tdg.SpawnPoint.prototype.setLimit = function(v) { this._limit = v }

tdg.SpawnPoint.prototype.getTrajectory = function() { return this._trajectory }
tdg.SpawnPoint.prototype.setTrajectory = function(v) { this._trajectory = v }

tdg.SpawnPoint.prototype.getId = function() { return this._id }
tdg.SpawnPoint.prototype.setId = function(v) {
  this._id = v ;
  this._label.setText(this._id) ;
}
