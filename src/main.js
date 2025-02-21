import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

import { MapBuilder } from "/src/map_builder.js";
import { LayerData } from "./layer_data.js";


import Game from "./game.js";


const scene = new THREE.Scene();

var mapData = new LayerData(scene, 32*1);
mapData.init();

console.log(Game);

var mousedown = false;
var size = 64;

var mapTable = document.getElementById("mapTable");

function onClicked(x, y) {
	if(drawElementType == "wall") {
		
	}
	
	//mapData.buildLayerWallGeometry(Game.models[0].scene.children[0]);
	mapData.buildMap();
	// var item = models[0].scene.children[0];
	// var wall_geometry = mapData.buildLayerWallGeometry(item);
	
	// if(wall_geometry != null) {
	// 	var mesh = new THREE.Mesh(wall_geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side:THREE.DoubleSide, map:wall_texture }));
	// 	mapData.walls = scene.add(mesh);
	// }
}

function updateInfoPanel(data) {
	var infoPanel = document.getElementById("infoPanelCoords");
	infoPanel.innerHTML = "";

	if(data["type"] == "mapCell") {
		infoPanel.innerHTML = `${data["x"]}/${data["y"]}`
	}
}

function setFloor(x, y, floor) {
	var mapCell = document.getElementById(`mapCell:${x}:${y}`);

	if(floor == 0) {
		mapCell.style.background = ""
		mapData.data[mapData.getIndex(x, y)]["floor"] = 0;
	} else {
		mapCell.style.background = "gray"
		mapData.data[mapData.getIndex(x, y)]["floor"] = floor;
	}
}

function getWall(x, y, side) {
	if(side == "east") {
		side = 0;
	} else if(side == "south") {
		side = 1;
	} else if(side == "west") {
		side = 2;
	} else if(side == "north") {
		side = 3;
	}
	return mapData.data[mapData.getIndex(x, y)]["walls"][side];
}

function setWall(x, y, side, wall) {
	var mapCell = document.getElementById(`mapCell:${x}:${y}`);
	if(mapCell == undefined) return;

	var borderColor = (wall == 1 ? "rgb(0,0,0)" : "")
	if(side == "east") {
		mapCell.style.borderLeftColor = borderColor;
		side = 0;
	} else if(side == "south") {
		mapCell.style.borderBottomColor = borderColor;
		side = 1;
	} else if(side == "west") {
		mapCell.style.borderRightColor = borderColor;
		side = 2;
	} else if(side == "north") {
		mapCell.style.borderTopColor = borderColor;
		side = 3;
	}
	mapData.data[mapData.getIndex(x, y)]["walls"][side] = wall;
	
}

function removeBuildingWalls(x, y) {
	if(!mapData.isInterior(x, y)) {
		return;
	}
	setBuildingWalls(x, y, 0);
	mapData.getCell(x, y)["interior"] = 0;
}

var selectedWallType = 1;

function setBuildingWalls(x, y, type) {
	if(mapData.isInterior(x, y) && type > 0) {
		return;
	}
	
	if(x == mapData.size - 1 || mapData.data[mapData.getIndex(x+1, y)]["walls"][0] > 0) {
		setWall(x, y, "west", (x == mapData.size - 1 ? type : 0));
		setWall(x+1, y, "east", 0);		
	} else {
		if(type == 0 && mapData.isInterior(x, y)) {
			setWall(x, y, "west", selectedWallType);
			setWall(x+1, y, "east", selectedWallType);
		} else {
			setWall(x, y, "west", type);
			setWall(x+1, y, "east", type);
		}
	}

	if(x == 0 || mapData.data[mapData.getIndex(x-1, y)]["walls"][2] > 0) {
		setWall(x, y, "east", (x == 0 ? type : 0));
		setWall(x-1, y, "west", 0);
	} else {
		if(type == 0 && mapData.isInterior(x, y)) {
			setWall(x, y, "east", selectedWallType);
			setWall(x-1, y, "west", selectedWallType);
		} else {
			setWall(x, y, "east", type);
			setWall(x-1, y, "west", type);
		}
	}
	
	if(y == 0 || mapData.data[mapData.getIndex(x, y-1)]["walls"][1] > 0) {
		setWall(x, y, "north", (y == 0 ? type : 0));
		setWall(x, y-1, "south", 0);
	} else {
		if(type == 0 && mapData.isInterior(x, y)) {
			setWall(x, y, "north", selectedWallType);
			setWall(x, y-1, "south", selectedWallType);
		} else {
			setWall(x, y, "north", type);
			setWall(x, y-1, "south", type);
		}
	}
	
	if(y == mapData.size - 1 || mapData.data[mapData.getIndex(x, y+1)]["walls"][3] > 0) {
		setWall(x, y, "south", (y == mapData.size - 1 ? type : 0));
		setWall(x, y+1, "north", 0);
	} else {
		if(type == 0 && mapData.isInterior(x, y)) {
			setWall(x, y, "south", selectedWallType);
			setWall(x, y+1, "north", selectedWallType);
		} else {
			setWall(x, y, "south", type);
			setWall(x, y+1, "north", type);
		}
	}
	
	mapData.getCell(x, y)["interior"] = (type > 0 ? true : false);
}

