/**
 * @author mrdoob / http://mrdoob.com/
 */
import {Object3D} from '../core/Object3D.js'
function Group () {

	Object3D.call( this );

	this.type = 'Group';

};

Group.prototype = Object.create( Object3D.prototype );
Group.prototype.constructor = Group;
export {Group}
