/**
 * @author alteredq / http://alteredqualia.com/
 */
import { Frustum } from '../../../math/Frustum.js';
import { Matrix4 } from '../../../math/Matrix4.js';
import { Vector3 } from '../../../math/Vector3.js';
import { ShaderLib } from '../../shaders/ShaderLib.js';
import {UniformsUtils} from '../../shaders/UniformsUtils.js'
import { ShaderMaterial } from '../../../materials/ShaderMaterial.js';
 function ShadowMapPlugin ( _renderer, _lights, _webglObjects, _webglObjectsImmediate ) {

	var _gl = _renderer.context;

	var _depthMaterial, _depthMaterialMorph, _depthMaterialSkin, _depthMaterialMorphSkin,

	_frustum = new Frustum(),
	_projScreenMatrix = new Matrix4(),

	_min = new Vector3(),
	_max = new Vector3(),

	_matrixPosition = new Vector3(),
	
	_renderList = [];

	// init

	var depthShader = ShaderLib[ "depthRGBA" ];
	var depthUniforms = UniformsUtils.clone( depthShader.uniforms );

	_depthMaterial = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader
	 } );

	_depthMaterialMorph = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		morphTargets: true
	} );

	_depthMaterialSkin = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		skinning: true
	} );

	_depthMaterialMorphSkin = new ShaderMaterial( {
		uniforms: depthUniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader,
		morphTargets: true,
		skinning: true
	} );

	_depthMaterial._shadowPass = true;
	_depthMaterialMorph._shadowPass = true;
	_depthMaterialSkin._shadowPass = true;
	_depthMaterialMorphSkin._shadowPass = true;

	// this.render = function ( scene, camera ) {

	
	// 	if ( _renderer.shadowMapEnabled === false ) return;

	// 	var i, il, j, jl, n,

	// 	shadowMap, shadowMatrix, shadowCamera,
	// 	program, buffer, material,
	// 	webglObject, object, light,

	// 	lights = [],
	// 	k = 0,

	// 	fog = null;

	// 	// set GL state for depth map

	// 	_gl.clearColor( 1, 1, 1, 1 );
	// 	_gl.disable( _gl.BLEND );

	// 	_gl.enable( _gl.CULL_FACE );
	// 	_gl.frontFace( _gl.CCW );

	// 	if ( _renderer.shadowMapCullFace === CullFaceFront ) {

	// 		_gl.cullFace( _gl.FRONT );

	// 	} else {

	// 		_gl.cullFace( _gl.BACK );

	// 	}

	// 	_renderer.setDepthTest( true );

	// 	// preprocess lights
	// 	// 	- skip lights that are not casting shadows
	// 	//	- create virtual lights for cascaded shadow maps

	// 	for ( i = 0, il = _lights.length; i < il; i ++ ) {

	// 		light = _lights[ i ];

	// 		if ( ! light.castShadow ) continue;

	// 		if ( ( light instanceof DirectionalLight ) && light.shadowCascade ) {

	// 			for ( n = 0; n < light.shadowCascadeCount; n ++ ) {

	// 				var virtualLight;

	// 				if ( ! light.shadowCascadeArray[ n ] ) {

	// 					virtualLight = createVirtualLight( light, n );
	// 					virtualLight.originalCamera = camera;

	// 					var gyro = new Gyroscope();
	// 					gyro.position.copy( light.shadowCascadeOffset );

	// 					gyro.add( virtualLight );
	// 					gyro.add( virtualLight.target );

	// 					camera.add( gyro );

	// 					light.shadowCascadeArray[ n ] = virtualLight;

	// 					console.log( "Created virtualLight", virtualLight );

	// 				} else {

	// 					virtualLight = light.shadowCascadeArray[ n ];

	// 				}

	// 				updateVirtualLight( light, n );

	// 				lights[ k ] = virtualLight;
	// 				k ++;

	// 			}

	// 		} else {

	// 			lights[ k ] = light;
	// 			k ++;

	// 		}

	// 	}

	// 	// render depth map

	// 	for ( i = 0, il = lights.length; i < il; i ++ ) {

	// 		light = lights[ i ];

	// 		if ( ! light.shadowMap ) {

	// 			var shadowFilter = LinearFilter;

	// 			if ( _renderer.shadowMapType === PCFSoftShadowMap ) {

	// 				shadowFilter = NearestFilter;

	// 			}

	// 			var pars = { minFilter: shadowFilter, magFilter: shadowFilter, format: RGBAFormat };

	// 			light.shadowMap = new WebGLRenderTarget( light.shadowMapWidth, light.shadowMapHeight, pars );
	// 			light.shadowMapSize = new Vector2( light.shadowMapWidth, light.shadowMapHeight );

	// 			light.shadowMatrix = new Matrix4();

	// 		}

	// 		if ( ! light.shadowCamera ) {

	// 			if ( light instanceof SpotLight ) {

	// 				light.shadowCamera = new PerspectiveCamera( light.shadowCameraFov, light.shadowMapWidth / light.shadowMapHeight, light.shadowCameraNear, light.shadowCameraFar );

	// 			} else if ( light instanceof DirectionalLight ) {

	// 				light.shadowCamera = new OrthographicCamera( light.shadowCameraLeft, light.shadowCameraRight, light.shadowCameraTop, light.shadowCameraBottom, light.shadowCameraNear, light.shadowCameraFar );

	// 			} else {

	// 				console.error( "Unsupported light type for shadow" );
	// 				continue;

	// 			}

	// 			scene.add( light.shadowCamera );

	// 			if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

	// 		}

	// 		if ( light.shadowCameraVisible && ! light.cameraHelper ) {

	// 			light.cameraHelper = new CameraHelper( light.shadowCamera );
	// 			scene.add( light.cameraHelper );

	// 		}

	// 		if ( light.isVirtual && virtualLight.originalCamera == camera ) {

	// 			updateShadowCamera( camera, light );

	// 		}

	// 		shadowMap = light.shadowMap;
	// 		shadowMatrix = light.shadowMatrix;
	// 		shadowCamera = light.shadowCamera;

	// 		//

	// 		shadowCamera.position.setFromMatrixPosition( light.matrixWorld );
	// 		_matrixPosition.setFromMatrixPosition( light.target.matrixWorld );
	// 		shadowCamera.lookAt( _matrixPosition );
	// 		shadowCamera.updateMatrixWorld();

	// 		shadowCamera.matrixWorldInverse.getInverse( shadowCamera.matrixWorld );

	// 		//

	// 		if ( light.cameraHelper ) light.cameraHelper.visible = light.shadowCameraVisible;
	// 		if ( light.shadowCameraVisible ) light.cameraHelper.update();

	// 		// compute shadow matrix

	// 		shadowMatrix.set(
	// 			0.5, 0.0, 0.0, 0.5,
	// 			0.0, 0.5, 0.0, 0.5,
	// 			0.0, 0.0, 0.5, 0.5,
	// 			0.0, 0.0, 0.0, 1.0
	// 		);

	// 		shadowMatrix.multiply( shadowCamera.projectionMatrix );
	// 		shadowMatrix.multiply( shadowCamera.matrixWorldInverse );

	// 		// update camera matrices and frustum

	// 		_projScreenMatrix.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
	// 		_frustum.setFromMatrix( _projScreenMatrix );

	// 		// render shadow map

	// 		_renderer.setRenderTarget( shadowMap );
	// 		_renderer.clear();

	// 		// set object matrices & frustum culling

	// 		_renderList.length = 0;

	// 		projectObject( scene, scene, shadowCamera );


	// 		// render regular objects

	// 		var objectMaterial, useMorphing, useSkinning;

	// 		for ( j = 0, jl = _renderList.length; j < jl; j ++ ) {

	// 			webglObject = _renderList[ j ];

	// 			object = webglObject.object;
	// 			buffer = webglObject.buffer;

	// 			// culling is overriden globally for all objects
	// 			// while rendering depth map

	// 			// need to deal with MeshFaceMaterial somehow
	// 			// in that case just use the first of material.materials for now
	// 			// (proper solution would require to break objects by materials
	// 			//  similarly to regular rendering and then set corresponding
	// 			//  depth materials per each chunk instead of just once per object)

	// 			objectMaterial = getObjectMaterial( object );

	// 			useMorphing = object.geometry.morphTargets !== undefined && object.geometry.morphTargets.length > 0 && objectMaterial.morphTargets;
	// 			useSkinning = object instanceof SkinnedMesh && objectMaterial.skinning;

	// 			if ( object.customDepthMaterial ) {

	// 				material = object.customDepthMaterial;

	// 			} else if ( useSkinning ) {

	// 				material = useMorphing ? _depthMaterialMorphSkin : _depthMaterialSkin;

	// 			} else if ( useMorphing ) {

	// 				material = _depthMaterialMorph;

	// 			} else {

	// 				material = _depthMaterial;

	// 			}

	// 			_renderer.setMaterialFaces( objectMaterial );

	// 			if ( buffer instanceof BufferGeometry ) {

	// 				_renderer.renderBufferDirect( shadowCamera, _lights, fog, material, buffer, object );

	// 			} else {

	// 				_renderer.renderBuffer( shadowCamera, _lights, fog, material, buffer, object );

	// 			}

	// 		}

	// 		// set matrices and render immediate objects

	// 		for ( j = 0, jl = _webglObjectsImmediate.length; j < jl; j ++ ) {

	// 			webglObject = _webglObjectsImmediate[ j ];
	// 			object = webglObject.object;

	// 			if ( object.visible && object.castShadow ) {

	// 				object._modelViewMatrix.multiplyMatrices( shadowCamera.matrixWorldInverse, object.matrixWorld );

	// 				_renderer.renderImmediateObject( shadowCamera, _lights, fog, _depthMaterial, object );

	// 			}

	// 		}

	// 	}

	// 	// restore GL state

	// 	var clearColor = _renderer.getClearColor(),
	// 	clearAlpha = _renderer.getClearAlpha();

	// 	_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );
	// 	_gl.enable( _gl.BLEND );

	// 	if ( _renderer.shadowMapCullFace === CullFaceFront ) {

	// 		_gl.cullFace( _gl.BACK );

	// 	}

	// 	_renderer.resetGLState();

	// };

	function projectObject( scene, object, shadowCamera ){

		if ( object.visible ) {

			var webglObjects = _webglObjects[ object.id ];

			if ( webglObjects && object.castShadow && (object.frustumCulled === false || _frustum.intersectsObject( object ) === true) ) {

				for ( var i = 0, l = webglObjects.length; i < l; i ++ ) {

					var webglObject = webglObjects[ i ];

					object._modelViewMatrix.multiplyMatrices( shadowCamera.matrixWorldInverse, object.matrixWorld );
					_renderList.push( webglObject );

				}

			}

			for ( var i = 0, l = object.children.length; i < l; i ++ ) {

				projectObject( scene, object.children[ i ], shadowCamera );

			}

		}

	}

	function createVirtualLight( light, cascade ) {

		var virtualLight = new DirectionalLight();

		virtualLight.isVirtual = true;

		virtualLight.onlyShadow = true;
		virtualLight.castShadow = true;

		virtualLight.shadowCameraNear = light.shadowCameraNear;
		virtualLight.shadowCameraFar = light.shadowCameraFar;

		virtualLight.shadowCameraLeft = light.shadowCameraLeft;
		virtualLight.shadowCameraRight = light.shadowCameraRight;
		virtualLight.shadowCameraBottom = light.shadowCameraBottom;
		virtualLight.shadowCameraTop = light.shadowCameraTop;

		virtualLight.shadowCameraVisible = light.shadowCameraVisible;

		virtualLight.shadowDarkness = light.shadowDarkness;

		virtualLight.shadowBias = light.shadowCascadeBias[ cascade ];
		virtualLight.shadowMapWidth = light.shadowCascadeWidth[ cascade ];
		virtualLight.shadowMapHeight = light.shadowCascadeHeight[ cascade ];

		virtualLight.pointsWorld = [];
		virtualLight.pointsFrustum = [];

		var pointsWorld = virtualLight.pointsWorld,
			pointsFrustum = virtualLight.pointsFrustum;

		for ( var i = 0; i < 8; i ++ ) {

			pointsWorld[ i ] = new Vector3();
			pointsFrustum[ i ] = new Vector3();

		}

		var nearZ = light.shadowCascadeNearZ[ cascade ];
		var farZ = light.shadowCascadeFarZ[ cascade ];

		pointsFrustum[ 0 ].set( - 1, - 1, nearZ );
		pointsFrustum[ 1 ].set(  1, - 1, nearZ );
		pointsFrustum[ 2 ].set( - 1,  1, nearZ );
		pointsFrustum[ 3 ].set(  1,  1, nearZ );

		pointsFrustum[ 4 ].set( - 1, - 1, farZ );
		pointsFrustum[ 5 ].set(  1, - 1, farZ );
		pointsFrustum[ 6 ].set( - 1,  1, farZ );
		pointsFrustum[ 7 ].set(  1,  1, farZ );

		return virtualLight;

	}

	// Synchronize virtual light with the original light

	function updateVirtualLight( light, cascade ) {

		var virtualLight = light.shadowCascadeArray[ cascade ];

		virtualLight.position.copy( light.position );
		virtualLight.target.position.copy( light.target.position );
		virtualLight.lookAt( virtualLight.target );

		virtualLight.shadowCameraVisible = light.shadowCameraVisible;
		virtualLight.shadowDarkness = light.shadowDarkness;

		virtualLight.shadowBias = light.shadowCascadeBias[ cascade ];

		var nearZ = light.shadowCascadeNearZ[ cascade ];
		var farZ = light.shadowCascadeFarZ[ cascade ];

		var pointsFrustum = virtualLight.pointsFrustum;

		pointsFrustum[ 0 ].z = nearZ;
		pointsFrustum[ 1 ].z = nearZ;
		pointsFrustum[ 2 ].z = nearZ;
		pointsFrustum[ 3 ].z = nearZ;

		pointsFrustum[ 4 ].z = farZ;
		pointsFrustum[ 5 ].z = farZ;
		pointsFrustum[ 6 ].z = farZ;
		pointsFrustum[ 7 ].z = farZ;

	}

	// Fit shadow camera's ortho frustum to camera frustum

	function updateShadowCamera( camera, light ) {

		var shadowCamera = light.shadowCamera,
			pointsFrustum = light.pointsFrustum,
			pointsWorld = light.pointsWorld;

		_min.set( Infinity, Infinity, Infinity );
		_max.set( - Infinity, - Infinity, - Infinity );

		for ( var i = 0; i < 8; i ++ ) {

			var p = pointsWorld[ i ];

			p.copy( pointsFrustum[ i ] );
			p.unproject( camera );

			p.applyMatrix4( shadowCamera.matrixWorldInverse );

			if ( p.x < _min.x ) _min.x = p.x;
			if ( p.x > _max.x ) _max.x = p.x;

			if ( p.y < _min.y ) _min.y = p.y;
			if ( p.y > _max.y ) _max.y = p.y;

			if ( p.z < _min.z ) _min.z = p.z;
			if ( p.z > _max.z ) _max.z = p.z;

		}

		shadowCamera.left = _min.x;
		shadowCamera.right = _max.x;
		shadowCamera.top = _max.y;
		shadowCamera.bottom = _min.y;

		// can't really fit near/far
		//shadowCamera.near = _min.z;
		//shadowCamera.far = _max.z;

		shadowCamera.updateProjectionMatrix();

	}

	// For the moment just ignore objects that have multiple materials with different animation methods
	// Only the first material will be taken into account for deciding which depth material to use for shadow maps

	function getObjectMaterial( object ) {

		return object.material instanceof MeshFaceMaterial
			? object.material.materials[ 0 ]
			: object.material;

	};

};
export {ShadowMapPlugin}