function onMapCellMouseDown(x, y, event) {
	if(drawElementType == "wall") {
		if(event.button == 0) {
			setBuildingWalls(x, y, 1);
		} else {
			removeBuildingWalls(x, y);
		}
	} else if(drawElementType == "floor") {
		setFloor(x, y, (event.button == 0 ? 1 : 0));
	} else if(drawElementType == "door") {
		setFloor(x, y, (event.button == 0 ? 2 : 0));
	} else if(drawElementType == "tree") {
		setTree(x, y, (event.button == 0 ? 1 : 0));
	}
	mapData.buildMap();
}

function onMapCellMouseOver(x, y, event) {
	var mapCell = document.getElementById(`mapCell:${x}:${y}`);
	updateInfoPanel({
		"type": "mapCell",
		"x": x,
		"y": y
	});
	if(mapCell.style.background == ""){
		mapCell.style.background = "rgba(1,1,1,0.03)";
	}

	if(button_index != -1) {
		onMapCellMouseDown(x, y, {button: button_index})
	}
}

for(var y = 0; y < mapData.size; y++) {
	var row = document.createElement("tr");
	row.setAttribute("class", "mapRow");
	mapTable.getElementsByTagName("tbody")[0].append(row);

	for(var x = 0; x < mapData.size; x++) {
		let elem = document.createElement("td");
		elem.textContent = " ";
		elem.setAttribute("id", `mapCell:${x}:${y}`)
		elem.setAttribute("class", "mapCell");

		elem.addEventListener("mouseover", onMapCellMouseOver.bind(this, x, y));

		elem.addEventListener("mouseleave", () => {
			//console.log(elem.style.background);
			if(elem.style.background == "rgba(1, 1, 1, 0.03)"){
				elem.style.background = "";
			}
		});
		
		var cell_x = x;
		var cell_y = y;

		elem.addEventListener("mousedown", onMapCellMouseDown.bind(this, x, y));
			// (event) => {
			// if(drawElementType == "wall") {
			// 	if(event.button == 0) {
			// 		console.log(cell_x, cell_y);
			// 		setBuildingWalls(cell_x, cell_y);
			// 		//elem.style.borderColor = "rgb(0,0,0)"
				
			// 		// mapData.data[mapData.getIndex(y, x)]["walls"] = [
			// 		// 	1, 
			// 		// 	1, 
			// 		// 	1, 
			// 		// 	(mapData.data[mapData.getIndex(y, x-1)]["walls"][1] == 0 ? 1 : 0)
			// 		// ];

			// 		// mapData.data[mapData.getIndex(y, x-1)]["walls"][1] = mapData.data[mapData.getIndex(y, x-1)]["walls"][1] == 0 ? 1 : 0;
			// 		// mapData.data[mapData.getIndex(y, x+1)]["walls"][3] = 1;
			// 		// mapData.data[mapData.getIndex(y+1, x)]["walls"][0] = 1;
			// 		// mapData.data[mapData.getIndex(y-1, x)]["walls"][2] = 1;
			// 	} else if(event.button == 2) {
			// 		elem.style.borderColor = ""

			// 		mapData.data[mapData.getIndex(y, x)]["walls"] = [0,0,0,0];
			// 	}
			// } else if (drawElementType == "floor") {
			// 	if(event.button == 0) {
			// 		elem.style.background = "gray"

			// 		mapData.data[mapData.getIndex(y, x)]["floor"] = 1;
			// 	} else if(event.button == 2) {
			// 		elem.style.background = ""

			// 		mapData.data[mapData.getIndex(y, x)]["floor"] = 0;
			// 	}
			// }
			
			
		//});

		row.appendChild(elem)
	}
}

		// var onClicked = (e, button) => {
		// 	if(button == 2)
		// 	{
		// 		//mapData.data[mapData.getIndex(i, j)] = 0;
				
		// 		e.style.borderRightColor = "";
		// 		e.style.borderBottomColor = "";
		// 		e.style.borderTopColor = "";
		// 		e.style.borderLeftColor = "";
		// 	}
		// 	else if(button == 0) {
		// 		console.log(i, j, mapData.getIndex(j, i));
		// 		mapData.data[mapData.getIndex(j, i)] = 1;

		// 		var item = models[0].scene.children[0];
		// 		var wall_geometry = mapData.buildLayerWallGeometry(item);
		// 		//console.log(wall_geometry);
		// 		if(wall_geometry != null) {
		// 			var mesh = new THREE.Mesh(wall_geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side:THREE.DoubleSide, map:wall_texture }));
		// 			mapData.walls = scene.add(mesh);
		// 		}

		// 		e.style.borderRightColor = "black";
		// 		e.style.borderBottomColor = "black";
		// 		e.style.borderTopColor = "black";
		// 		e.style.borderLeftColor = "black";
		// 	}
			
		// };

