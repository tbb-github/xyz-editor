class BufferAttribute {
    constructor(array, itemSize, normalized = false) {
		if ( Array.isArray( array ) ) {

			throw new TypeError( 'XYZ.BufferAttribute: array should be a Typed Array.' );

		}
        this.array = array;
		this.itemSize = itemSize;
		this.count = array !== undefined ? array.length / itemSize : 0;
		this.normalized = normalized;
        this.version = 0;
    }
    set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}
}
class Float32BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Float32Array( array ), itemSize, normalized );

	}

}
export {
	Float32BufferAttribute,
	BufferAttribute
};