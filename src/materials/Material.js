/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
import { EventDispatcher } from '../core/EventDispatcher.js';
import { _Math } from '../math/Math.js';
import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';
function Material () {

	Object.defineProperty( this, 'id', { value: MaterialIdCount ++ } );

	this.uuid = _Math.generateUUID();

	this.name = '';
	this.type = 'Material';

	this.side = 0;//FrontSide

	this.opacity = 1;
	this.transparent = false;

	this.blending = 1;//NormalBlending

	this.blendSrc = 204;//SrcAlphaFactor
	this.blendDst = 205;//OneMinusSrcAlphaFactor
	this.blendEquation = 100;//AddEquation

	this.depthTest = true;
	this.depthWrite = true;

	this.polygonOffset = false;
	this.polygonOffsetFactor = 0;
	this.polygonOffsetUnits = 0;

	this.alphaTest = 0;

	this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this.needsUpdate = true;

};

Object.assign( Material.prototype,  {

	constructor: Material,

	setValues: function ( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "Material: '" + key + "' parameter is undefined." );
				continue;

			}

			if ( key in this ) {

				var currentValue = this[ key ];

				if ( currentValue instanceof Color ) {

					currentValue.set( newValue );

				} else if ( currentValue instanceof Vector3 && newValue instanceof Vector3 ) {

					currentValue.copy( newValue );

				} else if ( key == 'overdraw' ) {

					// ensure overdraw is backwards-compatable with legacy boolean type
					this[ key ] = Number( newValue );

				} else {

					this[ key ] = newValue;

				}

			}

		}

	},

	toJSON: function () {

		var output = {
			metadata: {
				version: 4.2,
				type: 'material',
				generator: 'MaterialExporter'
			},
			uuid: this.uuid,
			type: this.type
		};

		if ( this.name !== "" ) output.name = this.name;

		if ( this instanceof MeshBasicMaterial ) {

			output.color = this.color.getHex();
			if ( this.vertexColors !== NoColors ) output.vertexColors = this.vertexColors;
			if ( this.blending !== NormalBlending ) output.blending = this.blending;
			if ( this.side !== FrontSide ) output.side = this.side;

		} else if ( this instanceof MeshLambertMaterial ) {

			output.color = this.color.getHex();
			output.ambient = this.ambient.getHex();
			output.emissive = this.emissive.getHex();
			if ( this.vertexColors !== NoColors ) output.vertexColors = this.vertexColors;
			if ( this.blending !== NormalBlending ) output.blending = this.blending;
			if ( this.side !== FrontSide ) output.side = this.side;

		} else if ( this instanceof MeshPhongMaterial ) {

			output.color = this.color.getHex();
			output.ambient = this.ambient.getHex();
			output.emissive = this.emissive.getHex();
			output.specular = this.specular.getHex();
			output.shininess = this.shininess;
			if ( this.vertexColors !== NoColors ) output.vertexColors = this.vertexColors;
			if ( this.blending !== NormalBlending ) output.blending = this.blending;
			if ( this.side !== FrontSide ) output.side = this.side;

		} else if ( this instanceof MeshNormalMaterial ) {

			if ( this.shading !== FlatShading ) output.shading = this.shading;
			if ( this.blending !== NormalBlending ) output.blending = this.blending;
			if ( this.side !== FrontSide ) output.side = this.side;

		} else if ( this instanceof MeshDepthMaterial ) {

			if ( this.blending !== NormalBlending ) output.blending = this.blending;
			if ( this.side !== FrontSide ) output.side = this.side;

		} else if ( this instanceof ShaderMaterial ) {

			output.uniforms = this.uniforms;
			output.vertexShader = this.vertexShader;
			output.fragmentShader = this.fragmentShader;

		} else if ( this instanceof SpriteMaterial ) {

			output.color = this.color.getHex();

		}

		if ( this.opacity < 1 ) output.opacity = this.opacity;
		if ( this.transparent !== false ) output.transparent = this.transparent;
		if ( this.wireframe !== false ) output.wireframe = this.wireframe;

		return output;

	},

	clone: function ( material ) {

		if ( material === undefined ) material = new Material();

		material.name = this.name;

		material.side = this.side;

		material.opacity = this.opacity;
		material.transparent = this.transparent;

		material.blending = this.blending;

		material.blendSrc = this.blendSrc;
		material.blendDst = this.blendDst;
		material.blendEquation = this.blendEquation;

		material.depthTest = this.depthTest;
		material.depthWrite = this.depthWrite;

		material.polygonOffset = this.polygonOffset;
		material.polygonOffsetFactor = this.polygonOffsetFactor;
		material.polygonOffsetUnits = this.polygonOffsetUnits;

		material.alphaTest = this.alphaTest;

		material.overdraw = this.overdraw;

		material.visible = this.visible;

		return material;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

});

EventDispatcher.prototype.apply( Material.prototype );

var MaterialIdCount = 0;

export { Material };
