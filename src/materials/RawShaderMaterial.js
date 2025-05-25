/**
 * @author mrdoob / http://mrdoob.com/
 */

import {ShaderMaterial} from './ShaderMaterial.js'
function RawShaderMaterial( parameters ) {

	ShaderMaterial.call( this, parameters );

	this.type = 'RawShaderMaterial';

};

RawShaderMaterial.prototype = Object.create( ShaderMaterial.prototype );
RawShaderMaterial.prototype.constructor = RawShaderMaterial;

RawShaderMaterial.prototype.clone = function () {

	var material = new RawShaderMaterial();

	ShaderMaterial.prototype.clone.call( this, material );

	return material;

};
export {RawShaderMaterial}