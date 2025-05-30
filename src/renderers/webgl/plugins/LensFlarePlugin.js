/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

function LensFlarePlugin( renderer, flares ) {

	var gl = renderer.context;

	var vertexBuffer, elementBuffer;
	var program, attributes, uniforms;
	var hasVertexTexture;

	var tempTexture, occlusionTexture;

	var init = function () {

		var vertices = new Float32Array( [
			-1, -1,  0, 0,
			 1, -1,  1, 0,
			 1,  1,  1, 1,
			-1,  1,  0, 1
		] );

		var faces = new Uint16Array( [
			0, 1, 2,
			0, 2, 3
		] );

		// buffers

		vertexBuffer     = gl.createBuffer();
		elementBuffer    = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elementBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW );

		// textures

		tempTexture      = gl.createTexture();
		occlusionTexture = gl.createTexture();

		gl.bindTexture( gl.TEXTURE_2D, tempTexture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 16, 16, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );

		gl.bindTexture( gl.TEXTURE_2D, occlusionTexture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );

		hasVertexTexture = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) > 0;

		var shader;

		if ( hasVertexTexture ) {

			shader = {

				vertexShader: [

					"uniform lowp int renderType;",

					"uniform vec3 screenPosition;",
					"uniform vec2 scale;",
					"uniform float rotation;",

					"uniform sampler2D occlusionMap;",

					"attribute vec2 position;",
					"attribute vec2 uv;",

					"varying vec2 vUV;",
					"varying float vVisibility;",

					"void main() {",

						"vUV = uv;",

						"vec2 pos = position;",

						"if( renderType == 2 ) {",

							"vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );",
							"visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );",

							"vVisibility =        visibility.r / 9.0;",
							"vVisibility *= 1.0 - visibility.g / 9.0;",
							"vVisibility *=       visibility.b / 9.0;",
							"vVisibility *= 1.0 - visibility.a / 9.0;",

							"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
							"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",

						"}",

						"gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",

					"}"

				].join( "\n" ),

				fragmentShader: [

					"uniform lowp int renderType;",

					"uniform sampler2D map;",
					"uniform float opacity;",
					"uniform vec3 color;",

					"varying vec2 vUV;",
					"varying float vVisibility;",

					"void main() {",

						// pink square

						"if( renderType == 0 ) {",

							"gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );",

						// restore

						"} else if( renderType == 1 ) {",

							"gl_FragColor = texture2D( map, vUV );",

						// flare

						"} else {",

							"vec4 texture = texture2D( map, vUV );",
							"texture.a *= opacity * vVisibility;",
							"gl_FragColor = texture;",
							"gl_FragColor.rgb *= color;",

						"}",

					"}"

				].join( "\n" )

			};

		} else {

			shader = {

				vertexShader: [

					"uniform lowp int renderType;",

					"uniform vec3 screenPosition;",
					"uniform vec2 scale;",
					"uniform float rotation;",

					"attribute vec2 position;",
					"attribute vec2 uv;",

					"varying vec2 vUV;",

					"void main() {",

						"vUV = uv;",

						"vec2 pos = position;",

						"if( renderType == 2 ) {",

							"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
							"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",

						"}",

						"gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",

					"}"

				].join( "\n" ),

				fragmentShader: [

					"precision mediump float;",

					"uniform lowp int renderType;",

					"uniform sampler2D map;",
					"uniform sampler2D occlusionMap;",
					"uniform float opacity;",
					"uniform vec3 color;",

					"varying vec2 vUV;",

					"void main() {",

						// pink square

						"if( renderType == 0 ) {",

							"gl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );",

						// restore

						"} else if( renderType == 1 ) {",

							"gl_FragColor = texture2D( map, vUV );",

						// flare

						"} else {",

							"float visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a;",
							"visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a;",
							"visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a;",
							"visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;",
							"visibility = ( 1.0 - visibility / 4.0 );",

							"vec4 texture = texture2D( map, vUV );",
							"texture.a *= opacity * visibility;",
							"gl_FragColor = texture;",
							"gl_FragColor.rgb *= color;",

						"}",

					"}"

				].join( "\n" )

			};

		}

		program = createProgram( shader );

		attributes = {
			vertex: gl.getAttribLocation ( program, "position" ),
			uv:     gl.getAttribLocation ( program, "uv" )
		}

		uniforms = {
			renderType:     gl.getUniformLocation( program, "renderType" ),
			map:            gl.getUniformLocation( program, "map" ),
			occlusionMap:   gl.getUniformLocation( program, "occlusionMap" ),
			opacity:        gl.getUniformLocation( program, "opacity" ),
			color:          gl.getUniformLocation( program, "color" ),
			scale:          gl.getUniformLocation( program, "scale" ),
			rotation:       gl.getUniformLocation( program, "rotation" ),
			screenPosition: gl.getUniformLocation( program, "screenPosition" )
		};

	};

	/*
	 * Render lens flares
	 * Method: renders 16x16 0xff00ff-colored points scattered over the light source area,
	 *         reads these back and calculates occlusion.
	 */

	// this.render = function ( scene, camera, viewportWidth, viewportHeight ) {

	// 	if ( flares.length === 0 ) return;

	// 	var tempPosition = new Vector3();

	// 	var invAspect = viewportHeight / viewportWidth,
	// 		halfViewportWidth = viewportWidth * 0.5,
	// 		halfViewportHeight = viewportHeight * 0.5;

	// 	var size = 16 / viewportHeight,
	// 		scale = new Vector2( size * invAspect, size );

	// 	var screenPosition = new Vector3( 1, 1, 0 ),
	// 		screenPositionPixels = new Vector2( 1, 1 );

	// 	if ( program === undefined ) {

	// 		init();

	// 	}

	// 	gl.useProgram( program );

	// 	gl.enableVertexAttribArray( attributes.vertex );
	// 	gl.enableVertexAttribArray( attributes.uv );

	// 	// loop through all lens flares to update their occlusion and positions
	// 	// setup gl and common used attribs/unforms

	// 	gl.uniform1i( uniforms.occlusionMap, 0 );
	// 	gl.uniform1i( uniforms.map, 1 );

	// 	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	// 	gl.vertexAttribPointer( attributes.vertex, 2, gl.FLOAT, false, 2 * 8, 0 );
	// 	gl.vertexAttribPointer( attributes.uv, 2, gl.FLOAT, false, 2 * 8, 8 );

	// 	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elementBuffer );

	// 	gl.disable( gl.CULL_FACE );
	// 	gl.depthMask( false );

	// 	for ( var i = 0, l = flares.length; i < l; i ++ ) {

	// 		size = 16 / viewportHeight;
	// 		scale.set( size * invAspect, size );

	// 		// calc object screen position

	// 		var flare = flares[ i ];
			
	// 		tempPosition.set( flare.matrixWorld.elements[12], flare.matrixWorld.elements[13], flare.matrixWorld.elements[14] );

	// 		tempPosition.applyMatrix4( camera.matrixWorldInverse );
	// 		tempPosition.applyProjection( camera.projectionMatrix );

	// 		// setup arrays for gl programs

	// 		screenPosition.copy( tempPosition )

	// 		screenPositionPixels.x = screenPosition.x * halfViewportWidth + halfViewportWidth;
	// 		screenPositionPixels.y = screenPosition.y * halfViewportHeight + halfViewportHeight;

	// 		// screen cull

	// 		if ( hasVertexTexture || (
	// 			screenPositionPixels.x > 0 &&
	// 			screenPositionPixels.x < viewportWidth &&
	// 			screenPositionPixels.y > 0 &&
	// 			screenPositionPixels.y < viewportHeight ) ) {

	// 			// save current RGB to temp texture

	// 			gl.activeTexture( gl.TEXTURE1 );
	// 			gl.bindTexture( gl.TEXTURE_2D, tempTexture );
	// 			gl.copyTexImage2D( gl.TEXTURE_2D, 0, gl.RGB, screenPositionPixels.x - 8, screenPositionPixels.y - 8, 16, 16, 0 );


	// 			// render pink quad

	// 			gl.uniform1i( uniforms.renderType, 0 );
	// 			gl.uniform2f( uniforms.scale, scale.x, scale.y );
	// 			gl.uniform3f( uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z );

	// 			gl.disable( gl.BLEND );
	// 			gl.enable( gl.DEPTH_TEST );

	// 			gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );


	// 			// copy result to occlusionMap

	// 			gl.activeTexture( gl.TEXTURE0 );
	// 			gl.bindTexture( gl.TEXTURE_2D, occlusionTexture );
	// 			gl.copyTexImage2D( gl.TEXTURE_2D, 0, gl.RGBA, screenPositionPixels.x - 8, screenPositionPixels.y - 8, 16, 16, 0 );


	// 			// restore graphics

	// 			gl.uniform1i( uniforms.renderType, 1 );
	// 			gl.disable( gl.DEPTH_TEST );

	// 			gl.activeTexture( gl.TEXTURE1 );
	// 			gl.bindTexture( gl.TEXTURE_2D, tempTexture );
	// 			gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );


	// 			// update object positions

	// 			flare.positionScreen.copy( screenPosition )

	// 			if ( flare.customUpdateCallback ) {

	// 				flare.customUpdateCallback( flare );

	// 			} else {

	// 				flare.updateLensFlares();

	// 			}

	// 			// render flares

	// 			gl.uniform1i( uniforms.renderType, 2 );
	// 			gl.enable( gl.BLEND );

	// 			for ( var j = 0, jl = flare.lensFlares.length; j < jl; j ++ ) {

	// 				var sprite = flare.lensFlares[ j ];

	// 				if ( sprite.opacity > 0.001 && sprite.scale > 0.001 ) {

	// 					screenPosition.x = sprite.x;
	// 					screenPosition.y = sprite.y;
	// 					screenPosition.z = sprite.z;

	// 					size = sprite.size * sprite.scale / viewportHeight;

	// 					scale.x = size * invAspect;
	// 					scale.y = size;

	// 					gl.uniform3f( uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z );
	// 					gl.uniform2f( uniforms.scale, scale.x, scale.y );
	// 					gl.uniform1f( uniforms.rotation, sprite.rotation );

	// 					gl.uniform1f( uniforms.opacity, sprite.opacity );
	// 					gl.uniform3f( uniforms.color, sprite.color.r, sprite.color.g, sprite.color.b );

	// 					renderer.setBlending( sprite.blending, sprite.blendEquation, sprite.blendSrc, sprite.blendDst );
	// 					renderer.setTexture( sprite.texture, 1 );

	// 					gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );

	// 				}

	// 			}

	// 		}

	// 	}

	// 	// restore gl

	// 	gl.enable( gl.CULL_FACE );
	// 	gl.enable( gl.DEPTH_TEST );
	// 	gl.depthMask( true );

	// 	renderer.resetGLState();

	// };

	function createProgram ( shader ) {

		var program = gl.createProgram();

		var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
		var vertexShader = gl.createShader( gl.VERTEX_SHADER );

		var prefix = "precision " + renderer.getPrecision() + " float;\n";

		gl.shaderSource( fragmentShader, prefix + shader.fragmentShader );
		gl.shaderSource( vertexShader, prefix + shader.vertexShader );

		gl.compileShader( fragmentShader );
		gl.compileShader( vertexShader );

		gl.attachShader( program, fragmentShader );
		gl.attachShader( program, vertexShader );

		gl.linkProgram( program );

		return program;

	}

};
export {LensFlarePlugin}