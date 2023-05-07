import * as THREE from "three";
import Experience from "../Experience";

/*
********************************************
No change is needed in this class definition
********************************************
*/

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.setSunLight();
        this.setEnvironmentMap();
    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight("#ffffff", 4);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.far = 1000;
        this.sunLight.shadow.mapSize.set(2048 * 4, 2048 * 4);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.shadow.radius = 1;
        this.sunLight.position.set(300, 300, 200);
        this.sunLight.lookAt(0, 0, 0);
        this.sunLight.shadow.camera.top = 2000;
        this.sunLight.shadow.camera.bottom = -2000;
        this.sunLight.shadow.camera.left = -2000;
        this.sunLight.shadow.camera.right = 2000;
        this.scene.add(this.sunLight);

        //this.shadowHelper = new THREE.CameraHelper( this.sunLight.shadow.camera );
        //this.scene.add( this.shadowHelper );
    }

    setEnvironmentMap() {
        this.environmentMap = {};
        this.environmentMap.intensity = 0.4;
        this.environmentMap.texture = this.resources.items.environmentMapTexture;
        this.environmentMap.texture.encoding = THREE.sRGBEncoding;

        this.scene.environment = this.environmentMap.texture;

        this.setEnvironmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMap = this.environmentMap.texture;
                    child.material.envMapIntensity = this.environmentMap.intensity;
                    child.material.needsUpdate = true;
                }
            });
        };
        this.setEnvironmentMap.updateMaterials();
    }
}
