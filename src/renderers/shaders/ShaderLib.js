/**
 * Webgl Shader Library for js
 *
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

import {UniformsUtils} from './UniformsUtils.js'
import {UniformsLib} from './UniformsLib.js'
import {ShaderChunk} from './ShaderChunk.js'
var ShaderLib = {
	'basic': {
		uniforms: UniformsUtils.merge( [
			UniformsLib[ "common" ],
		] ),
		vertexShader: [
			ShaderChunk[ "color_pars_vertex" ],
			"void main() {",
				ShaderChunk[ "color_vertex" ],
				ShaderChunk[ "default_vertex" ],
			"}"
		].join("\n"),
		fragmentShader: [
			"uniform vec3 diffuse;",
			"uniform float opacity;",
			ShaderChunk[ "color_pars_fragment" ],
			"void main() {",
			"	gl_FragColor = vec4( diffuse, opacity );",
				ShaderChunk[ "color_fragment" ],
			"}"

		].join("\n")
	},

};
export {ShaderLib}
