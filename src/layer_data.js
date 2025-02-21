import * as THREE from 'three';
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";

import Game from "./game.js";
import { Utils } from "./utils.js";



export class LayerData {

	constructor(scene, size) {
		this.scene = scene;
		this.size = size;
		this.data = [];
		this.floor_materials = [];
		this.wall_materials = [];
	}

	getIndex(x, y) {
		return (this.size * y) + x;
	}

	getCell(x, y) {
		return this.data[this.getIndex(x, y)];
	}

	isInterior(x, y) {
		return this.getCell(x, y)["interior"];
	}

	init() {
		for(var x = 0; x < this.size; x++) {
			for(var y = 0; y < this.size; y++) {
				this.data[this.getIndex(x, y)] = {
					walls:[0,0,0,0],
					floor:0,
					interior: false
				};
			}
		}
	}

	buildMap() {
		console.log("buildMap")
		
		
		var wall_geometry = this.buildLayerWallGeometry(Game.models["wall1"].scene.children[0]);
		if(this.walls != undefined) {
			this.walls.geometry.dispose();
			this.walls.material.dispose();
			//this.walls.dispose();
			this.scene.remove(this.walls);
		}

		
		if(wall_geometry != null) {
			
			if(this.wall_materials[0] == undefined) {
				this.wall_materials[0] = new THREE.MeshBasicMaterial({ color: 0xffffff, side:THREE.FrontSide, map:Game.textures["wall1"] });
			}
			var mesh = new THREE.Mesh(wall_geometry, this.wall_materials[0]);
			wall_geometry.dispose();
			this.walls = mesh;
			this.scene.add(mesh);
		}
		
		for(var i = 0; i < 3; i++) {
			if(this.floors == undefined) {
				this.floors = [];
			} else if(this.floors[i] != undefined) {
				var _floor = this.floors[i];
				this.scene.remove(_floor);
				_floor.geometry.dispose();
				_floor.material.dispose();
				
			}
			
			var floor_geometry = this.buildLayerFloorGeometry(Game.models["floor1"].scene.children[0], i);
			if(floor_geometry != null) {
				var textureNames = [
					"desert1",
					"wall1",
					"path1"
				];
				
				var textureName = textureNames[i];//i == 1 ? "desert1" : "wall1";
				if(this.floor_materials[i] == null) {
					this.floor_materials[i] = new THREE.MeshBasicMaterial( { color: 0xffffff, side:THREE.DoubleSide, map:Game.textures[textureName] } );
				}
				var mesh = new THREE.Mesh(floor_geometry,  this.floor_materials[i]);
				floor_geometry.dispose();
				this.floors[i] = mesh;
				this.scene.add(mesh)
			}
		}
	}

	buildLayerWallGeometry(wall) {
		
		var wall_geometries = [];
		for(var x = 0; x < this.size; x++) {
			for(var y = 0; y < this.size; y++) {
				var index = this.getIndex(x, y);
				var sides = this.data[index]["walls"]; //[0,0,0,0];
				var matrix = wall.matrixWorld;
				
				for(var z = 0; z < 1; z++) {
					
					//if(this.data[index + 1] == 1 && this.data[index + 1] != this.data[index]) sides[2] = 1; //1
					//if(this.data[index - 1] == 1 && this.data[index - 1] != this.data[index]) sides[0] = 1; //3
					//if(this.data[index + this.size] == 1 && this.data[index + this.size] != this.data[index]) sides[1] = 1; //2
					//if(this.data[index - this.size] == 1 && this.data[index - this.size] != this.data[index]) sides[3] = 1; //0
		
					sides.forEach((k, v) => {
						if(k == 1) {
							wall_geometries.push(wall.geometry.clone().applyMatrix4(matrix).rotateY((Math.PI / 2) * v).translate(x, z, y))
						}
					});
				}
			}
		}

		if(wall_geometries.length > 0) {
			var wall_geometry = BufferGeometryUtils.mergeGeometries(wall_geometries);
			return wall_geometry;
		}

		return null;
	}

	buildLayerFloorGeometry(floor, id) {
		var floor_geometries = [];
		for(var x = 0; x < this.size; x++) {
			for(var y = 0; y < this.size; y++) {
				if(this.data[this.getIndex(x, y)]["floor"] == id) {
					var matrix = floor.matrixWorld;
					floor_geometries.push(floor.geometry.clone().applyMatrix4(matrix).translate(x, 0, y))
				}
			}
		}

		if(floor_geometries.length > 0) {
			return BufferGeometryUtils.mergeGeometries(floor_geometries);
		}

		return null;
	}
	

}