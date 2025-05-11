import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector3 } from '../math/Vector3.js';

// 对于立体表面而言，法线是有方向的：一般来说，由立体的内部指向外部的是法线正方向即外法线，反过来的是法线负方向。而外法线就是所谓正方向的法线。内外法线的斜率相同，向量的方向相反
// 按照（px，nx，py，ny，pz，nz）的顺序。

// nx是以x轴正方向为法线指向的面，px则是以负方向为法线指向的面；前提是法向量是从物体内部指向外部的法向量,因为单凭方向无法确定哪个是 nx，哪个是 px，因为一个面的法向量有两个可能的方向

// ny是以y轴正方向为法线指向的面，py则是以负方向为法线指向的面；

// nz是以z轴正方向为法线指向的面，pz则是以负方向为法线指向的面；

// ‌px‌：表示立方体的左面（负x轴方向）
// ‌nx‌：表示立方体的右面（正x轴方向）
// ‌py‌：表示立方体的底面（负y轴方向）
// ‌ny‌：表示立方体的顶面（正y轴方向）
// ‌pz‌：表示立方体的背面（负z轴方向）
// ‌nz‌：表示立方体的正面（正z轴方向）


// 实际three.js 法向量是从物体外部指向内部的法向量
// ‌px‌：表示立方体的右面（负x轴方向）
// ‌nx‌：表示立方体的左面（正x轴方向）
// ‌py‌：表示立方体的上面面（负y轴方向）
// ‌ny‌：表示立方体的下面（正y轴方向）
// ‌pz‌：表示立方体的前面（负z轴方向）
// ‌nz‌：表示立方体的后面（正z轴方向）
class BoxGeometry extends BufferGeometry {

