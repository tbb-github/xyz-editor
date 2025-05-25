/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>,
 *
 *  blending: NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  vertexColors: <bool>,
 *
 *  fog: <bool>
 * }
 */
import { Material } from './Material.js';
function PointCloudMaterial( parameters ) {

	Material.call( this );

	this.type = 'PointCloudMaterial';

	this.color = new Color( 0xffffff );

	this.map = null;

	this.size = 1;
	this.sizeAttenuation = true;

	this.vertexColors = NoColors;

	this.fog = true;

	this.setValues( parameters );

};

PointCloudMaterial.prototype = Object.create( Material.prototype );
PointCloudMaterial.prototype.constructor = PointCloudMaterial;

PointCloudMaterial.prototype.clone = function () {

	var material = new PointCloudMaterial();

	Material.prototype.clone.call( this, material );

	material.color.copy( this.color );

	material.map = this.map;

	material.size = this.size;
	material.sizeAttenuation = this.sizeAttenuation;

	material.vertexColors = this.vertexColors;

	material.fog = this.fog;

	return material;

};

// backwards compatibility

function ParticleBasicMaterial ( parameters ) {

	console.warn( 'ParticleBasicMaterial has been renamed to PointCloudMaterial.' );
	return new PointCloudMaterial( parameters );

};

 function ParticleSystemMaterial( parameters ) {

	console.warn( 'ParticleSystemMaterial has been renamed to PointCloudMaterial.' );
	return new PointCloudMaterial( parameters );

};
export {PointCloudMaterial, ParticleBasicMaterial, ParticleSystemMaterial}