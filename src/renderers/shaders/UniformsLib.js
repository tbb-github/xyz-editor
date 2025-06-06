/**
 * Uniforms library for shared webgl shaders
 */
import { Color } from '../../math/Color.js';
var UniformsLib = {

	common: {
		"diffuse" : { type: "c", value: new Color( 0xeeeeee ) },
		"opacity" : { type: "f", value: 1.0 },
	},
};
export {UniformsLib}