/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */
import { Quaternion } from '../math/Quaternion.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Matrix3 } from '../math/Matrix3.js';
import { EventDispatcher } from './EventDispatcher.js';
import { Euler } from '../math/Euler.js';
import { _Math } from '../math/Math.js';

var Object3DIdCount = 0;
function Object3D() {

	Object.defineProperty( this, 'id', { value: Object3DIdCount ++ } );

	this.uuid = _Math.generateUUID();

	this.name = '';
	this.type = 'Object3D';

	this.parent = undefined;
	this.children = [];

	this.up = Object3D.DefaultUp.clone();

	var scope = this;

	var position = new Vector3();
	var rotation = new Euler();
	var quaternion = new Quaternion();
	var scale = new Vector3( 1, 1, 1 );

	var onRotationChange = function () {
		quaternion.setFromEuler( rotation, false );
	};

	var onQuaternionChange = function () {
		rotation.setFromQuaternion( quaternion, undefined, false );
	};

	rotation.onChange( onRotationChange );
	quaternion.onChange( onQuaternionChange );

	Object.defineProperties( this, {
		position: {
			enumerable: true,
			value: position
		},
		rotation: {
			enumerable: true,
			value: rotation
		},
		quaternion: {
			enumerable: true,
			value: quaternion
		},
		scale: {
			enumerable: true,
			value: scale
		},
		modelViewMatrix: {
			value: new Matrix4()
		},
		normalMatrix: {
			value: new Matrix3()
		}
	} );

	this.rotationAutoUpdate = true;

	this.matrix = new Matrix4();
	this.matrixWorld = new Matrix4();

	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = false;

	this.visible = true;

	this.castShadow = false;
	this.receiveShadow = false;

	this.frustumCulled = true;

	this.userData = {};

};

Object3D.DefaultUp = new Vector3( 0, 1, 0 );

