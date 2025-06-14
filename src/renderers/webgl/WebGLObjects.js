/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLObjects( geometries, info ) {

	var updateList = {};

	function update( object ) {

		var frame = info.render.frame;

		var geometry = object.geometry;
		var buffergeometry = geometries.get( object, geometry );

		// console.log(updateList[ buffergeometry.id ], frame,'buffergeometrybuffergeometry');
		

		// Update once per frame

		if ( updateList[ buffergeometry.id ] !== frame ) {

			if ( geometry.isGeometry ) {

				buffergeometry.updateFromObject( object );

			}

			geometries.update( buffergeometry );//更新object的geometry

			updateList[ buffergeometry.id ] = frame;

		}//默认不会在进行第二次了

		return buffergeometry;

	}

	function dispose() {

		updateList = {};

	}

	return {

		update: update,
		dispose: dispose

	};

}


export { WebGLObjects };
