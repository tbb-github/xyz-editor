/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new Texture( <Image> ),
 *
 *  blending: NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *	uvOffset: new Vector2(),
 *	uvScale: new Vector2(),
 *
 *  fog: <bool>
 * }
 */
 import {Material} from './Material.js'
 function SpriteMaterial ( parameters ) {

	Material.call( this );

	this.type = 'SpriteMaterial';

	this.color = new Color( 0xffffff );
	this.map = null;

	this.rotation = 0;

	this.fog = false;

	// set parameters

	this.setValues( parameters );

};

SpriteMaterial.prototype = Object.create( Material.prototype );
SpriteMaterial.prototype.constructor = SpriteMaterial;

SpriteMaterial.prototype.clone = function () {

	var material = new SpriteMaterial();

	Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.map = this.map;

	material.rotation = this.rotation;

	material.fog = this.fog;

	return material;

};
export { SpriteMaterial };