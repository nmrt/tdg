
goog.provide('tdg.Layer') ;
goog.require('lime.Layer') ;

tdg.Layer = function() {
  lime.Layer.call(this) ;
  this.setScale(tdg.SCALE) ;
  this.setAnchorPoint( 0, 0 ) ;
}
goog.inherits( tdg.Layer, lime.Layer ) ;

tdg.Layer.prototype.disposeInternal = function() {
  goog.base( this, 'disposeInternal' ) ;
  var nc = this.getNumberOfChildren() ;
  for ( var i = 0; i < nc; i++ )
    this.getChildAt(i).dispose() ;
  this.removeFromDOM() ;
  this.removeDomElement() ;
  this.removeAllChildren() ;
}

tdg.Layer.prototype.calcBoundingBox = function() {
  return this.getBoundingBox(this.measureContents()) ;
}

tdg.Layer.prototype.getCenter = function() {
  var box = this.calcBoundingBox() ;
  var center = new goog.math.Coordinate(
    box.left + ( box.right - box.left ) / 2 ,
    box.top + ( box.bottom - box.top ) / 2
  ) ;
  return center ;
}

tdg.Layer.prototype.removeFromDOM = function() {
  this.getParent().removeChild(this) ;
}
