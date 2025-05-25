/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  emissive: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
 *  opacity: <float>,
 *
 *  map: new Texture( <Image> ),
 *
 *  lightMap: new Texture( <Image> ),
 *
 *  bumpMap: new Texture( <Image> ),
 *  bumpScale: <float>,
 *
 *  normalMap: new Texture( <Image> ),
 *  normalScale: <Vector2>,
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
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */
 import { Material } from './Material.js';
function MeshPhongMaterial( parameters ) {

	Material.call( this );

	this.type = 'MeshPhongMaterial';

	this.color = new Color( 0xffffff ); // diffuse
	this.ambient = new Color( 0xffffff );
	this.emissive = new Color( 0x000000 );
	this.specular = new Color( 0x111111 );
	this.shininess = 30;

	this.metal = false;

	this.wrapAround = false;
	this.wrapRGB = new Vector3( 1, 1, 1 );

	this.map = null;

	this.lightMap = null;

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalScale = new Vector2( 1, 1 );

	this.specularMap = null;

	this.alphaMap = null;

	this.envMap = null;
	this.combine = MultiplyOperation;
	this.reflectivity = 1;
	this.refractionRatio = 0.98;

	this.fog = true;

	this.shading = SmoothShading;

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = 'round';
	this.wireframeLinejoin = 'round';

	this.vertexColors = NoColors;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

};

MeshPhongMaterial.prototype = Object.create( Material.prototype );
MeshPhongMaterial.prototype.constructor = MeshPhongMaterial;

MeshPhongMaterial.prototype.clone = function () {

	var material = new MeshPhongMaterial();

	Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.ambient.copy( this.ambient );
	material.emissive.copy( this.emissive );
	material.specular.copy( this.specular );
	material.shininess = this.shininess;

	material.metal = this.metal;

	material.wrapAround = this.wrapAround;
	material.wrapRGB.copy( this.wrapRGB );

	material.map = this.map;

	material.lightMap = this.lightMap;

	material.bumpMap = this.bumpMap;
	material.bumpScale = this.bumpScale;

	material.normalMap = this.normalMap;
	material.normalScale.copy( this.normalScale );

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
	material.morphNormals = this.morphNormals;

	return material;

};
export {MeshPhongMaterial}