Object.assign( Object3D.prototype,   {

	constructor: Object3D,

	isObject3D: true,

	// get eulerOrder () {

	// 	console.warn( 'Object3D: .eulerOrder has been moved to .rotation.order.' );

	// 	console.log(this.rotation, 'this.rotation');
		

	// 	return this.rotation.order;

	// },

	// set eulerOrder ( value ) {

	// 	console.warn( 'Object3D: .eulerOrder has been moved to .rotation.order.' );

	// 	this.rotation.order = value;

	// },

	// get useQuaternion () {

	// 	console.warn( 'Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );

	// },

	// set useQuaternion ( value ) {

	// 	console.warn( 'Object3D: .useQuaternion has been removed. The library now uses quaternions by default.' );

	// },

	applyMatrix: function ( matrix ) {

		this.matrix.multiplyMatrices( matrix, this.matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	},

	setRotationFromAxisAngle: function ( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	},

	setRotationFromEuler: function ( euler ) {

		this.quaternion.setFromEuler( euler, true );

	},

	setRotationFromMatrix: function ( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	},

	setRotationFromQuaternion: function ( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	},

	rotateOnAxis: function () {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		var q1 = new Quaternion();

		return function ( axis, angle ) {

			q1.setFromAxisAngle( axis, angle );

			this.quaternion.multiply( q1 );

			return this;

		}

	}(),

	rotateX: function () {

		var v1 = new Vector3( 1, 0, 0 );

		return function ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	rotateY: function () {

		var v1 = new Vector3( 0, 1, 0 );

		return function ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	rotateZ: function () {

		var v1 = new Vector3( 0, 0, 1 );

		return function ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	translateOnAxis: function () {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		var v1 = new Vector3();

		return function ( axis, distance ) {

			v1.copy( axis ).applyQuaternion( this.quaternion );

			this.position.add( v1.multiplyScalar( distance ) );

			return this;

		}

	}(),

	translate: function ( distance, axis ) {

		console.warn( 'Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.' );
		return this.translateOnAxis( axis, distance );

	},

	translateX: function () {

		var v1 = new Vector3( 1, 0, 0 );

		return function ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	translateY: function () {

		var v1 = new Vector3( 0, 1, 0 );

		return function ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	translateZ: function () {

		var v1 = new Vector3( 0, 0, 1 );

		return function ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	localToWorld: function ( vector ) {

		return vector.applyMatrix4( this.matrixWorld );

	},

	worldToLocal: function () {

		var m1 = new Matrix4();

		return function ( vector ) {

			return vector.applyMatrix4( m1.getInverse( this.matrixWorld ) );

		};

	}(),

	lookAt: function () {

		// This routine does not support objects with rotated and/or translated parent(s)

		var m1 = new Matrix4();

		return function ( vector ) {

			m1.lookAt( vector, this.position, this.up );

			this.quaternion.setFromRotationMatrix( m1 );

		};

	}(),

	add: function ( object ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		};

		if ( object === this ) {

			console.error( "Object3D.add:", object, "can't be added as a child of itself." );
			return this;

		}

		if ( object instanceof Object3D ) {

			if ( object.parent !== undefined ) {

				object.parent.remove( object );

			}

			object.parent = this;
			object.dispatchEvent( { type: 'added' } );

			this.children.push( object );

		} else {

			console.error( "Object3D.add:", object, "is not an instance of Object3D." );

		}

		return this;

	},

	remove: function ( object ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i++ ) {

				this.remove( arguments[ i ] );

			}

		};

		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = undefined;

			object.dispatchEvent( { type: 'removed' } );

			this.children.splice( index, 1 );

		}

	},

	getChildByName: function ( name, recursive ) {

		console.warn( 'Object3D: .getChildByName() has been renamed to .getObjectByName().' );
		return this.getObjectByName( name, recursive );

	},

	getObjectById: function ( id, recursive ) {

		return this.getObjectByProperty( 'id', id, recursive );

	},

	getObjectByName: function ( name, recursive ) {

		return this.getObjectByProperty( 'name', name, recursive );

	},

	getObjectByProperty: function ( name, value, recursive ) {

		if ( this[ name ] === value ) return this;

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];
			var object = child.getObjectByProperty( name, value, recursive );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	},

	getWorldPosition: function ( optionalTarget ) {

		var result = optionalTarget || new Vector3();

		this.updateMatrixWorld( true );

		return result.setFromMatrixPosition( this.matrixWorld );

	},

	getWorldQuaternion: function () {

		var position = new Vector3();
		var scale = new Vector3();

		return function ( optionalTarget ) {

			var result = optionalTarget || new Quaternion();

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, result, scale );

			return result;

		}

	}(),

	getWorldRotation: function () {

		var quaternion = new Quaternion();

		return function ( optionalTarget ) {

			var result = optionalTarget || new Euler();

			this.getWorldQuaternion( quaternion );

			return result.setFromQuaternion( quaternion, this.rotation.order, false );

		}

	}(),

	getWorldScale: function () {

		var position = new Vector3();
		var quaternion = new Quaternion();

		return function ( optionalTarget ) {

			var result = optionalTarget || new Vector3();

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, quaternion, result );

			return result;

		}

	}(),

	getWorldDirection: function () {

		var quaternion = new Quaternion();

		return function ( optionalTarget ) {

			var result = optionalTarget || new Vector3();

			this.getWorldQuaternion( quaternion );

			return result.set( 0, 0, 1 ).applyQuaternion( quaternion );

		}

	}(),

	raycast: function () {},

	traverse: function ( callback ) {

		callback( this );

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].traverse( callback );

		}

	},

	traverseVisible: function ( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].traverseVisible( callback );

		}

	},

	traverseAncestors: function ( callback ) {

		if ( this.parent ) {

			callback( this.parent );

			this.parent.traverseAncestors( callback );

		}

	},

	updateMatrix: function () {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		

		this.matrixWorldNeedsUpdate = true;

	},

	updateMatrixWorld: function ( force ) {

		if ( this.matrixAutoUpdate === true ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate === true || force === true ) {

			if ( this.parent === undefined ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	},

	toJSON: function () {

		var output = {
			metadata: {
				version: 4.3,
				type: 'Object',
				generator: 'ObjectExporter'
			}
		};

		//

		var geometries = {};

		var parseGeometry = function ( geometry ) {

			if ( output.geometries === undefined ) {

				output.geometries = [];

			}

			if ( geometries[ geometry.uuid ] === undefined ) {

				var json = geometry.toJSON();

				delete json.metadata;

				geometries[ geometry.uuid ] = json;

				output.geometries.push( json );

			}

			return geometry.uuid;

		};

		//

		var materials = {};

		var parseMaterial = function ( material ) {

			if ( output.materials === undefined ) {

				output.materials = [];

			}

			if ( materials[ material.uuid ] === undefined ) {

				var json = material.toJSON();

				delete json.metadata;

				materials[ material.uuid ] = json;

				output.materials.push( json );

			}

			return material.uuid;

		};

		//

		var parseObject = function ( object ) {

			var data = {};

			data.uuid = object.uuid;
			data.type = object.type;

			if ( object.name !== '' ) data.name = object.name;
			if ( JSON.stringify( object.userData ) !== '{}' ) data.userData = object.userData;
			if ( object.visible !== true ) data.visible = object.visible;

			if ( object instanceof PerspectiveCamera ) {

				data.fov = object.fov;
				data.aspect = object.aspect;
				data.near = object.near;
				data.far = object.far;

			} else if ( object instanceof OrthographicCamera ) {

				data.left = object.left;
				data.right = object.right;
				data.top = object.top;
				data.bottom = object.bottom;
				data.near = object.near;
				data.far = object.far;

			} else if ( object instanceof AmbientLight ) {

				data.color = object.color.getHex();

			} else if ( object instanceof DirectionalLight ) {

				data.color = object.color.getHex();
				data.intensity = object.intensity;

			} else if ( object instanceof PointLight ) {

				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.distance = object.distance;

			} else if ( object instanceof SpotLight ) {

				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.distance = object.distance;
				data.angle = object.angle;
				data.exponent = object.exponent;

			} else if ( object instanceof HemisphereLight ) {

				data.color = object.color.getHex();
				data.groundColor = object.groundColor.getHex();

			} else if ( object instanceof Mesh ) {

				data.geometry = parseGeometry( object.geometry );
				data.material = parseMaterial( object.material );

			} else if ( object instanceof Line ) {

				data.geometry = parseGeometry( object.geometry );
				data.material = parseMaterial( object.material );

			} else if ( object instanceof Sprite ) {

				data.material = parseMaterial( object.material );

			}

			data.matrix = object.matrix.toArray();

			if ( object.children.length > 0 ) {

				data.children = [];

				for ( var i = 0; i < object.children.length; i ++ ) {

					data.children.push( parseObject( object.children[ i ] ) );

				}

			}

			return data;

		}

		output.object = parseObject( this );

		return output;

	},

	clone: function ( object, recursive ) {

		if ( object === undefined ) object = new Object3D();
		if ( recursive === undefined ) recursive = true;

		object.name = this.name;

		object.up.copy( this.up );

		object.position.copy( this.position );
		object.quaternion.copy( this.quaternion );
		object.scale.copy( this.scale );

		object.rotationAutoUpdate = this.rotationAutoUpdate;

		object.matrix.copy( this.matrix );
		object.matrixWorld.copy( this.matrixWorld );

		object.matrixAutoUpdate = this.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;

		object.visible = this.visible;

		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;

		object.frustumCulled = this.frustumCulled;

		object.userData = JSON.parse( JSON.stringify( this.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < this.children.length; i ++ ) {

				var child = this.children[ i ];
				object.add( child.clone() );

			}

		}

		return object;

	}

});

EventDispatcher.prototype.apply( Object3D.prototype );



export { Object3D };
