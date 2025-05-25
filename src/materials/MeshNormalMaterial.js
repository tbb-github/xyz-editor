/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  shading: FlatShading,
 *  blending: NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */
import { Material } from './Material.js';
 function MeshNormalMaterial( parameters ) {

	Material.call( this, parameters );

	this.type = 'MeshNormalMaterial';

	this.shading = FlatShading;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.morphTargets = false;

	this.setValues( parameters );

};

MeshNormalMaterial.prototype = Object.create( Material.prototype );
MeshNormalMaterial.prototype.constructor = MeshNormalMaterial;

MeshNormalMaterial.prototype.clone = function () {

	var material = new MeshNormalMaterial();

	Material.prototype.clone.call( this, material );

	material.shading = this.shading;

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;

	return material;

};
export {MeshNormalMaterial}