import {RawShaderMaterial} from '../../materials/RawShaderMaterial.js'
import {WebGLShader} from './WebGLShader.js'
var WebGLProgram = ( function () {

	var programIdCount = 0;

	var generateDefines = function ( defines ) {

		var value, chunk, chunks = [];

		for ( var d in defines ) {

			value = defines[ d ];
			if ( value === false ) continue;

			chunk = '#define ' + d + ' ' + value;
			chunks.push( chunk );

		}

		return chunks.join( '\n' );

	};

	var cacheUniformLocations = function ( gl, program, identifiers ) {

		var uniforms = {};

		for ( var i = 0, l = identifiers.length; i < l; i ++ ) {

			var id = identifiers[ i ];
			uniforms[ id ] = gl.getUniformLocation( program, id );

		}

		console.log(identifiers, 'identifiers');
		

		return uniforms;

	};

	var cacheAttributeLocations = function ( gl, program, identifiers ) {

		var attributes = {};

		for ( var i = 0, l = identifiers.length; i < l; i ++ ) {

			var id = identifiers[ i ];
			attributes[ id ] = gl.getAttribLocation( program, id );
		}

		return attributes;

	};

	return function ( renderer, code, material, parameters ) {

		
		var _this = renderer;
		var _gl = _this.context;

		var defines = material.defines;
		var uniforms = material.__webglShader.uniforms;
		var attributes = material.attributes;
		console.log(material.__webglShader.vertexShader, '0000---');
		
		var vertexShader = material.__webglShader.vertexShader;
		var fragmentShader = material.__webglShader.fragmentShader;


		var customDefines = generateDefines( defines );


		var program = _gl.createProgram();

		var prefix_vertex, prefix_fragment;

		if ( material instanceof RawShaderMaterial ) {

			prefix_vertex = '';
			prefix_fragment = '';

		} else {

			prefix_vertex = [

				'precision ' + parameters.precision + ' float;',
				'precision ' + parameters.precision + ' int;',

				customDefines,

	
				parameters.vertexColors ? '#define USE_COLOR' : '',



				'uniform mat4 modelMatrix;',
				'uniform mat4 modelViewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 viewMatrix;',
				'uniform mat3 normalMatrix;',
				'uniform vec3 cameraPosition;',

				'attribute vec3 position;',
				'attribute vec3 normal;',
				'attribute vec2 uv;',
				'attribute vec2 uv2;',

				'#ifdef USE_COLOR',

				'	attribute vec3 color;',

				'#endif',

				''

			].join( '\n' );

			prefix_fragment = [

				'precision ' + parameters.precision + ' float;',
				'precision ' + parameters.precision + ' int;',

				( parameters.bumpMap || parameters.normalMap ) ? '#extension GL_OES_standard_derivatives : enable' : '',

				customDefines,

				parameters.vertexColors ? '#define USE_COLOR' : '',

				'uniform mat4 viewMatrix;',
				'uniform vec3 cameraPosition;',
				''

			].join( '\n' );

		}

		var glVertexShader = new WebGLShader( _gl, _gl.VERTEX_SHADER, prefix_vertex + vertexShader );
		var glFragmentShader = new WebGLShader( _gl, _gl.FRAGMENT_SHADER, prefix_fragment + fragmentShader );

		

		_gl.attachShader( program, glVertexShader );
		_gl.attachShader( program, glFragmentShader );



		_gl.linkProgram( program );

		if ( _gl.getProgramParameter( program, _gl.LINK_STATUS ) === false ) {

			console.error( 'WebGLProgram: Could not initialise shader.' );
			console.error( 'gl.VALIDATE_STATUS', _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) );
			console.error( 'gl.getError()', _gl.getError() );

		}

		if ( _gl.getProgramInfoLog( program ) !== '' ) {

			console.warn( 'WebGLProgram: gl.getProgramInfoLog()', _gl.getProgramInfoLog( program ) );

		}

		// clean up

		_gl.deleteShader( glVertexShader );
		_gl.deleteShader( glFragmentShader );

		// cache uniform locations

		var identifiers = [

			'viewMatrix',
			'modelViewMatrix',
			'projectionMatrix',
			'normalMatrix',
			'modelMatrix',
			'cameraPosition',
			'morphTargetInfluences',
			'bindMatrix',
			'bindMatrixInverse'

		];

		if ( parameters.useVertexTexture ) {

			identifiers.push( 'boneTexture' );
			identifiers.push( 'boneTextureWidth' );
			identifiers.push( 'boneTextureHeight' );

		} else {

			identifiers.push( 'boneGlobalMatrices' );

		}

		if ( parameters.logarithmicDepthBuffer ) {

			identifiers.push('logDepthBufFC');

		}

		console.log(uniforms, 'uniforms');
		
		for ( var u in uniforms ) {

			identifiers.push( u );

		}

		this.uniforms = cacheUniformLocations( _gl, program, identifiers );

		// cache attributes locations

		identifiers = [

			'position',
			'normal',
			'uv',
			'uv2',
			'tangent',
			'color',
			'skinIndex',
			'skinWeight',
			'lineDistance'

		];

		for ( var i = 0; i < parameters.maxMorphTargets; i ++ ) {

			identifiers.push( 'morphTarget' + i );

		}

		for ( var i = 0; i < parameters.maxMorphNormals; i ++ ) {

			identifiers.push( 'morphNormal' + i );

		}

		for ( var a in attributes ) {

			identifiers.push( a );

		}

		
		this.attributes = cacheAttributeLocations( _gl, program, identifiers );
		this.attributesKeys = Object.keys( this.attributes );

		this.id = programIdCount ++;
		this.code = code;
		this.usedTimes = 1;
		this.program = program;
		this.vertexShader = glVertexShader;
		this.fragmentShader = glFragmentShader;

		return this;

	};

} )();
export {WebGLProgram}