var button_index = -1;
document.addEventListener("mousedown", (e) => {
	button_index = e.button;
});
document.addEventListener("mouseup", (e) => {
	button_index = -1;
});

document.getElementById("mapTable").addEventListener('contextmenu', event => event.preventDefault());


const container = document.getElementById("canvas");

var stats = new Stats();
stats.domElement.style.position = "absolute";
stats.domElement.style.top = "9px";
stats.domElement.style.left = "9px";

document.getElementById("worldView").appendChild(stats.domElement);

//const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 10000 );

scene.background = new THREE.Color(0.2, 0.6, 1.0)



const renderer = new THREE.WebGLRenderer();
//renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( container.clientWidth, container.clientHeight);
renderer.setAnimationLoop( animate );

container.appendChild( renderer.domElement );

const loader = new GLTFLoader();
const controls = new OrbitControls( camera, renderer.domElement );

var textures = {}

function loadTexture(url, name) {
	const tex = new THREE.TextureLoader().load( url);
	tex.wrapS = THREE.RepeatWrapping;
	tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set( 1, 1 );
	tex.colorSpace = THREE.SRGBColorSpace;

	Game.textures[name] = tex;
}

async function loadModel(url, name) {
	var model = await Promise.all([loader.loadAsync(url)]);
	Game.models[name] = model[0];
}

async function loadModels() {
	await loadModel("/3dmapeditor/assets/wall_0.glb", "wall1");
	await loadModel("/3dmapeditor/assets/floor.glb", "floor1");
	await loadModel("/3dmapeditor/assets/palm_tree.glb", "palm_tree");
}

loadTexture("/3dmapeditor/assets/desert1.png", "desert1");
loadTexture("/3dmapeditor/assets/wall1.png", "wall1");
loadTexture("/3dmapeditor/assets/pathtex1.png", "path1");
//wall_texture.minFilter = THREE.LinearFilter;
//wall_texture.magFilter = THREE.LinearFilter;





// Game.models = await Promise.all([
// 	loader.loadAsync("assets/wall_0.glb"),
// 	loader.loadAsync("assets/floor.glb"),
// 	loader.loadAsync("assets/palm_tree.glb")
// ]);


function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}


for(var x = 0; x < mapData.size; x++) {
	for(var y = 0; y < mapData.size; y++) {
		//setBuildingWalls(x, y);
		//setFloor(x, y, 1)
	}
}

