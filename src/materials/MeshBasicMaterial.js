/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new Texture( <Image> ),
 *
 *  lightMap: new Texture( <Image> ),
 *
 *  specularMap: new Texture( <Image> ),
 *
 *  alphaMap: new Texture( <Image> ),
 *
 *  envMap: new TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: SmoothShading,
 *  blending: NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: NoColors / VertexColors / FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *
 *  fog: <bool>
 * }
 */
import { Material } from './Material.js';
import { Color } from '../math/Color.js';
function MeshBasicMaterial ( parameters ) {

	Material.call( this );

	this.type = 'MeshBasicMaterial';

	this.color = new Color( 0xffffff ); // emissive

	this.map = null;

	this.lightMap = null;

	this.specularMap = null;

	this.alphaMap = null;

	this.envMap = null;
	this.combine = 0;//MultiplyOperation
	this.reflectivity = 1;
	this.refractionRatio = 0.98;

	this.fog = true;

	this.shading = 2;//SmoothShading

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = 'round';
	this.wireframeLinejoin = 'round';

	this.vertexColors = 0;//NoColors

	this.skinning = false;
	this.morphTargets = false;

	this.setValues( parameters );

};

MeshBasicMaterial.prototype = Object.create( Material.prototype );
MeshBasicMaterial.prototype.constructor = MeshBasicMaterial;
MeshBasicMaterial.prototype.isMeshBasicMaterial = true;
MeshBasicMaterial.prototype.clone = function () {

	var material = new MeshBasicMaterial();

	Material.prototype.clone.call( this, material );

	material.color.copy( this.color );

	material.map = this.map;

	material.lightMap = this.lightMap;

	material.specularMap = this.specularMap;

	material.alphaMap = this.alphaMap;

	material.envMap = this.envMap;
	material.combine = this.combine;
	material.reflectivity = this.reflectivity;
	material.refractionRatio = this.refractionRatio;

	material.fog = this.fog;

	material.shading = this.shading;

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;
	material.wireframeLinecap = this.wireframeLinecap;
	material.wireframeLinejoin = this.wireframeLinejoin;

	material.vertexColors = this.vertexColors;

	material.skinning = this.skinning;
	material.morphTargets = this.morphTargets;

	return material;

};

export { MeshBasicMaterial };
