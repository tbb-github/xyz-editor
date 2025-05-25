/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 */
import { EventDispatcher } from '../core/EventDispatcher.js';
function WebGLRenderTarget( width, height, options ) {

	this.width = width;
	this.height = height;

	options = options || {};

	this.wrapS = options.wrapS !== undefined ? options.wrapS : 1001;//ClampToEdgeWrapping = 1001;
	this.wrapT = options.wrapT !== undefined ? options.wrapT : 1001;//ClampToEdgeWrapping = 1001;

	this.magFilter = options.magFilter !== undefined ? options.magFilter : 1006;//LinearFilter = 1006;
	this.minFilter = options.minFilter !== undefined ? options.minFilter : 1008;//LinearMipMapLinearFilter = 1008;

	this.anisotropy = options.anisotropy !== undefined ? options.anisotropy : 1;

	this.offset = new Vector2( 0, 0 );
	this.repeat = new Vector2( 1, 1 );

	this.format = options.format !== undefined ? options.format : RGBAFormat;
	this.type = options.type !== undefined ? options.type : UnsignedByteType;

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;

	this.generateMipmaps = true;

	this.shareDepthFrom = null;

};
WebGLRenderTarget.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: WebGLRenderTarget,

	setSize: function ( width, height ) {

		this.width = width;
		this.height = height;

	},

	clone: function () {

		var tmp = new WebGLRenderTarget( this.width, this.height );

		tmp.wrapS = this.wrapS;
		tmp.wrapT = this.wrapT;

		tmp.magFilter = this.magFilter;
		tmp.minFilter = this.minFilter;

		tmp.anisotropy = this.anisotropy;

		tmp.offset.copy( this.offset );
		tmp.repeat.copy( this.repeat );

		tmp.format = this.format;
		tmp.type = this.type;

		tmp.depthBuffer = this.depthBuffer;
		tmp.stencilBuffer = this.stencilBuffer;

		tmp.generateMipmaps = this.generateMipmaps;

		tmp.shareDepthFrom = this.shareDepthFrom;

		return tmp;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

});

// EventDispatcher.prototype.apply( WebGLRenderTarget.prototype );

export {WebGLRenderTarget}