var iterations = 50000;
var x = mapData.size/2;
var y = mapData.size/2;
for(var i = 0; i < iterations; i++){
	if(getRandomInt(0, 1) == 0) {
		x += -1 + (getRandomInt(0, 1) * 2);
		if(x == mapData.size) {
			x -= 1;
		}
		if(x == 0) {
			x += 1;
		}
	} else {
		y += -1 + (getRandomInt(0, 1) * 2);
		if(y == mapData.size) {
			y -= 1;
		}
		if(y == 0) {
			y += 1;
		}
	}

	//setBuildingWalls(x, y, 1);
	//setFloor(x, y, 2)

	//mapData.data[mapData.getIndex(x, y)]["walls"] = [1,1,1,1];
	
	//setFloor(x, y, mapData.data[mapData.getIndex(x, y)]["floor"] == 0 ? 1 : 0)
	
	//mapData[mapData.getIndex(x, y)]["floor"] = 1;
}
var tree = "";
loadModels().then(() =>{
		

		tree = Game.models["palm_tree"].scene.children[0].clone();
		var tree_material1 = new THREE.MeshBasicMaterial( { color: 0xffffff, side:THREE.DoubleSide, map:tree.children[0].material.map, transparent:true, depthWrite:false} );
		var tree_material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, side:THREE.DoubleSide, map:tree.children[1].material.map} );

		tree.children[0].material = tree_material1;
		tree.children[1].material = tree_material2;

		mapData.buildMap();
	}
)


//item.material = new THREE.MeshBasicMaterial( { color: 0xffffff, side:THREE.DoubleSide, map:ground_texture } );

function setTree(x, y, id) {
	//console.log(renderer.info);
	//return
	var mapCell = document.getElementById(`mapCell:${x}:${y}`);
	if(mapData.getCell(x, y)["object"] != undefined) {
		for(var i = 0; i < 2; i++) {
			console.log(mapData.getCell(x, y)["object"]["children"]);
			mapData.getCell(x, y)["object"]["children"][i].geometry.dispose();
			mapData.getCell(x, y)["object"]["children"][i].material.dispose();
		}
		
		scene.remove(mapData.getCell(x, y)["object"]);
		mapCell.innerHTML = ""
	}

	if(id == 0) {
		return;
	}
	mapCell.innerHTML = "7"

	var new_tree = tree.clone();
	new_tree.position.x = x;
	new_tree.position.z = y;
	new_tree.scale.set(0.5, 0.5, 0.5);
	new_tree.rotation.y = getRandomInt(0, 360) / (Math.PI / 2)
	scene.add(new_tree);
	mapData.getCell(x, y)["object"] = new_tree;
}

for(var x = 0; x < mapData.size; x++) {
	for(var y = 0; y < mapData.size; y++) {
		if(getRandomInt(0, 16) == 0) {
			//setTree(x, y, 1)
		}
	}
}

camera.position.x = mapData.size / 2;
camera.position.z = mapData.size;
camera.position.y = 10;
//camera.rotation.y = -Math.PI/2;
controls.target.set(mapData.size/2, 0, mapData.size/2);
controls.update();

function animate() {


	renderer.render( scene, camera );
	stats.update();
	// setTimeout(() => {
	// 	requestAnimationFrame(animate)
	// }, 1000 / 30);
}
//animate()

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.clientWidth, container.clientHeight );

}

var drawElementType = "wall"
var drawElements = {
	"wall": document.getElementById("mapButtonWall"),
	"floor": document.getElementById("mapButtonFloor"),
	"door": document.getElementById("mapButtonDoor"),
	"tree": document.getElementById("mapButtonTree"),
}

function setActiveTool(name) {
	Object.keys(drawElements).forEach((k) => {
		if(k == name) {
			drawElements[k].classList.toggle("active");
		}
	});
	drawElementType = name;
}

Object.keys(drawElements).forEach((k) => {
	let element = drawElements[k]
	console.log(element);
	element.addEventListener("click", () => {
		Object.keys(drawElements).forEach((k1) => {
			drawElements[k1].classList.remove("active");
		});

		setActiveTool(k);
	});
});

// var mapButtons = document.getElementsByClassName("mapButton");
// for(var i = 0; i < drawElements.length; i++) {
// 	let mapButton = drawElements[i];
// 	mapButton.addEventListener("click", (e) => {
// 		for(var j = 0; j < mapButtons.length; j++) {
// 			mapButtons[j].classList.remove("active");
// 		}
// 		mapButton.classList.toggle("active");
// 	});
// }
