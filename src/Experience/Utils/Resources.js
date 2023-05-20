import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import EventEmitter from "./EventEmitter";

const stlInfoJson = require("../../../static/STL/stlInfo.json");

export default class Resources extends EventEmitter {
    constructor(sources) {
        super();
        //Options
        this.sources = sources;

        //Setup
        this.stlInfoJson = stlInfoJson;
        this.items = {};
        this.loadedSTLFiles = {};
        this.attemptedLoadingItems = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;
        this.stlLoaded = false;
        this.quietSTLFileLoadOn = false;

        // Set loaders that can be used
        this.setLoaders();
        // Load predefined resources
        this.startLoading();

        // Set an array that contains every single STL model available for download according to the STL info json
        this.getSTLParts();
        this.STLFilesToLoadTotal = this.STLFilesToLoad.length;

        // Set readableNames array from the stl info json
        this.loadReadableNames();

        // Set the guiArray that will help create gui parameter control
        this.loadGUIArray();

        /*
        ************************************************************
        START OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
        ************************************************************
        */

        /*
        Here is a good opportunity to manually modify guiArray for any reason, 
        for example: filter out any values in the guiArray that you don't want to be available in the gui configurator.

        Example use case: 
            You use extra calculation steps to calculate certain parameters that are included in the gui configurator. These calculations
            may reach values out side the range of values you want to keep available to the gui configurator. In other words, you have stl
            models that you don't want the gui configuration parameters to explicitly reach.
        */

        // Example filtering of values higher than 400 for the parameter "lowerSupportHeight" for the part "LowerSupportRod1"
        // (Note: Do not use readable names to access properties in the guiArray)
        // this.guiArray["LowerSupportRod1"]["Round"].parameters["lowerSupportHeight"] = this.guiArray["LowerSupportRod1"][
        //     "Round"
        // ].parameters["lowerSupportHeight"].filter((item) => item <= 400);

        /*
        **********************************************************
        END OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
        **********************************************************
        */
    }

    setLoaders() {
        this.loaders = {};
        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader();
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.loaders.stlLoader = new STLLoader();
    }

    startLoading() {
        //Load textures and cubeTextures
        for (const source of this.sources) {
            if (source.type === "texture") {
                this.loaders.textureLoader.load(source.path, (file) => {
                    this.sourceLoaded(source, file);
                });
            } else if (source.type === "cubeTexture") {
                this.loaders.cubeTextureLoader.load(source.path, (file) => {
                    this.sourceLoaded(source, file);
                });
            }
        }
    }

    loadReadableNames() {
        this.readableNames = {};
        for (const name of Object.keys(this.stlInfoJson.settings.readableNames)) {
            this.readableNames[name] = this.stlInfoJson.settings.readableNames[name];
        }
    }

