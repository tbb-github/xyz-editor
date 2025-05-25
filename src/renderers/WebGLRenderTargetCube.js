/**
 * @author alteredq / http://alteredqualia.com
 */
import {WebGLRenderTarget} from './WebGLRenderTarget.js'
 function WebGLRenderTargetCube ( width, height, options ) {

	WebGLRenderTarget.call( this, width, height, options );

	this.activeCubeFace = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5

};

WebGLRenderTargetCube.prototype = Object.create( WebGLRenderTarget.prototype );
WebGLRenderTargetCube.prototype.constructor = WebGLRenderTargetCube;

export {WebGLRenderTargetCube}
