import * as THREE from "three";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import GUI from "./Utils/GUI";
import sources from "./sources";
import ResourceProgress from "./Utils/ResourceProgress";

/*
********************************************
No change is needed in this class definition
********************************************
*/

let instance = null;

export default class Experience {
    constructor(document) {
        //Singleton
        if (instance) {
            return instance;
        }
        instance = this;

        //Options
        this.canvas = document.querySelector("canvas.webgl");
        this.document = document;

        //Setup
        this.meshes = [];

        this.GUI = new GUI();
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.resources = new Resources(sources);
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.world = new World();
        this.resourceProgressBar = new ResourceProgress(document);

        //Sizes resize event
        this.sizes.on("resize", () => {
            this.resize();
        });

        //time tick event
        this.time.on("tick", () => {
            this.update();
        });

        this.resourceProgressBar.button.addEventListener("click", () => {
            if (!this.resources.quietSTLFileLoadOn) {
                this.resources.quietSTLFileLoadOn = true;
                this.resources.quietSTLFileLoad();
            } else {
                this.resources.quietSTLFileLoadOn = false;
            }
        });
    }

    createNewGUI() {
        this.GUI.ui.close();
        this.GUI = new GUI();
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        this.camera.update();
        this.renderer.update();
    }
}
