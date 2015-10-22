
goog.provide('tdg.Cannon') ;

goog.require('tdg.Layer') ;
goog.require('lime.Circle') ;
goog.require('lime.fill.LinearGradient') ;
goog.require('lime.animation.MoveTo') ;

tdg.Projectile = function() {

  tdg.Layer.call(this) ;

  var l = tdg.getScaled(0.2) ;
  var s = tdg.getScaled(0.03) ;
  this._body = new lime.Sprite ;

  this._body.setAnchorPoint( 0, 0 ) ;
  this._body.setSize( l, 0 ) ;
  this._body.setStroke( s, 'red' ) ;

  this.appendChild(this._body) ;

}
goog.inherits( tdg.Projectile, tdg.Layer ) ;

tdg.Projectile.prototype.disposeInternal = function() {
  goog.base( this, 'disposeInternal' ) ;
  delete this._body ;
  lime.scheduleManager.unschedule( this._handleCollapse, this ) ;
  goog.events.unlisten(
    this._transAnim ,
    lime.animation.Event.STOP ,
    this._handleCollapse ,
    false ,
    this
  ) ;
}

tdg.Projectile.prototype.shoot = function( c, t ) {

  var cc = c.getCenter() ;
  var tc = t.getCenter() ;
  var angle = -goog.math.angle( cc.x, cc.y, tc.x, tc.y ) ;
  this._transAnim = new lime.animation.MoveTo(tc) ;
  this._cannon = c ;
  this._target = t ;

  this.setPosition(cc) ;
  this.setRotation(angle) ;
  c.getParent().appendChild(this) ;
  this._transAnim.setSpeed(10) ;
  this._transAnim.setEasing(lime.animation.Easing.EASEOUT) ;
  lime.scheduleManager.schedule( this._handleCollapse, this ) ;
  goog.events.listen(
    this._transAnim ,
    lime.animation.Event.STOP ,
    this._handleCollapse ,
    false ,
    this
  ) ;
  this.runAction(this._transAnim) ;

}

tdg.Projectile.prototype._handleCollapse = function(arg) {

  var tbb = this._target.calcBoundingBox() ;
  var pbb = this.calcBoundingBox() ;

  if (goog.math.Box.intersects( pbb, tbb )) {
    this.dispose() ;
    if (this._target.isDead())
      return ;
    this._target.inflictDamage(this._cannon.getAttackDamage()) ;
  }

  else if ( typeof arg == 'object' ) {
    if ( arg.type === lime.animation.Event.STOP )
      this.dispose() ;
  }

}

tdg.Cannon = function() {

  tdg.Layer.call(this) ;

  var bd = tdg.getScaled(1) ;
  this._body = new lime.Circle ;
  this._radShape = new lime.Circle ;

  this.setEnemyTypes(['black']) ;
  this.setAttackDamage(1) ;
  this.setAttackFrequency(1) ;
  this.setAttackRadius(1) ;

  this._body.setAnchorPoint( 0, 0 ) ;
  this._radShape.setAnchorPoint( 0, 0 ) ;
  this._body.setSize( bd, bd ) ;
  this._body.setFill('#000') ;
  this._radShape.setStroke( 1, '#000' ) ;

  this.appendChild(this._radShape) ;
  this.appendChild(this._body) ;

}
goog.inherits( tdg.Cannon, tdg.Layer ) ;

tdg.Cannon.prototype.activate = function() {
  tdg.scheduleWFreq( this, this.scan, this.getAttackFrequency()) ;
}

tdg.Cannon.prototype.scan = function(dt) {
  var enemies = tdg.findEnemies() ;
  for ( var i = 0; i < enemies.length; i++ ) {

    var enemy = enemies[i] ;
    var etype = enemy.getType() ;
    var ttypes = this.getEnemyTypes() ;
    var rv = false ;
    for ( var j = 0; j < ttypes.length; j++ ) {
      if ( ttypes[j] == etype ) {
        rv = true ;
        break ;
      }
    }

    if (!rv)
      continue ;

    var center = this.getCenter() ;
    var arad = this.getAttackRadius() ;
    var ebox = enemy.calcBoundingBox() ;
    var dist = goog.math.Box.distance( ebox, center ) ;

    if ( dist <= arad ) {
      new tdg.Projectile().shoot( this, enemy ) ;
      break ;
    }

  }
}

tdg.Cannon.prototype.getEnemyTypes = function() { return this._etypes }
tdg.Cannon.prototype.setEnemyTypes = function(v) {
  this._etypes = v ;
  // TODO maybe later ...
  // var gradient = new lime.fill.LinearGradient ;
  // var stops = 1 / ( this._etypes.length - 1 ) ;
  // for ( var i = 0; i < this._etypes.length; i++ ) {
  //   var t = tdg.getEnemyPrefs(this._etypes[i]) ;
  //   colors.push(t.color) ;
  // }
  // gradient.setDirection( 0,0, 1,1 ) ;
  // this._radShape.setFill( 0,0,0, 0.3 ) ;
}

tdg.Cannon.prototype.getAttackDamage = function() { return this._admg }
tdg.Cannon.prototype.setAttackDamage = function(v) { this._admg = v }

tdg.Cannon.prototype.getAttackFrequency = function() { return this._afreq }
tdg.Cannon.prototype.setAttackFrequency = function(v) { this._afreq = v }

tdg.Cannon.prototype.getAttackRadius = function() { return this._arad }
tdg.Cannon.prototype.setAttackRadius = function(v) {
  var br = this._body.getSize().width / 2 ;
  var dr = tdg.getScaled(v) ;
  var d = ( dr + br ) * 2 ;
  this._arad = v ;
  this._radShape.setSize( d, d ) ;
  this._radShape.setPosition( -dr, -dr ) ;
}
