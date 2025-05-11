class BufferGeometry {
    constructor() {
		this.name = '';
		this.type = 'BufferGeometry';
		this.index = null;
		this.attributes = {};
		this.boundingBox = null;
		this.boundingSphere = null;
    }
	getAttribute( name ) {

		return this.attributes[ name ];

	}

	setAttribute( name, attribute ) {

		this.attributes[ name ] = attribute;

		return this;

	}
	getIndex() {

		return this.index;

	}

	setIndex( index ) {
		this.index = index;
		return this;
	} 

    copy( source ) {
		return this;
	}
}