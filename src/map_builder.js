import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';


export class MapBuilder {

	static {
		this.obj_loader = new OBJLoader();
		this.material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: MapBuilder.getTexture("desert1"), side: THREE.DoubleSide} );
	}


	static buildScene(scene) {
		this.obj_loader.load("assets/obj/wall_0.obj", (obj) => {
			obj.setAttribute("texture", this.getTexture("desert1"))
			scene.add(obj);
		});
	}

	static getTexture(name) {
		const texture = new THREE.TextureLoader().load(`assets/${name}.png`);
		
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		texture.colorSpace = THREE.SRGBColorSpace;

		return texture;
	}
}