    loadGUIArray() {
        // Initialize the guiArray that will help define the gui controls
        this.guiSetup = {};
        for (const basePartKey of Object.keys(this.stlInfoJson.parts)) {
            this.guiSetup[basePartKey] = {};
            for (const basePartTypeKey of Object.keys(this.stlInfoJson.parts[basePartKey])) {
                // initialize objects and arrays that will be used
                this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]] = {};
                this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].GUIControlParameters = [];
                this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].GUIControlSlidingParameters = {};
                this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].parameters = {};

                // Add all of the GUIControlParameters for each basePartType to an array. This is mostly a symbolic array of which parameters should be included in the gui controls for each basePartType.
                for (const guiControlParameter of this.stlInfoJson.parts[basePartKey][basePartTypeKey][0].GUIControlParameters) {
                    this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].GUIControlParameters.push(
                        guiControlParameter
                    );
                }

                // Add the GUIControlSlidingParameters as they are stored in the json. each GUIControlSlidingParameter contains information about min, max and default value.
                for (const guiControlSlidingParameterKey of Object.keys(
                    this.stlInfoJson.parts[basePartKey][basePartTypeKey][0].GUIControlSlidingParameters
                )) {
                    this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].GUIControlSlidingParameters[
                        guiControlSlidingParameterKey
                    ] =
                        this.stlInfoJson.parts[basePartKey][basePartTypeKey][0].GUIControlSlidingParameters[
                            guiControlSlidingParameterKey
                        ];
                }

                // Loop through all parameters of each part in order to store all of the different values each value can assume
                for (const parameterKey of Object.keys(this.stlInfoJson.parts[basePartKey][basePartTypeKey][0].parameters)) {
                    this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].parameters[parameterKey] = [];
                    let tempArray = [];
                    // Save all values of a single parameter for each configuration inside a temporary array (This will include a lot of duplicates)
                    for (const basePartTypeSTL in this.stlInfoJson.parts[basePartKey][basePartTypeKey]) {
                        tempArray.push(
                            this.stlInfoJson.parts[basePartKey][basePartTypeKey][basePartTypeSTL].parameters[parameterKey]
                        );
                    }
                    // Filter out all of the duplicates
                    this.guiSetup[basePartKey][this.readableNames[basePartTypeKey]].parameters[parameterKey] = tempArray.filter(
                        (value, index, array) => array.indexOf(value) === index
                    );
                }
            }
        }
        console.log(this.guiSetup);
    }

    // Defines an array that contains all stl file locations for every part available according to the stl info json
    getSTLParts() {
        this.STLFilesToLoad = [];
        for (const basePartKey of Object.keys(this.stlInfoJson.parts)) {
            for (const basePartTypeKey of Object.keys(this.stlInfoJson.parts[basePartKey])) {
                for (const basePartTypeSTL of this.stlInfoJson.parts[basePartKey][basePartTypeKey]) {
                    if (basePartTypeSTL.path != undefined) {
                        this.STLFilesToLoad.push(basePartTypeSTL);
                    }
                }
            }
        }
    }

    // Defines a function called by the setGeometry function inside STLPart.js to load an STL model in case the configuration parameters demands it and it hasn't been loaded yet.
    async loadSTLFileAsync(source) {
        if (!Object.keys(this.attemptedLoadingItems).includes(source.name)) {
            this.attemptedLoadingItems[source.name] = "attempted";
            let stlFilePromise = this.loaders.stlLoader.loadAsync(source.path);

            stlFilePromise.then(
                (value) => {
                    if (!Object.keys(this.loadedSTLFiles).includes(source.name)) {
                        this.loadedSTLFiles[source.name] = value;
                        this.items[source.name] = value;
                        this.trigger("updateProduct");
                        this.trigger("updateProgress");
                        console.log("loaded: " + source.name);
                    }
                },
                (reason) => {
                    console.log(reason);
                    throw new Error("Could not load " + source.name);
                }
            );
        }
    }

    // Defines a function that quietly loads all of the stl models to load in the STLFilesToLoad as long as the setting to do so is set to true ("this.quietSTLFileLoadOn")
    async quietSTLFileLoad() {
        if (!this.quietSTLFileLoadOn) {
            return;
        }
        let source = this.STLFilesToLoad.shift();
        if (source != undefined) {
            let stlFilePromise = this.loaders.stlLoader.loadAsync(source.path);
            stlFilePromise.then(
                (value) => {
                    if (!Object.keys(this.loadedSTLFiles).includes(source.name)) {
                        this.loadedSTLFiles[source.name] = value;
                        this.items[source.name] = value;
                        console.log("loaded: " + source.name);
                    }
                    this.trigger("updateProgress");
                    this.quietSTLFileLoad();
                },
                (reason) => {
                    console.log(reason);
                    throw new Error("Could not load " + source.name);
                }
            );
        }
    }

    // Defines the function that triggers the setup of the environment and initial build of the product as defined by constructor of World.js
    sourceLoaded(source, file) {
        this.items[source.name] = file;
        this.loaded++;
        if (this.loaded === this.toLoad) {
            // console.log("Finished!");
            this.trigger("ready");
        }
    }
}
