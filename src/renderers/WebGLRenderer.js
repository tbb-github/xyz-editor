/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */
import { Color } from '../math/Color.js';
import { Frustum } from '../math/Frustum.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Vector3 } from '../math/Vector3.js';
import { WebGLExtensions } from './webgl/WebGLExtensions.js';
import { WebGLProgram } from './webgl/WebGLProgram.js';
import { Camera } from '../cameras/Camera.js';
import { Scene } from '../scenes/Scene.js';
import { Group } from '../objects/Group.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Mesh } from '../objects/Mesh.js';
import { MeshFaceMaterial } from '../materials/MeshFaceMaterial.js';
import { WebGLRenderTargetCube } from './WebGLRenderTargetCube.js';
import { ShaderLib } from './shaders/ShaderLib.js';
import { UniformsUtils } from './shaders/UniformsUtils.js';

import {ShaderMaterial} from "../materials/ShaderMaterial.js"
import {MeshPhongMaterial} from "../materials/MeshPhongMaterial.js"
import {MeshLambertMaterial} from "../materials/MeshLambertMaterial.js"
import {MeshBasicMaterial} from "../materials/MeshBasicMaterial.js"
function WebGLRenderer( parameters ) {

	console.log( 'WebGLRenderer', 70 );//REVISION

	parameters = parameters || {};

	var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' ),
	_context = parameters.context !== undefined ? parameters.context : null,

	pixelRatio = 1, 

	_precision = parameters.precision !== undefined ? parameters.precision : 'highp',

	_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
	_depth = parameters.depth !== undefined ? parameters.depth : true,
	_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
	_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
	_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
	 _preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,


	_clearColor = new Color( 0x000000 ),
	_clearAlpha = 0;


	var lights = [];

	var _webglObjects = {};
	var _webglObjectsImmediate = [];

	var opaqueObjects = [];
	var transparentObjects = [];



	// public properties

	this.domElement = _canvas;
	this.context = null;


	this.sortObjects = true;


	this.autoScaleCubemaps = true;

	// info

	this.info = {

		memory: {

			programs: 0,
			geometries: 0,
			textures: 0

		},

		render: {

			calls: 0,
			vertices: 0,
			faces: 0,
			points: 0

		}

	};

	// internal properties

	var _this = this,

	_programs = [],

	// internal state cache

	_currentProgram = null,

	_currentMaterialId = - 1,
	_currentGeometryProgram = '',
	_currentCamera = null,



	// GL state cache

	_oldDoubleSided = - 1,
	_oldFlipSided = - 1,



	_oldDepthTest = - 1,
	_oldDepthWrite = - 1,



	_viewportX = 0,
	_viewportY = 0,
	_viewportWidth = _canvas.width,
	_viewportHeight = _canvas.height,


	_newAttributes = new Uint8Array( 16 ),
	_enabledAttributes = new Uint8Array( 16 ),

	// frustum

	_frustum = new Frustum(),

	 // camera matrices cache

	_projScreenMatrix = new Matrix4(),


	_vector3 = new Vector3();




	// initialize

	var _gl;

	try {

		var attributes = {
			alpha: _alpha,
			depth: _depth,
			stencil: _stencil,
			antialias: _antialias,
			premultipliedAlpha: _premultipliedAlpha,
			preserveDrawingBuffer: _preserveDrawingBuffer
		};
		console.log(_context, '_context');
		
		_gl = _context || _canvas.getContext( 'webgl', attributes ) || _canvas.getContext( 'experimental-webgl', attributes );

		if ( _gl === null ) {

			if ( _canvas.getContext( 'webgl') !== null ) {

				throw 'Error creating WebGL context with your selected attributes.';

			} else {

				throw 'Error creating WebGL context.';

			}

		}

		_canvas.addEventListener( 'webglcontextlost', function ( event ) {

			event.preventDefault();

			resetGLState();
			setDefaultGLState();

			_webglObjects = {};

		}, false);

	} catch ( error ) {

		console.error( error );

	}

	if ( _gl.getShaderPrecisionFormat === undefined ) {

		_gl.getShaderPrecisionFormat = function () {

			return {
				'rangeMin': 1,
				'rangeMax': 1,
				'precision': 1
			};

		}

	}

	var extensions = new WebGLExtensions( _gl );

	extensions.get( 'OES_texture_float' );
	extensions.get( 'OES_texture_float_linear' );
	extensions.get( 'OES_standard_derivatives' );



	var setDefaultGLState = function () {

		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );
		_gl.clearStencil( 0 );

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL );

		_gl.frontFace( _gl.CCW );
		_gl.cullFace( _gl.BACK );
		_gl.enable( _gl.CULL_FACE );

		_gl.enable( _gl.BLEND );
		_gl.blendEquation( _gl.FUNC_ADD );
		_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

	};

	var resetGLState = function () {

		_currentProgram = null;
		_currentCamera = null;

		_oldBlending = - 1;
		_oldDepthTest = - 1;
		_oldDepthWrite = - 1;
		_oldDoubleSided = - 1;
		_oldFlipSided = - 1;
		_currentGeometryProgram = '';
		_currentMaterialId = - 1;

		_lightsNeedUpdate = true;

		for ( var i = 0; i < _enabledAttributes.length; i ++ ) {

			_enabledAttributes[ i ] = 0;

		}

	};

	// setDefaultGLState();

	this.context = _gl;


	// API

	this.getContext = function () {

		return _gl;

	};



	this.getPrecision = function () {

		return _precision;

	};

	this.getPixelRatio = function () {

		return pixelRatio;

	};

	this.setPixelRatio = function ( value ) {

		pixelRatio = value;

	};

	this.setSize = function ( width, height, updateStyle ) {

		_canvas.width = width * pixelRatio;
		_canvas.height = height * pixelRatio;

		if ( updateStyle !== false ) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';

		}
	
		
		this.setViewport( 0, 0, width, height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x * pixelRatio;
		_viewportY = y * pixelRatio;

		_viewportWidth = width * pixelRatio;
		_viewportHeight = height * pixelRatio;

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

	};

	this.setScissor = function ( x, y, width, height ) {

		_gl.scissor(
			x * pixelRatio,
			y * pixelRatio,
			width * pixelRatio,
			height * pixelRatio
		);

	};

	this.enableScissorTest = function ( enable ) {

		enable ? _gl.enable( _gl.SCISSOR_TEST ) : _gl.disable( _gl.SCISSOR_TEST );

	};

	// Clearing

	this.getClearColor = function () {

		return _clearColor;

	};

	this.setClearColor = function ( color, alpha ) {

		_clearColor.set( color );
		_clearAlpha = alpha !== undefined ? alpha : 1;

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

	};

	this.getClearAlpha = function () {

		return _clearAlpha;

	};

	this.setClearAlpha = function ( alpha ) {

		_clearAlpha = alpha;

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

	};

	this.clear = function ( color, depth, stencil ) {

		var bits = 0;

		if ( color === undefined || color ) bits |= _gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth ) bits |= _gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil ) bits |= _gl.STENCIL_BUFFER_BIT;

		_gl.clear( bits );

	};

	this.clearColor = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT );

	};

	this.clearDepth = function () {

		_gl.clear( _gl.DEPTH_BUFFER_BIT );

	};

	this.clearStencil = function () {

		_gl.clear( _gl.STENCIL_BUFFER_BIT );

	};

	this.clearTarget = function ( renderTarget, color, depth, stencil ) {

		this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );

	};

	// Reset

	this.resetGLState = resetGLState;



	function createMeshBuffers ( geometryGroup ) {

		geometryGroup.__webglVertexBuffer = _gl.createBuffer();
		geometryGroup.__webglNormalBuffer = _gl.createBuffer();
		geometryGroup.__webglTangentBuffer = _gl.createBuffer();
		geometryGroup.__webglColorBuffer = _gl.createBuffer();
		geometryGroup.__webglUVBuffer = _gl.createBuffer();
		geometryGroup.__webglUV2Buffer = _gl.createBuffer();

		geometryGroup.__webglSkinIndicesBuffer = _gl.createBuffer();
		geometryGroup.__webglSkinWeightsBuffer = _gl.createBuffer();

		geometryGroup.__webglFaceBuffer = _gl.createBuffer();
		geometryGroup.__webglLineBuffer = _gl.createBuffer();


		_this.info.memory.geometries ++;

	};

	// Events

	var onObjectRemoved = function ( event ) {

		var object = event.target;

		object.traverse( function ( child ) {

			child.removeEventListener( 'remove', onObjectRemoved );

			removeObject( child );

		} );

	};

	var onGeometryDispose = function ( event ) {

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		deallocateGeometry( geometry );

	};


	var onRenderTargetDispose = function ( event ) {

		var renderTarget = event.target;

		renderTarget.removeEventListener( 'dispose', onRenderTargetDispose );

		deallocateRenderTarget( renderTarget );

		_this.info.memory.textures --;

	};

	var onMaterialDispose = function ( event ) {

		var material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		deallocateMaterial( material );

	};

	// Buffer deallocation

	var deleteBuffers = function ( geometry ) {

		var buffers = [
			'__webglVertexBuffer',
			'__webglNormalBuffer',
			'__webglTangentBuffer',
			'__webglColorBuffer',
			'__webglUVBuffer',
			'__webglUV2Buffer',

			'__webglSkinIndicesBuffer',
			'__webglSkinWeightsBuffer',

			'__webglFaceBuffer',
			'__webglLineBuffer',

			'__webglLineDistanceBuffer'
		];

		for ( var i = 0, l = buffers.length; i < l; i ++ ) {

			var name = buffers[ i ];

			if ( geometry[ name ] !== undefined ) {

				_gl.deleteBuffer( geometry[ name ] );

				delete geometry[ name ];

			}

		}

		// custom attributes

		if ( geometry.__webglCustomAttributesList !== undefined ) {

			for ( var name in geometry.__webglCustomAttributesList ) {

				_gl.deleteBuffer( geometry.__webglCustomAttributesList[ name ].buffer );

			}

			delete geometry.__webglCustomAttributesList;

		}

		_this.info.memory.geometries --;

	};

	var deallocateGeometry = function ( geometry ) {

		delete geometry.__webglInit;

		if ( geometry instanceof BufferGeometry ) {

			for ( var name in geometry.attributes ) {

				var attribute = geometry.attributes[ name ];

				if ( attribute.buffer !== undefined ) {

					_gl.deleteBuffer( attribute.buffer );

					delete attribute.buffer;

				}

			}

			_this.info.memory.geometries --;

		} else {

			var geometryGroupsList = geometryGroups[ geometry.id ];

			if ( geometryGroupsList !== undefined ) {

				for ( var i = 0, l = geometryGroupsList.length; i < l; i ++ ) {

					var geometryGroup = geometryGroupsList[ i ];

					if ( geometryGroup.numMorphTargets !== undefined ) {

						for ( var m = 0, ml = geometryGroup.numMorphTargets; m < ml; m ++ ) {

							_gl.deleteBuffer( geometryGroup.__webglMorphTargetsBuffers[ m ] );

						}

						delete geometryGroup.__webglMorphTargetsBuffers;

					}

					if ( geometryGroup.numMorphNormals !== undefined ) {

						for ( var m = 0, ml = geometryGroup.numMorphNormals; m < ml; m ++ ) {

							_gl.deleteBuffer( geometryGroup.__webglMorphNormalsBuffers[ m ] );

						}

						delete geometryGroup.__webglMorphNormalsBuffers;

					}

					deleteBuffers( geometryGroup );

				}

				delete geometryGroups[ geometry.id ];

			} else {

				deleteBuffers( geometry );

			}

		}

		// TOFIX: Workaround for deleted geometry being currently bound

		_currentGeometryProgram = '';

	};



	var deallocateRenderTarget = function ( renderTarget ) {

		if ( ! renderTarget || renderTarget.__webglTexture === undefined ) return;

		_gl.deleteTexture( renderTarget.__webglTexture );

		delete renderTarget.__webglTexture;

		if ( renderTarget instanceof WebGLRenderTargetCube ) {

			for ( var i = 0; i < 6; i ++ ) {

				_gl.deleteFramebuffer( renderTarget.__webglFramebuffer[ i ] );
				_gl.deleteRenderbuffer( renderTarget.__webglRenderbuffer[ i ] );

			}

		} else {

			_gl.deleteFramebuffer( renderTarget.__webglFramebuffer );
			_gl.deleteRenderbuffer( renderTarget.__webglRenderbuffer );

		}

		delete renderTarget.__webglFramebuffer;
		delete renderTarget.__webglRenderbuffer;

	};

	var deallocateMaterial = function ( material ) {

		var program = material.program.program;

		if ( program === undefined ) return;

		material.program = undefined;

		// only deallocate GL program if this was the last use of shared program
		// assumed there is only single copy of any program in the _programs list
		// (that's how it's constructed)

		var i, il, programInfo;
		var deleteProgram = false;

		for ( i = 0, il = _programs.length; i < il; i ++ ) {

			programInfo = _programs[ i ];

			if ( programInfo.program === program ) {

				programInfo.usedTimes --;

				if ( programInfo.usedTimes === 0 ) {

					deleteProgram = true;

				}

				break;

			}

		}

		if ( deleteProgram === true ) {

			// avoid using array.splice, this is costlier than creating new array from scratch

			var newPrograms = [];

			for ( i = 0, il = _programs.length; i < il; i ++ ) {

				programInfo = _programs[ i ];

				if ( programInfo.program !== program ) {

					newPrograms.push( programInfo );

				}

			}

			_programs = newPrograms;

			_gl.deleteProgram( program );

			_this.info.memory.programs --;

		}

	};




	function initMeshBuffers ( geometryGroup, object ) {

		var faces3 = geometryGroup.faces3,
			nvertices = faces3.length * 3,
			ntris     = faces3.length * 1,
			nlines    = faces3.length * 3;


		geometryGroup.__vertexArray = new Float32Array( nvertices * 3 );
		geometryGroup.__normalArray = new Float32Array( nvertices * 3 );
		geometryGroup.__colorArray = new Float32Array( nvertices * 3 );
		geometryGroup.__uvArray = new Float32Array( nvertices * 2 );

		var UintArray = extensions.get( 'OES_element_index_uint' ) !== null && ntris > 21845 ? Uint32Array : Uint16Array; // 65535 / 3

		geometryGroup.__typeArray = UintArray;
		geometryGroup.__faceArray = new UintArray( ntris * 3 );
		geometryGroup.__lineArray = new UintArray( nlines * 2 );


		geometryGroup.__webglFaceCount = ntris * 3;
		geometryGroup.__webglLineCount = nlines * 2;


		geometryGroup.__inittedArrays = true;

	};


	function materialNeedsSmoothNormals ( material ) {

		return material && material.shading !== undefined && material.shading === 2;//SmoothShading 2

	};


	// Buffer rendering


	function setupVertexAttributes( material, program, geometry, startIndex ) {

		var geometryAttributes = geometry.attributes;

		var programAttributes = program.attributes;
		var programAttributesKeys = program.attributesKeys;

		for ( var i = 0, l = programAttributesKeys.length; i < l; i ++ ) {

			var key = programAttributesKeys[ i ];
			var programAttribute = programAttributes[ key ];

			if ( programAttribute >= 0 ) {

				var geometryAttribute = geometryAttributes[ key ];

				if ( geometryAttribute !== undefined ) {

					var size = geometryAttribute.itemSize;

					_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryAttribute.buffer );

					enableAttribute( programAttribute );

					_gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, 0, startIndex * size * 4 ); // 4 bytes per Float32

				} else if ( material.defaultAttributeValues !== undefined ) {

					if ( material.defaultAttributeValues[ key ].length === 2 ) {

						_gl.vertexAttrib2fv( programAttribute, material.defaultAttributeValues[ key ] );

					} else if ( material.defaultAttributeValues[ key ].length === 3 ) {

						_gl.vertexAttrib3fv( programAttribute, material.defaultAttributeValues[ key ] );

					}

				}

			}

		}

		disableUnusedAttributes();

	}

	this.renderBufferDirect = function ( camera, lights, fog, material, geometry, object ) {

		if ( material.visible === false ) return;

		updateObject( object );

		var program = setProgram( camera, lights, fog, material, object );

		var updateBuffers = false,
			wireframeBit = material.wireframe ? 1 : 0,
			geometryProgram = 'direct_' + geometry.id + '_' + program.id + '_' + wireframeBit;

		if ( geometryProgram !== _currentGeometryProgram ) {

			_currentGeometryProgram = geometryProgram;
			updateBuffers = true;

		}
		
		if ( updateBuffers ) {

			initAttributes();

		}

		// render mesh

		if ( object instanceof Mesh ) {

			var mode = material.wireframe === true ? _gl.LINES : _gl.TRIANGLES;

			var index = geometry.attributes.index;

			if ( index ) {

				// indexed triangles

				var type, size;

				if ( index.array instanceof Uint32Array && extensions.get( 'OES_element_index_uint' ) ) {

					type = _gl.UNSIGNED_INT;
					size = 4;

				} else {

					type = _gl.UNSIGNED_SHORT;
					size = 2;

				}

				var offsets = geometry.offsets;

				if ( offsets.length === 0 ) {

					if ( updateBuffers ) {

						setupVertexAttributes( material, program, geometry, 0 );
						_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, index.buffer );

					}

					_gl.drawElements( mode, index.array.length, type, 0 );

					_this.info.render.calls ++;
					_this.info.render.vertices += index.array.length; // not really true, here vertices can be shared
					_this.info.render.faces += index.array.length / 3;

				} else {

					// if there is more than 1 chunk
					// must set attribute pointers to use new offsets for each chunk
					// even if geometry and materials didn't change

					updateBuffers = true;

					for ( var i = 0, il = offsets.length; i < il; i ++ ) {

						var startIndex = offsets[ i ].index;

						if ( updateBuffers ) {

							setupVertexAttributes( material, program, geometry, startIndex );
							_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, index.buffer );

						}

						// render indexed triangles

						_gl.drawElements( mode, offsets[ i ].count, type, offsets[ i ].start * size );

						_this.info.render.calls ++;
						_this.info.render.vertices += offsets[ i ].count; // not really true, here vertices can be shared
						_this.info.render.faces += offsets[ i ].count / 3;

					}

				}

			} else {

				// non-indexed triangles

				if ( updateBuffers ) {

					setupVertexAttributes( material, program, geometry, 0 );

				}

				var position = geometry.attributes[ 'position' ];

				// render non-indexed triangles

				_gl.drawArrays( mode, 0, position.array.length / 3 );

				_this.info.render.calls ++;
				_this.info.render.vertices += position.array.length / 3;
				_this.info.render.faces += position.array.length / 9;

			}

		} 
	};


	function initAttributes() {

		for ( var i = 0, l = _newAttributes.length; i < l; i ++ ) {

			_newAttributes[ i ] = 0;

		}

	}

	function enableAttribute( attribute ) {

		_newAttributes[ attribute ] = 1;

		if ( _enabledAttributes[ attribute ] === 0 ) {

			_gl.enableVertexAttribArray( attribute );
			_enabledAttributes[ attribute ] = 1;

		}

	}

	function disableUnusedAttributes() {

		for ( var i = 0, l = _enabledAttributes.length; i < l; i ++ ) {

			if ( _enabledAttributes[ i ] !== _newAttributes[ i ] ) {

				_gl.disableVertexAttribArray( i );
				_enabledAttributes[ i ] = 0;

			}

		}

	}

	// Rendering

	this.render = function ( scene, camera, renderTarget, forceClear ) {

		if ( camera instanceof Camera === false ) {

			console.error( 'WebGLRenderer.render: camera is not an instance of Camera.' );
			return;

		}

		var fog = scene.fog;


		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices and frustum

		if ( camera.parent === undefined ) camera.updateMatrixWorld();


		camera.matrixWorldInverse.getInverse( camera.matrixWorld );


		
		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromMatrix( _projScreenMatrix );


		projectObject( scene );


		var material = null;

		
		renderObjects( opaqueObjects, camera, lights, fog, false, material );


		// Ensure depth buffer writing is enabled so it can be cleared on next render

		this.setDepthTest( true );
		this.setDepthWrite( true );

;

	};

	function projectObject( object ) {

		if ( object.visible === false ) return;

		if ( object instanceof Scene || object instanceof Group ) {

			// skip

		} else {

			initObject( object );

			var webglObjects = _webglObjects[ object.id ];


			if ( webglObjects && ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) ) {

				for ( var i = 0, l = webglObjects.length; i < l; i ++ ) {

					var webglObject = webglObjects[i];

					unrollBufferMaterial( webglObject );

					webglObject.render = true;

					if ( _this.sortObjects === true ) {

						_vector3.setFromMatrixPosition( object.matrixWorld );
						_vector3.applyProjection( _projScreenMatrix );

						webglObject.z = _vector3.z;

					}

				}

			}

			

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			projectObject( object.children[ i ] );

		}

	}

	function renderObjects( renderList, camera, lights, fog, useBlending, overrideMaterial ) {

		var material;

		
		for ( var i = 0, l = renderList.length; i < l; i ++ ) {

			var webglObject = renderList[ i ];

			var object = webglObject.object;

			
			var buffer = webglObject.buffer;

			setupMatrices( object, camera );

			
			material = webglObject.material;

			if ( ! material ) continue;


			_this.setMaterialFaces( material );

			

			if ( buffer instanceof BufferGeometry ) {

				_this.renderBufferDirect( camera, lights, fog, material, buffer, object );

			} 

		}

	}

	function unrollBufferMaterial ( globject ) {

		var object = globject.object;

		var material = object.material;

		if ( material ) {

			globject.material = material;

			if ( material.transparent ) {

				transparentObjects.push( globject );

			} else {

				opaqueObjects.push( globject );

			}

		}

	}

	function initObject( object ) {

		if ( object.__webglInit === undefined ) {

			object.__webglInit = true;
			object._modelViewMatrix = new Matrix4();
			object._normalMatrix = new Matrix3();

			object.addEventListener( 'removed', onObjectRemoved );

		}

		var geometry = object.geometry;

		if ( geometry.__webglInit === undefined ) {

			geometry.__webglInit = true;
			geometry.addEventListener( 'dispose', onGeometryDispose );
			if ( geometry instanceof BufferGeometry ) {

				_this.info.memory.geometries ++;

			} else if ( object instanceof Mesh ) {

				initGeometryGroups( object, geometry );

			} 

		}
		if ( object.__webglActive === undefined) {

			
			object.__webglActive = true;

			if ( object instanceof Mesh ) {

				if ( geometry instanceof BufferGeometry ) {

				
					addBuffer( _webglObjects, geometry, object );
					

				} else if ( geometry instanceof Geometry ) {

					var geometryGroupsList = geometryGroups[ geometry.id ];

					for ( var i = 0,l = geometryGroupsList.length; i < l; i ++ ) {

						addBuffer( _webglObjects, geometryGroupsList[ i ], object );

					}

				}

			}

		}


	}

	// Geometry splitting

	var geometryGroups = {};
	var geometryGroupCounter = 0;

	function makeGroups( geometry, usesFaceMaterial ) {

		var maxVerticesInGroup = extensions.get( 'OES_element_index_uint' ) ? 4294967296 : 65535;

		var groupHash, hash_map = {};

		var numMorphTargets = geometry.morphTargets.length;
		var numMorphNormals = geometry.morphNormals.length;

		var group;
		var groups = {};
		var groupsList = [];

		for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			var face = geometry.faces[ f ];
			var materialIndex = usesFaceMaterial ? face.materialIndex : 0;

			if ( ! ( materialIndex in hash_map ) ) {

				hash_map[ materialIndex ] = { hash: materialIndex, counter: 0 };

			}

			groupHash = hash_map[ materialIndex ].hash + '_' + hash_map[ materialIndex ].counter;

			if ( ! ( groupHash in groups ) ) {

				group = {
					id: geometryGroupCounter ++,
					faces3: [],
					materialIndex: materialIndex,
					vertices: 0,
					numMorphTargets: numMorphTargets,
					numMorphNormals: numMorphNormals
				};

				groups[ groupHash ] = group;
				groupsList.push( group );

			}

			groups[ groupHash ].faces3.push( f );
			groups[ groupHash ].vertices += 3;

		}

		return groupsList;

	}

	function initGeometryGroups( object, geometry ) {

		var material = object.material, addBuffers = false;

		if ( geometryGroups[ geometry.id ] === undefined || geometry.groupsNeedUpdate === true ) {

			delete _webglObjects[ object.id ];

			geometryGroups[ geometry.id ] = makeGroups( geometry, material instanceof MeshFaceMaterial );

			geometry.groupsNeedUpdate = false;

		}

		var geometryGroupsList = geometryGroups[ geometry.id ];

		
		// create separate VBOs per geometry chunk

		for ( var i = 0, il = geometryGroupsList.length; i < il; i ++ ) {

			var geometryGroup = geometryGroupsList[ i ];

			// initialise VBO on the first access

			if ( geometryGroup.__webglVertexBuffer === undefined ) {

				createMeshBuffers( geometryGroup );
	
				
				initMeshBuffers( geometryGroup, object );

				geometry.verticesNeedUpdate = true;
				geometry.morphTargetsNeedUpdate = true;
				geometry.elementsNeedUpdate = true;
				geometry.uvsNeedUpdate = true;
				geometry.normalsNeedUpdate = true;
				geometry.tangentsNeedUpdate = true;
				geometry.colorsNeedUpdate = true;

				addBuffers = true;

			} else {

				addBuffers = false;

			}

			if ( addBuffers || object.__webglActive === undefined ) {


				addBuffer( _webglObjects, geometryGroup, object );

			}

		}

		object.__webglActive = true;

	}

	function addBuffer( objlist, buffer, object ) {

		var id = object.id;
		objlist[id] = objlist[id] || [];
		objlist[id].push(
			{
				id: id,
				buffer: buffer,
				object: object,
				material: null,
				z: 0
			}
		);
		console.log(objlist, 'objlist');
		

	};


	// Objects updates

	function updateObject( object ) {

		var geometry = object.geometry;

		if ( geometry instanceof BufferGeometry ) {
			// console.log('llllllllllllllllllllllllll');
			
			var attributes = geometry.attributes;
			var attributesKeys = geometry.attributesKeys;

			for ( var i = 0, l = attributesKeys.length; i < l; i ++ ) {

				var key = attributesKeys[ i ];
				var attribute = attributes[ key ];

				if ( attribute.buffer === undefined ) {

					attribute.buffer = _gl.createBuffer();
					attribute.needsUpdate = true;

				}

				if ( attribute.needsUpdate === true ) {

					var bufferType = ( key === 'index' ) ? _gl.ELEMENT_ARRAY_BUFFER : _gl.ARRAY_BUFFER;

					console.log(key, bufferType, 'bufferType');
					

					_gl.bindBuffer( bufferType, attribute.buffer );
					_gl.bufferData( bufferType, attribute.array, _gl.STATIC_DRAW );

					attribute.needsUpdate = false;

				}

			}

		}
		

	}

	// Objects removal

	function removeObject( object ) {

		if ( object instanceof Mesh  ||
			 object instanceof PointCloud ||
			 object instanceof Line ) {

			delete _webglObjects[ object.id ];

		} else if ( object instanceof ImmediateRenderObject || object.immediateRenderCallback ) {

			removeInstances( _webglObjectsImmediate, object );

		}

		delete object.__webglInit;
		delete object._modelViewMatrix;
		delete object._normalMatrix;

		delete object.__webglActive;

	}

	function removeInstances( objlist, object ) {

		for ( var o = objlist.length - 1; o >= 0; o -- ) {

			if ( objlist[ o ].object === object ) {

				objlist.splice( o, 1 );

			}

		}

	}

	// Materials

	var shaderIDs = {
		MeshDepthMaterial: 'depth',
		MeshNormalMaterial: 'normal',
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		LineBasicMaterial: 'basic',
		LineDashedMaterial: 'dashed',
		PointCloudMaterial: 'particle_basic'
	};

	function initMaterial( material, lights, fog, object ) {

		material.addEventListener( 'dispose', onMaterialDispose );

		var shaderID = shaderIDs[ material.type ];

		console.log(shaderID, 'shaderID');
		

		if ( shaderID ) {
			
			
			var shader = ShaderLib[ shaderID ];
			console.log(shader, 'shadershader');
			

			material.__webglShader = {
				uniforms: UniformsUtils.clone( shader.uniforms ),
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			}


		} else {

			material.__webglShader = {
				uniforms: material.uniforms,
				vertexShader: material.vertexShader,
				fragmentShader: material.fragmentShader
			}

		}


		var parameters = {
			precision: _precision,
			vertexColors: material.vertexColors,
		};

		// Generate code

		var chunks = [];

		if ( shaderID ) {

			chunks.push( shaderID );

		} else {

			chunks.push( material.fragmentShader );
			chunks.push( material.vertexShader );

		}

		if ( material.defines !== undefined ) {

			for ( var name in material.defines ) {

				chunks.push( name );
				chunks.push( material.defines[ name ] );

			}

		}

		for ( var name in parameters ) {

			chunks.push( name );
			chunks.push( parameters[ name ] );

		}

		var code = chunks.join();

		var program;

		// Check if code has been already compiled

		for ( var p = 0, pl = _programs.length; p < pl; p ++ ) {

			var programInfo = _programs[ p ];

			if ( programInfo.code === code ) {

				program = programInfo;
				program.usedTimes ++;

				break;

			}

		}

		if ( program === undefined ) {

			program = new WebGLProgram( _this, code, material, parameters );
			_programs.push( program );
	

			_this.info.memory.programs = _programs.length;

		}
	
		
		material.program = program;

		material.uniformsList = [];

		for ( var u in material.__webglShader.uniforms ) {

			var location = material.program.uniforms[ u ];

			if ( location ) {
				material.uniformsList.push( [ material.__webglShader.uniforms[ u ], location ] );
			}

		}

	}

	function setProgram( camera, lights, fog, material, object ) {



		if ( material.needsUpdate ) {

			if ( material.program ) deallocateMaterial( material );

			initMaterial( material, lights, fog, object );
			material.needsUpdate = false;
		
			

		}


		var refreshProgram = false;
		var refreshMaterial = false;
		var refreshLights = false;

		var program = material.program,
			p_uniforms = program.uniforms,
			m_uniforms = material.__webglShader.uniforms;


		
		if ( program.id !== _currentProgram ) {

			
			_gl.useProgram( program.program );
			_currentProgram = program.id;

			refreshProgram = true;
			refreshMaterial = true;
			refreshLights = true;
			console.log('1111111111111111111111111111111');

		}

		if ( material.id !== _currentMaterialId ) {

			if ( _currentMaterialId === -1 ) refreshLights = true;
			_currentMaterialId = material.id;

			refreshMaterial = true;
			console.log('222222222222222222222222222');

		}

		if ( refreshProgram || camera !== _currentCamera ) {

			_gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements );



			if ( camera !== _currentCamera ) _currentCamera = camera;


			if ( material instanceof MeshPhongMaterial ||
				 material instanceof MeshLambertMaterial ||
				 material instanceof MeshBasicMaterial ||
				 material instanceof ShaderMaterial ||
				 material.skinning ) {

				if ( p_uniforms.viewMatrix !== null ) {

					_gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements );

				}

			}

		}


		if ( refreshMaterial ) {


			if ( material instanceof MeshBasicMaterial ||
				 material instanceof MeshLambertMaterial ||
				 material instanceof MeshPhongMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

			}

			loadUniformsGeneric( material.uniformsList );

		}

		loadUniformsMatrices( p_uniforms, object );

		if ( p_uniforms.modelMatrix !== null ) {

			_gl.uniformMatrix4fv( p_uniforms.modelMatrix, false, object.matrixWorld.elements );

		}

		return program;

	}

	// Uniforms (refresh uniforms objects)

	function refreshUniformsCommon ( uniforms, material ) {


		uniforms.diffuse.value = material.color;
	}

	// Uniforms (load to GPU)

	function loadUniformsMatrices ( uniforms, object ) {

		_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object._modelViewMatrix.elements );

	}


	function loadUniformsGeneric ( uniforms ) {

		var texture, textureUnit, offset;

		for ( var j = 0, jl = uniforms.length; j < jl; j ++ ) {

			var uniform = uniforms[ j ][ 0 ];

			// needsUpdate property is not added to all uniforms.
			if ( uniform.needsUpdate === false ) continue;

			var type = uniform.type;
			var value = uniform.value;
			var location = uniforms[ j ][ 1 ];
			console.log(type, 'typetypetypetype');
			
			switch ( type ) {



				case 'f':

					// single float
					_gl.uniform1f( location, value );

					break;


				case 'c':

					// single Color
					_gl.uniform3f( location, value.r, value.g, value.b );

					break;

				default:

					console.warn( 'WebGLRenderer: Unknown uniform type: ' + type );

			}

		}

	}

	function setupMatrices ( object, camera ) {

		object._modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object._normalMatrix.getNormalMatrix( object._modelViewMatrix );

	}



	// GL state setting

	this.setFaceCulling = function ( cullFace, frontFaceDirection ) {

		if ( cullFace === CullFaceNone ) {

			_gl.disable( _gl.CULL_FACE );

		} else {

			if ( frontFaceDirection === FrontFaceDirectionCW ) {

				_gl.frontFace( _gl.CW );

			} else {

				_gl.frontFace( _gl.CCW );

			}

			if ( cullFace === CullFaceBack ) {

				_gl.cullFace( _gl.BACK );

			} else if ( cullFace === CullFaceFront ) {

				_gl.cullFace( _gl.FRONT );

			} else {

				_gl.cullFace( _gl.FRONT_AND_BACK );

			}

			_gl.enable( _gl.CULL_FACE );

		}

	};

	this.setMaterialFaces = function ( material ) {

		var doubleSided = material.side === 2;// DoubleSide = 2
		var flipSided = material.side === 1;//BackSide = 1;

		if ( _oldDoubleSided !== doubleSided ) {

			if ( doubleSided ) {

				_gl.disable( _gl.CULL_FACE );

			} else {

				_gl.enable( _gl.CULL_FACE );

			}

			_oldDoubleSided = doubleSided;

		}

		if ( _oldFlipSided !== flipSided ) {

			if ( flipSided ) {

				_gl.frontFace( _gl.CW );

			} else {

				_gl.frontFace( _gl.CCW );

			}

			_oldFlipSided = flipSided;

		}

	};

	this.setDepthTest = function ( depthTest ) {

		if ( _oldDepthTest !== depthTest ) {

			if ( depthTest ) {

				_gl.enable( _gl.DEPTH_TEST );

			} else {

				_gl.disable( _gl.DEPTH_TEST );

			}

			_oldDepthTest = depthTest;

		}

	};

	this.setDepthWrite = function ( depthWrite ) {

		if ( _oldDepthWrite !== depthWrite ) {

			_gl.depthMask( depthWrite );
			_oldDepthWrite = depthWrite;

		}

	};



};
export {WebGLRenderer}