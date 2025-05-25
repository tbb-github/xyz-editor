/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';
 function Face3 ( a, b, c, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.normal = normal instanceof Vector3 ? normal : new Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [];

	this.color = color instanceof Color ? color : new Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

};

Object.assign( Face3.prototype, {

	constructor: Face3,

	clone: function () {

		var face = new Face3( this.a, this.b, this.c );

		face.normal.copy( this.normal );
		face.color.copy( this.color );

		face.materialIndex = this.materialIndex;

		for ( var i = 0, il = this.vertexNormals.length; i < il; i ++ ) {

			face.vertexNormals[ i ] = this.vertexNormals[ i ].clone();

		}

		for ( var i = 0, il = this.vertexColors.length; i < il; i ++ ) {

			face.vertexColors[ i ] = this.vertexColors[ i ].clone();

		}

		for ( var i = 0, il = this.vertexTangents.length; i < il; i ++ ) {

			face.vertexTangents[ i ] = this.vertexTangents[ i ].clone();

		}

		return face;

	}

});
export { Face3 };