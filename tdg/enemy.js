
goog.provide('tdg.Enemy') ;

goog.require('tdg.Layer') ;
goog.require('lime.Layer') ;
goog.require('lime.Sprite') ;
goog.require('lime.fill.Color') ;
goog.require('lime.animation.MoveTo') ;

tdg.EnemyHPBar = function(enemy) {

  lime.Layer.call(this) ;

  var w = tdg.getScaled(1) ;
  var h = tdg.getScaled(0.1) ;
  var b = tdg.getScaled(0.02) ;
  this._enemy = enemy ;
  this._bg = new lime.Sprite ;
  this._damage = new lime.Sprite ;
  this._stroke = new lime.Sprite ;

  this._bg.setAnchorPoint( 0, 0 ) ;
  this._damage.setAnchorPoint( 1, 0 ) ;
  this._stroke.setAnchorPoint( 0, 0 ) ;
  this._bg.setSize( w, h ) ;
  this._damage.setSize( w, h ) ;
  this._stroke.setSize( w, h / 3 ) ;
  this._damage.setPosition( w, 0 ) ;
  this._stroke.setPosition( 0, h ) ;
  this._bg.setFill('#0c0') ;
  this._damage.setFill('#c00') ;
  this._stroke.setFill('#fff') ;

  this.appendChild(this._stroke) ;
  this.appendChild(this._bg) ;
  this.appendChild(this._damage) ;

}
goog.inherits( tdg.EnemyHPBar, lime.Layer ) ;

tdg.EnemyHPBar.prototype.setDamage = function(df) {
  this._damage.setScale( df, 1 ) ;
}

tdg.Enemy = function() {

  // call parents constructor
  tdg.Layer.call(this) ;

  var w = h = tdg.getScaled(1) ;
  this._body = new lime.Sprite ;
  this._hpBar = new tdg.EnemyHPBar(this) ;

  // first hp, then damage
  this.setHitPoints(1) ;
  this.setDamage(0) ;
  this.setSpeed(1) ;
  this.setColor('black') ;

  this._body.setAnchorPoint( 0, 0 ) ;
  this._hpBar.setAnchorPoint( 0, 0 ) ;
  this._body.setSize( w, h ) ;

  this.appendChild(this._body) ;
  this.appendChild(this._hpBar) ;

}
goog.inherits( tdg.Enemy, tdg.Layer ) ;

tdg.Enemy.prototype.disposeInternal = function() {
  goog.base( this, 'disposeInternal' ) ;
  this.stopMovement() ;
  delete this._body ;
  delete this._hpBar ;
}

tdg.Enemy.prototype.moveTo = function(coords) {
  this._pathCoords = goog.array.clone(coords) ;
  this._moveThrough() ;
}

tdg.Enemy.prototype._moveThrough = function() {

  var speed = this.getSpeed() ;
  var coord = this._pathCoords.shift() ;

  if (!coord) {
    if (this.isAlive())
      tdg.gameOver(this) ;
    return ;
  }

  this._pathAnim = new lime.animation.MoveTo( coord.x, coord.y ) ;
  this._pathAnim.setSpeed( 1 / speed * 100 ) ;
  this._pathAnim.setEasing(lime.animation.Easing.LINEAR) ;
  // TODO `setSpeed()' doesn't effect duration when using
  // `lime.animation.Sequence', so we queue events manually
  goog.events.listen(
    this._pathAnim ,
    lime.animation.Event.STOP ,
    this._moveThrough ,
    false ,
    this
  ) ;

  this.runAction(this._pathAnim) ;

}

tdg.Enemy.prototype.stopMovement = function() {
  if (!this._pathAnim)
    return ;
  var rv = goog.events.unlisten(
    this._pathAnim ,
    lime.animation.Event.STOP ,
    this._moveThrough ,
    false ,
    this
  ) ;
  this._pathAnim.stop() ;
}

tdg.Enemy.prototype.isAlive = function() { return !this.isDead() }
tdg.Enemy.prototype.isDead = function() { return !!this._isDead }
tdg.Enemy.prototype.die = function() {
  if (this._isDead)
    return ;
  this._isDead = true ;
  tdg.removeEnemy(this) ;
  this.dispose() ;
}

tdg.Enemy.prototype.isInvincible = function() { return !!this._isInvincible }
tdg.Enemy.prototype.makeInvincible = function() {
  this._isInvincible = true ;
  tdg.removeEnemy(this) ;
}

// hp
tdg.Enemy.prototype.getHitPoints = function() { return this._hp }
tdg.Enemy.prototype.setHitPoints = function(v) { this._hp = v }
tdg.Enemy.prototype.getDamage = function() { return this._damage }
tdg.Enemy.prototype.setDamage = function(v) {

  if (this.isInvincible())
    return ;

  var hp = this.getHitPoints() ;
  this._damage = Math.min( v, hp ) ;
  this._hpBar.setDamage( this._damage / hp ) ;
  if ( this._damage == hp )
    this.die() ;

}

tdg.Enemy.prototype.inflictDamage = function(v) {
  this.setDamage( this.getDamage() + v ) ;
}

// speed
tdg.Enemy.prototype.getSpeed = function() { return this._speed }
tdg.Enemy.prototype.setSpeed = function(v) { this._speed = v }

// color, type
tdg.Enemy.prototype.getType = function() { return this._type }
tdg.Enemy.prototype.setType = function(v) { this._type = v }
tdg.Enemy.prototype.getColor = function() { return this._color }
tdg.Enemy.prototype.setColor = function(v) {
  this._color = new lime.fill.Color(v) ;
  this._body.setFill(this._color) ;
}
