/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 */
import {Object3D} from '../core/Object3D.js'
import {Matrix4} from '../math/Matrix4.js'
import {Ray} from '../math/Ray.js'
import {Sphere} from '../math/Sphere.js'
import {Vector3} from '../math/Vector3.js'
function Mesh ( geometry, material ) {

	Object3D.call( this );

	this.type = 'Mesh';
	
	this.geometry = geometry !== undefined ? geometry : new Geometry();
	this.material = material !== undefined ? material : new MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.updateMorphTargets();

};

Mesh.prototype = Object.create( Object3D.prototype );
Mesh.prototype.constructor = Mesh;
Mesh.prototype.isMesh = true;
Mesh.prototype.updateMorphTargets = function () {

	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {

		this.morphTargetBase = - 1;
		this.morphTargetForcedOrder = [];
		this.morphTargetInfluences = [];
		this.morphTargetDictionary = {};

		for ( var m = 0, ml = this.geometry.morphTargets.length; m < ml; m ++ ) {

			this.morphTargetInfluences.push( 0 );
			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

		}

	}

};

Mesh.prototype.getMorphTargetIndexByName = function ( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];

	}

	console.log( 'Mesh.getMorphTargetIndexByName: morph target ' + name + ' does not exist. Returning 0.' );

	return 0;

};


Mesh.prototype.raycast = ( function () {

	var inverseMatrix = new Matrix4();
	var ray = new Ray();
	var sphere = new Sphere();

	var vA = new Vector3();
	var vB = new Vector3();
	var vC = new Vector3();

	return function ( raycaster, intersects ) {

		var geometry = this.geometry;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		sphere.copy( geometry.boundingSphere );
		sphere.applyMatrix4( this.matrixWorld );

		if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

			return;

		}

		// Check boundingBox before continuing

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		if ( geometry.boundingBox !== null ) {

			if ( ray.isIntersectionBox( geometry.boundingBox ) === false )  {

				return;

			}

		}

		if ( geometry instanceof BufferGeometry ) {

			var material = this.material;

			if ( material === undefined ) return;

			var attributes = geometry.attributes;

			var a, b, c;
			var precision = raycaster.precision;

			if ( attributes.index !== undefined ) {

				var indices = attributes.index.array;
				var positions = attributes.position.array;
				var offsets = geometry.offsets;

				if ( offsets.length === 0 ) {

					offsets = [ { start: 0, count: indices.length, index: 0 } ];

				}

				for ( var oi = 0, ol = offsets.length; oi < ol; ++oi ) {

					var start = offsets[ oi ].start;
					var count = offsets[ oi ].count;
					var index = offsets[ oi ].index;

					for ( var i = start, il = start + count; i < il; i += 3 ) {

						a = index + indices[ i ];
						b = index + indices[ i + 1 ];
						c = index + indices[ i + 2 ];

						vA.fromArray( positions, a * 3 );
						vB.fromArray( positions, b * 3 );
						vC.fromArray( positions, c * 3 );

						if ( material.side === BackSide ) {

							var intersectionPoint = ray.intersectTriangle( vC, vB, vA, true );

						} else {

							var intersectionPoint = ray.intersectTriangle( vA, vB, vC, material.side !== DoubleSide );

						}

						if ( intersectionPoint === null ) continue;

						intersectionPoint.applyMatrix4( this.matrixWorld );

						var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

						if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

						intersects.push( {

							distance: distance,
							point: intersectionPoint,
							face: new Face3( a, b, c, Triangle.normal( vA, vB, vC ) ),
							faceIndex: null,
							object: this

						} );

					}

				}

			} else {

				var positions = attributes.position.array;

				for ( var i = 0, j = 0, il = positions.length; i < il; i += 3, j += 9 ) {

					a = i;
					b = i + 1;
					c = i + 2;

					vA.fromArray( positions, j );
					vB.fromArray( positions, j + 3 );
					vC.fromArray( positions, j + 6 );

					if ( material.side === BackSide ) {

						var intersectionPoint = ray.intersectTriangle( vC, vB, vA, true );

					} else {

						var intersectionPoint = ray.intersectTriangle( vA, vB, vC, material.side !== DoubleSide );

					}

					if ( intersectionPoint === null ) continue;

					intersectionPoint.applyMatrix4( this.matrixWorld );

					var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

					if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

					intersects.push( {

						distance: distance,
						point: intersectionPoint,
						face: new Face3( a, b, c, Triangle.normal( vA, vB, vC ) ),
						faceIndex: null,
						object: this

					} );

				}

			}

		} else if ( geometry instanceof Geometry ) {

			var isFaceMaterial = this.material instanceof MeshFaceMaterial;
			var objectMaterials = isFaceMaterial === true ? this.material.materials : null;

			var a, b, c, d;
			var precision = raycaster.precision;

			var vertices = geometry.vertices;

			for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				var face = geometry.faces[ f ];

				var material = isFaceMaterial === true ? objectMaterials[ face.materialIndex ] : this.material;

				if ( material === undefined ) continue;

				a = vertices[ face.a ];
				b = vertices[ face.b ];
				c = vertices[ face.c ];

				if ( material.morphTargets === true ) {

					var morphTargets = geometry.morphTargets;
					var morphInfluences = this.morphTargetInfluences;

					vA.set( 0, 0, 0 );
					vB.set( 0, 0, 0 );
					vC.set( 0, 0, 0 );

					for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

						var influence = morphInfluences[ t ];

						if ( influence === 0 ) continue;

						var targets = morphTargets[ t ].vertices;

						vA.x += ( targets[ face.a ].x - a.x ) * influence;
						vA.y += ( targets[ face.a ].y - a.y ) * influence;
						vA.z += ( targets[ face.a ].z - a.z ) * influence;

						vB.x += ( targets[ face.b ].x - b.x ) * influence;
						vB.y += ( targets[ face.b ].y - b.y ) * influence;
						vB.z += ( targets[ face.b ].z - b.z ) * influence;

						vC.x += ( targets[ face.c ].x - c.x ) * influence;
						vC.y += ( targets[ face.c ].y - c.y ) * influence;
						vC.z += ( targets[ face.c ].z - c.z ) * influence;

					}

					vA.add( a );
					vB.add( b );
					vC.add( c );

					a = vA;
					b = vB;
					c = vC;

				}

				if ( material.side === BackSide ) {

					var intersectionPoint = ray.intersectTriangle( c, b, a, true );

				} else {

					var intersectionPoint = ray.intersectTriangle( a, b, c, material.side !== DoubleSide );

				}

				if ( intersectionPoint === null ) continue;

				intersectionPoint.applyMatrix4( this.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

				if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

				intersects.push( {

					distance: distance,
					point: intersectionPoint,
					face: face,
					faceIndex: f,
					object: this

				} );

			}

		}

	};

}() );

Mesh.prototype.clone = function ( object, recursive ) {

	if ( object === undefined ) object = new Mesh( this.geometry, this.material );

	Object3D.prototype.clone.call( this, object, recursive );

	return object;

};
export {Mesh}