	constructor( width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 ) {

		super();

		this.type = 'BoxGeometry';

		this.parameters = {
			width: width,
			height: height,
			depth: depth,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			depthSegments: depthSegments
		};

		const scope = this;

		// segments

		widthSegments = Math.floor( widthSegments );
		heightSegments = Math.floor( heightSegments );
		depthSegments = Math.floor( depthSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		let numberOfVertices = 0;
		let groupStart = 0;

		// build each side of the box geometry

		buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0 ); // px
		buildPlane( 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1 ); // nx
		buildPlane( 'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2 ); // py
		buildPlane( 'x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3 ); // ny
		buildPlane( 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4 ); // pz
		buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5 ); // nz

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		function buildPlane( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {

			const segmentWidth = width / gridX;
			const segmentHeight = height / gridY;

			const widthHalf = width / 2;
			const heightHalf = height / 2;
			const depthHalf = depth / 2;

			const gridX1 = gridX + 1;
			const gridY1 = gridY + 1;

			let vertexCounter = 0;
			let groupCount = 0;

			const vector = new Vector3();

			// generate vertices, normals and uvs

			for ( let iy = 0; iy < gridY1; iy ++ ) {

				const y = iy * segmentHeight - heightHalf;

				for ( let ix = 0; ix < gridX1; ix ++ ) {

					const x = ix * segmentWidth - widthHalf;

					// set values to correct vector component

					vector[ u ] = x * udir;
					vector[ v ] = y * vdir;
					vector[ w ] = depthHalf;

					// now apply vector to vertex buffer

					vertices.push( vector.x, vector.y, vector.z );

					// set values to correct vector component

					vector[ u ] = 0;
					vector[ v ] = 0;
					vector[ w ] = depth > 0 ? 1 : - 1;

					// now apply vector to normal buffer

					normals.push( vector.x, vector.y, vector.z );

					// uvs

					uvs.push( ix / gridX );
					uvs.push( 1 - ( iy / gridY ) );

					// counters

					vertexCounter += 1;

				}

			}

			// indices

			// 1. you need three indices to draw a single face
			// 2. a single segment consists of two faces
			// 3. so we need to generate six (2*3) indices per segment

			for ( let iy = 0; iy < gridY; iy ++ ) {

				for ( let ix = 0; ix < gridX; ix ++ ) {

					const a = numberOfVertices + ix + gridX1 * iy;
					const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
					const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
					const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

					// faces

					indices.push( a, b, d );
					indices.push( b, c, d );

					// increase counter

					groupCount += 6;

				}

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, materialIndex );

			// calculate new start value for groups

			groupStart += groupCount;

			// update total number of vertices

			numberOfVertices += vertexCounter;

		}
		// 构建6个面
		function buildPlane2( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {
			const vector = new Vector3();
			// 1.顶点,一般来说一个面就6个顶点，两个三角面组成，也即gridX=1,gridY=1,以width=10, height=10 为例
			const segmentWidth = width / gridX;
			const segmentHeight = height / gridY;
			const widthHalf = width / 2;
			const heightHalf = height / 2;
			// 为了中心对称，将宽高除以 2 得到一半的值 也即顶点坐标变成(-5,5,5) (5,5,5)这样对称
			const depthHalf = depth / 2;
			// -5,-5, -5,5 5,-5, 5,5
			for (let i = 0; i < gridX+1; i++) {
				const x = i * segmentWidth - widthHalf;
				for (let j = 0; j < gridY+1;j++) {
					const y = iy * segmentHeight - heightHalf;
					vector[ u ] = x * udir;//udir, vdir: 方向因子，通常是 +1 或 -1，用于控制面的方向 
					vector[ v ] = y * vdir;//udir 和 vdir 是 ±1，用来决定该轴上的坐标是否翻转
					// x 不翻转 y 翻转 生成的顶点在 x 方向上是从左到右，而 y 方向上是从上到下。
					vector[ w ] = depthHalf;

					vertices.push( vector.x, vector.y, vector.z );

					vector[ u ] = 0;
					vector[ v ] = 0;
					vector[ w ] = depth > 0 ? 1 : - 1;
					normals.push( vector.x, vector.y, vector.z  );

					uvs.push( i / gridX, 1 - ( j / gridY )  );
					// ix / gridX：归一化到 [0, 1] 范围，表示横向纹理位置（U）
	                // 1 - ( j / gridY )：把纹理坐标从“从上到下”翻转为“从下到上”
					// Three.js 中默认的纹理坐标是以 左下角为原点 (0, 0)，而很多图像 API（如 HTML5 Canvas、WebGL）也是这样定义的。
					// 但在这个函数中，iy 是从顶部开始递增的（外层循环先处理顶部），所以如果不加 1 - ...，纹理会倒过来显示。

					vertexCounter += 1;
				}
			}
			// 生成一个二维网格（grid）的索引数据，通常应用于三维图形编程中（如使用 Three.js 等图形库）。它通过嵌套循环遍历网格的每个单元格，并为每个单元格生成两个三角形（即一个四边形由两个三角形组成），
			// 然后将这些顶点索引添加到 indices 数组中。同时，每添加一个四边形的两个三角形（共 6 个顶点），groupCount 计数器增加 6
			for (let i = 0; i < gridX; i++) {
				for (let j = 0; j < gridY;j++) {
					const a = numberOfVertices + i + (gridX+1) * j;//左下 0+0+0
					const b = numberOfVertices + i + (gridX+1) * (j + 1);//左上  0+0+2
					const c = numberOfVertices + (i + 1) + (gridX+1) * (j + 1);//右上 0+1+2 
					const d = numberOfVertices + (i + 1) + (gridX+1) * j;//右下 0+1+0 
					indices.push( a, b, d );//左下 左上 右下
					indices.push( d, b, c );//右下 左上 右上
					//a, b, c, d 分别表示当前单元格的四个顶点（左下、左上、右上、右下）。
					// 以上一个三角形的第三条边+下一个点为基础，按照和第三条边相反的顺序，绘制三角形
					groupCount += 6;
				}
			}

			scope.addGroup( groupStart, groupCount, materialIndex );

			groupStart += groupCount;
			// scope.addGroup( groupStart, groupCount, materialIndex );
			// 每次循环都会向 indices 数组中添加新的索引（表示三角形顶点顺序）。
			// 同时变量 groupCount 累加了当前这个网格单元所需的索引数量（每次加6，即两个三角形 × 3个顶点）。
			// 最终调用 addGroup() 把这一部分几何体作为一个渲染组提交给 Three.js 的几何体对象。
			// const materials = [
			// 	new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 材质0：红色
			// 	new THREE.MeshBasicMaterial({ color: 0x00ff00 })  // 材质1：绿色
			//   ];
			  
			//   const mesh = new THREE.Mesh(geometry, materials);

			numberOfVertices += vertexCounter;
		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new BoxGeometry( data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments );

	}

}

export { BoxGeometry };
