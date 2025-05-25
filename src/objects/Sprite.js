/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */
import {Object3D} from '../core/Object3D.js'
import {BufferGeometry} from '../core/BufferGeometry.js'
import {BufferAttribute} from '../core/BufferAttribute.js'
import {SpriteMaterial} from '../materials/SpriteMaterial.js'
import {Vector3} from '../math/Vector3.js'
var geometry;
function Sprite(material) {

	Object3D.call( this );

	this.type = 'Sprite';

	

	if ( geometry === undefined ) {
		var indices = new Uint16Array( [ 0, 1, 2,  0, 2, 3 ] );
		var vertices = new Float32Array( [ - 0.5, - 0.5, 0,   0.5, - 0.5, 0,   0.5, 0.5, 0,   - 0.5, 0.5, 0 ] );
		var uvs = new Float32Array( [ 0, 0,   1, 0,   1, 1,   0, 1 ] );

		var geometry = new BufferGeometry();
		geometry.addAttribute( 'index', new BufferAttribute( indices, 1 ) );
		geometry.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'uv', new BufferAttribute( uvs, 2 ) );
	}

	this.geometry = geometry;
	this.material = ( material !== undefined ) ? material : new SpriteMaterial();

};

Sprite.prototype = Object.assign( Object.create( Object3D.prototype ), {
	constructor: Sprite,

	isSprite: true,
	raycast:( function () {

		var matrixPosition = new Vector3();
	
		return function ( raycaster, intersects ) {
	
			matrixPosition.setFromMatrixPosition( this.matrixWorld );
	
			var distance = raycaster.ray.distanceToPoint( matrixPosition );
	
			if ( distance > this.scale.x ) {
	
				return;
	
			}
	
			intersects.push( {
	
				distance: distance,
				point: this.position,
				face: null,
				object: this
	
			} );
	
		};
	
	})(),
	clone: function ( object ) {
	
		if ( object === undefined ) object = new Sprite( this.material );
	
		Object3D.prototype.clone.call( this, object );
	
		return object;
	
	}
});
// Sprite.prototype = Object.create( Object3D.prototype );
// Sprite.prototype.constructor = Sprite;

// Backwards compatibility

// Particle = Sprite;

export {Sprite}
