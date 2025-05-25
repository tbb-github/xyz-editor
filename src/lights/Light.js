/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
import {Object3D} from '../core/Object3D.js'
function Light( color ) {

	Object3D.call( this );

	this.type = 'Light';
	
	this.color = new Color( color );

};

Light.prototype = Object.create( Object3D.prototype );
Light.prototype.constructor = Light;

Light.prototype.clone = function ( light ) {

	if ( light === undefined ) light = new Light();

	Object3D.prototype.clone.call( this, light );

	light.color.copy( this.color );

	return light;

};
export {Light}
