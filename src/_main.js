import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
const controls = new OrbitControls( camera, renderer.domElement );

var uvs = [];


function getMeshFromObjData() {
	const obj_loader = new OBJLoader();
	obj_loader.load("assets/obj/wall_0.obj", (obj) => {
		scene.add(obj)
	});
	
}
getMeshFromObjData();

function getFloorVertices(x, y) {
	var planeVertices = [
		0.0, -1.0, 1.0, // v0
		1.0, -1.0, 1.0, // v1
		1.0, -1.0, 0.0, // v2
		1.0, -1.0, 0.0, // v3
		0.0, -1.0, 0.0, // v4
		0.0, -1.0, 1.0  // v5
	];

	for(var i = 0; i < planeVertices.length; i++)
	{
		//console.log(i, (i+1) % 3 == 0)
		if((i+1) % 3 == 0)
		{
			planeVertices[i] += x;
			planeVertices[i - 2] += y;
		}
	}

	uvs = uvs.concat([
		0,0,
		1,0,
		1,1,
		1,1,
		0,1,
		0,0
	]);

	return planeVertices;
}

function getWallVertices(x, y) {
	var planeVertices = [
		0.0, 0.0,  0.0, // v0
		1.0, 0.0,  0.0, // v1
		1.0, 1.0,  0.0, // v2
		1.0,  1.0,  0.0, // v3
		0.0,  1.0,  0.0, // v4
		0.0,  0.0,  0.0  // v5
	];

	for(var i = 0; i < planeVertices.length; i++)
	{
		//console.log(i, (i+1) % 3 == 0)
		if((i+1) % 3 == 0)
		{
			planeVertices[i - 2] += x;
			planeVertices[i - 1] -= 1;
			planeVertices[i] += y ;
		}
	}

	uvs = uvs.concat([
		0,0,
		0,0,
		0,1,
		0,1,
		0,1,
		0,0
	]);

	return planeVertices;
}

var gridVertices = [];
var size = 32;
console.log(size);
for(var i = 0; i < size; i++)
{
	for(var j = 0; j < size; j++)
	{
		gridVertices = gridVertices.concat(getFloorVertices(i, j));

		if(Math.random() < 1.1)
		{
			gridVertices = gridVertices.concat(getWallVertices(i, j));
		}
	}
}

const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
	0.0, 0.0,  1.0, // v0
	1.0, 0.0,  1.0, // v1
	1.0, 1.0,  1.0, // v2

	1.0,  1.0,  1.0, // v3
    0.0,  1.0,  1.0, // v4
    0.0,  0.0,  1.0  // v5
]);

// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(gridVertices), 3 ) );



geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))

const texture = new THREE.TextureLoader().load( "assets/desert1.png" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 1, 1 );
texture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texture, side: THREE.DoubleSide} );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

camera.position.z = 5;
//camera.position.y = 2;
camera.rotation.y = -Math.PI/2;

function animate() {

	renderer.render( scene, camera );

}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}