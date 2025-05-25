/**
 * @author mrdoob / http://mrdoob.com/
 */
import { _Math } from '../math/Math.js';
function MeshFaceMaterial ( materials ) {

	this.uuid = _Math.generateUUID();

	this.type = 'MeshFaceMaterial';
	
	this.materials = materials instanceof Array ? materials : [];

};

Object.assign( MeshFaceMaterial.prototype, {

	constructor: MeshFaceMaterial,

	toJSON: function () {

		var output = {
			metadata: {
				version: 4.2,
				type: 'material',
				generator: 'MaterialExporter'
			},
			uuid: this.uuid,
			type: this.type,
			materials: []
		};

		for ( var i = 0, l = this.materials.length; i < l; i ++ ) {

			output.materials.push( this.materials[ i ].toJSON() );

		}

		return output;

	},

	clone: function () {

		var material = new MeshFaceMaterial();

		for ( var i = 0; i < this.materials.length; i ++ ) {

			material.materials.push( this.materials[ i ].clone() );

		}

		return material;

	}

});

export {MeshFaceMaterial}
