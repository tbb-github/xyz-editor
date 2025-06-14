/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

import { Camera } from '../cameras/Camera.js';
import { Frustum } from '../math/Frustum.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { WebGLInfo } from './webgl/WebGLInfo.js';
import { WebGLProperties } from './webgl/WebGLProperties.js';
import { WebGLAttributes } from './webgl/WebGLAttributes.js';
import { WebGLGeometries } from './webgl/WebGLGeometries.js';
import { WebGLObjects } from './webgl/WebGLObjects.js';
import { WebGLRenderLists } from './webgl/WebGLRenderLists.js';
import { WebGLProgram } from './webgl/WebGLProgram.js';
import { ShaderLib } from './shaders/ShaderLib.js';
import { UniformsUtils } from './shaders/UniformsUtils.js';
function WebGLRenderer( parameters ) {
	parameters = parameters || {};
	var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ),
		_context = parameters.context !== undefined ? parameters.context : null,
		_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
		_depth = parameters.depth !== undefined ? parameters.depth : true,
		_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
		_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
		_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
		_preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,
		_powerPreference = parameters.powerPreference !== undefined ? parameters.powerPreference : 'default',
		_precision = parameters.precision !== undefined ? parameters.precision : 'highp';
	var _gl,_canvas,info;//webgl上下文对象，canvas
	var properties, attributes, geometries, objects, renderLists;//核心对象
	var currentRenderList = null;
	var _isContextLost = false;
	var pixelRatio = 1;
	var _this = this;
	var _programs = [];
	var _frustum = new Frustum();//辅助
	var _vector3 = new Vector3();//辅助
	var _projScreenMatrix = new Matrix4();//辅助
	var _oldDoubleSided = - 1,
	_oldFlipSided = - 1;
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
	// console.log('000000000000000000000');
	
	initGLContext();//初始化gl以及相关上下文对象
	this.domElement = _canvas;
	this.sortObjects = true;//是否对场景中的对象进行排序，默认true
	this.render = function ( scene, camera) {

		if ( camera instanceof Camera === false ) {

			console.error( 'WebGLRenderer.render: camera is not an instance of Camera.' );
			return;

		}
		if ( _isContextLost ) return;


		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();//如果 autoUpdate 为 true 自动更新场景的矩阵

		// update camera matrices and frustum

		if ( camera.parent === undefined ) camera.updateMatrixWorld();//如果相机没有父对象，手动更新它的世界矩阵


		camera.matrixWorldInverse.getInverse( camera.matrixWorld );//相机的世界逆矩阵，即从世界空间转换到相机空间（view space）的变换矩阵


		
		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );//"投影×视图"矩阵 = 相机的投影矩阵（定义了透视或正交视角）* 相机的视图矩阵（相机的世界逆矩阵）

		_frustum.setFromMatrix( _projScreenMatrix );//视椎体


		currentRenderList = renderLists.get( scene, camera );
		currentRenderList.init();

		projectObject( scene );



		if ( _this.sortObjects === true ) {
			currentRenderList.sort();
		}

		var opaqueObjects = currentRenderList.opaque;

		var transparentObjects = currentRenderList.transparent;

		

		if ( opaqueObjects.length ) renderObjects( opaqueObjects, scene, camera );

		// transparent pass (back-to-front order)

		if ( transparentObjects.length ) renderObjects( transparentObjects, scene, camera );


		currentRenderList = null;

	};
	var _currentGeometryProgram = '';
	this.renderBufferDirect = function ( camera, material, geometry, object ) {

		if ( material.visible === false ) return;
		var program = setProgram( camera,material, object );
		var updateBuffers = false,
			wireframeBit = material.wireframe ? 1 : 0,
			geometryProgram = 'direct_' + geometry.id + '_' + program.id + '_' + wireframeBit;

		if ( geometryProgram !== _currentGeometryProgram ) {

			_currentGeometryProgram = geometryProgram;
			updateBuffers = true;

		}

		var index = geometry.index;
		var position = geometry.attributes.position;
		var rangeFactor = 1;

		if ( material.wireframe === true ) {

			index = geometries.getWireframeAttribute( geometry );
			rangeFactor = 2;

		}

		var attribute;


		if ( index !== null ) {

			attribute = attributes.get( index );

			// renderer = indexedBufferRenderer;
			// renderer.setIndex( attribute );

		}

		// if ( updateBuffers ) {

		// 	setupVertexAttributes( material, program, geometry );

		// 	if ( index !== null ) {

		// 		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, attribute.buffer );

		// 	}

		// }
		// console.log(object, 'objectobject');
		
		// render mesh

		if ( object.isMesh) {

			var mode = material.wireframe === true ? _gl.LINES : _gl.TRIANGLES;

	
			// non-indexed triangles
			if ( updateBuffers ) {

				setupVertexAttributes( material, program, geometry, 0 );//只需要执行一次就可以了

			}
	

	


			if ( index ) {
				//  console.log(index, attribute.type, _gl.UNSIGNED_BYTE,'attribute.type');
				
				_gl.drawElements( mode, index.array.length, attribute.type, 0  );
			} else { 
				var position = geometry.attributes[ 'position' ];
				_gl.drawArrays( mode, 0, position.array.length / 3 );
			}



		} 
	};
	this.context = _gl;
	// API

	this.getContext = function () {

		return _gl;

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

		var _viewportX = x * pixelRatio;
		var _viewportY = y * pixelRatio;

		var _viewportWidth = width * pixelRatio;
		var _viewportHeight = height * pixelRatio;

		// console.log(_gl, '_gl_gl');
		

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
	this.setMaterialFaces = function ( material ) {

		var doubleSided = material.side === 2;// DoubleSide = 2
		var flipSided = material.side === 1;//BackSide = 1;

		if ( _oldDoubleSided !== doubleSided ) {

			if ( doubleSided ) {

				console.log('1111111111111111');
				
				_gl.disable( _gl.CULL_FACE );

			} else {
				console.log('1111111111111111aaaaaaaaaaaaaaaaa');
				_gl.enable( _gl.CULL_FACE );

			}

			_oldDoubleSided = doubleSided;

		}

		if ( _oldFlipSided !== flipSided ) {

			if ( flipSided ) {

				console.log('222222222');

				_gl.frontFace( _gl.CW );

			} else {
				console.log('22222222222222222aaaaaaaaaaaaaaaaa');
				_gl.frontFace( _gl.CCW );

			}

			_oldFlipSided = flipSided;

		}

	};

	function onContextRestore( /* event */ ) {

		console.log( 'THREE.WebGLRenderer: Context Restored.' );

		_isContextLost = false;

		initGLContext();

	}
	function onContextLost( event ) {

		event.preventDefault();

		console.log( 'THREE.WebGLRenderer: Context Lost.' );

		_isContextLost = true;

	}
	function onMaterialDispose( event ) {

		var material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		deallocateMaterial( material );

	};
	function deallocateMaterial( material ) {

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



		}

	}
	function setProgram( camera, material, object ) {

		if ( material.needsUpdate ) {
			if ( material.program ) deallocateMaterial( material );
			initMaterial( material, object );
			material.needsUpdate = false;
		}

		var materialProperties = properties.get( material );
		var program = materialProperties.program;
		// console.log(properties, materialProperties, 'materialProperties');
		
		var p_uniforms = program.uniforms,
		m_uniforms = materialProperties.shader.uniforms;
		_gl.useProgram( program.program );
		_gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements );
		if (  material.isMeshBasicMaterial ) {
		   refreshUniformsCommon( m_uniforms, material );

	   }
	   loadUniformsGeneric( materialProperties.uniformsList );
	//    console.log(p_uniforms, 'p_uniformsp_uniforms');
	//    	console.log(object, 'object22222');
		
	   loadUniformsMatrices( p_uniforms, object );
		return program;

	}
	function initMaterial( material ) {
		var materialProperties = properties.get( material );
		var program = materialProperties.program;
		if ( program === undefined ) {

			// new material
			material.addEventListener( 'dispose', onMaterialDispose );

		}


		var shaderID = shaderIDs[ material.type ];

		// console.log(shaderID, 'shaderID');
		

		if ( shaderID ) {
			
			
			var shader = ShaderLib[ shaderID ];
			// console.log(shader, 'shadershader');
			

			materialProperties.shader = {
				uniforms: UniformsUtils.clone( shader.uniforms ),
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			}


		} else {

			materialProperties.shader = {
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
			// console.log(_this, '_this_this_this_this');
			
			program = new WebGLProgram( _this, code, material, parameters, materialProperties.shader );
			_programs.push( program );
	
		
			// _this.info.memory.programs = _programs.length;

		}
	
		materialProperties.program = program;
		// material.program = program;

		var uniformsList = [];

		for ( var u in materialProperties.shader.uniforms ) {

			var location = program.uniforms[ u ];

			if ( location ) {
				uniformsList.push( [ materialProperties.shader.uniforms[ u ], location ] );
			}

		}
		materialProperties.uniformsList = uniformsList;
		console.log(materialProperties, 'materialProperties');
		

	}
	function loadUniformsGeneric ( uniforms ) {

		for ( var j = 0, jl = uniforms.length; j < jl; j ++ ) {

			var uniform = uniforms[ j ][ 0 ];
			// needsUpdate property is not added to all uniforms.
			if ( uniform.needsUpdate === false ) continue;
			var type = uniform.type;
			var value = uniform.value;
			var location = uniforms[ j ][ 1 ];

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
	function refreshUniformsCommon ( uniforms, material ) {

		uniforms.diffuse.value = material.color;
	}
	function loadUniformsMatrices ( uniforms, object ) {
		// console.log(object._modelViewMatrix, 'object._modelViewMatrix.elements');
		
		_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object.modelViewMatrix.elements );

	}
	function setupVertexAttributes( material, program, geometry, startIndex ) {

		var geometryAttributes = geometry.attributes;

		var programAttributes = program.attributes;
		var programAttributesKeys = program.attributesKeys;

		for ( var i = 0, l = programAttributesKeys.length; i < l; i ++ ) {

			var key = programAttributesKeys[ i ];
			var programAttribute = programAttributes[ key ];

			
			if ( programAttribute >= 0 ) {

				var geometryAttribute = geometryAttributes[ key ];
		
				console.log(programAttribute,key, 'keykeykeykey');
				if ( geometryAttribute !== undefined ) {

					var size = geometryAttribute.itemSize;

					var attribute = attributes.get( geometryAttribute );

					var buffer = attribute.buffer;

					_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
					

					// enableAttribute( programAttribute );
					_gl.enableVertexAttribArray( programAttribute );
					console.log(buffer, size, startIndex * size * 4, startIndex, 'size---');
					_gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, 0, startIndex * size * 4 ); // 4 bytes per Float32

				}

			}

		}

		// disableUnusedAttributes();

	}
	function projectObject( object ) {
		if (!object.visible) {
			retuern;
		}
		if ( object.isMesh || object.isLine || object.isPoints ) {
			if (! object.frustumCulled || _frustum.intersectsObject( object ) ) {
				// frustumCulled 是否 禁用了视锥体剔除  _frustum.intersectsObject 判断某个物体是否在相机视野内

			}
			if (_this.sortObjects) {
				_vector3.setFromMatrixPosition( object.matrixWorld )
					.applyMatrix4( _projScreenMatrix );
					// object.matrixWorld 是该物体在世界坐标系下的变换矩阵（包含位置、旋转、缩放）。
					// setFromMatrixPosition() 方法从该矩阵中提取出物体的位置（即物体的中心点），并赋值给 _vector3。此时 _vector3 表示的是该物体在世界空间中的位置坐标。
					// _projScreenMatrix 是一个组合矩阵（通常是相机的投影 * 视图 * 模型矩阵），用于将世界坐标转换到裁剪空间（clip space）或屏幕空间
					// applyMatrix4() 将 _vector3 应用这个矩阵变换，即将物体的世界坐标变换到屏幕空间（投影空间）中。
					// 当需要对物体进行排序时（如透明物体渲染），将物体的世界坐标转换到屏幕空间，以便后续根据深度信息进行排序。
			}
			// console.log('updateupdateupdateupdateupdate');
			
			var geometry = objects.update( object );//object -> geometry -> attribue -> bindbuffer
			var material = object.material;
			// console.log(material.visible, 'material.visible');
			
			if ( material.visible ) {
				currentRenderList.push( object, geometry, material, _vector3.z, null );
			}
		}
		var children = object.children;
		for (let i = 0; i < children.length;i++) {
			projectObject(children[i]);
		}
	}

	function renderObjects(renderList, scene, camera) {
		for ( var i = 0, l = renderList.length; i < l; i ++ ) {

			var renderItem = renderList[ i ];

			var object = renderItem.object;
			var geometry = renderItem.geometry;
			var material = renderItem.material;
			var group = renderItem.group;

			renderObject( object, scene, camera, geometry, material, group );


		}
	}

	function renderObject( object, scene, camera, geometry, material, group ) {

		// object.onBeforeRender( _this, scene, camera, geometry, material, group );
		// currentRenderState = renderStates.get( scene, _currentArrayCamera || camera );

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );
		_this.setMaterialFaces( object.material );
		_this.renderBufferDirect( camera,  material, geometry, object, group );

		// object.onAfterRender( _this, scene, camera, geometry, material, group );


	}
	function initGL() {
		try {
			var contextAttributes = {
				alpha: _alpha,
				depth: _depth,
				stencil: _stencil,
				antialias: _antialias,
				premultipliedAlpha: _premultipliedAlpha,
				preserveDrawingBuffer: _preserveDrawingBuffer,
				powerPreference: _powerPreference
			};
	
			// event listeners must be registered before WebGL context is created, see #12753
	
			_canvas.addEventListener( 'webglcontextlost', onContextLost, false );
			_canvas.addEventListener( 'webglcontextrestored', onContextRestore, false );
	
			_gl = _context || _canvas.getContext( 'webgl', contextAttributes ) || _canvas.getContext( 'experimental-webgl', contextAttributes );
			console.log(_gl, '_gl_gl_gl');
			
	
			if ( _gl === null ) {
	
				if ( _canvas.getContext( 'webgl' ) !== null ) {
	
					throw new Error( 'Error creating WebGL context with your selected attributes.' );
	
				} else {
	
					throw new Error( 'Error creating WebGL context.' );
	
				}
	
			}
	
			// Some experimental-webgl implementations do not have getShaderPrecisionFormat
	
			if ( _gl.getShaderPrecisionFormat === undefined ) {
	
				_gl.getShaderPrecisionFormat = function () {
	
					return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };
	
				};
	
			}
	
		} catch ( error ) {
	
			console.error( 'THREE.WebGLRenderer: ' + error.message );
	
		}
	}
	function initGLContext() {
		initGL();
		info = new WebGLInfo( _gl );
		properties = new WebGLProperties();// three.js 70版本使用 _webglObjects 每一个object的id作key,value是{object,material,buffer}
		attributes = new WebGLAttributes( _gl );//createBuffer bindBuffer 还有更新buffer
		geometries = new WebGLGeometries( _gl, attributes, info );//three.js 70版本使用 geometryGroups
		objects = new WebGLObjects( geometries, info );
		renderLists = new WebGLRenderLists();//renderLists transparentObjects opaqueObjects 管理透明和非透明对象
	}





};
export {WebGLRenderer}