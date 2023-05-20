import * as THREE from "three";
import Experience from "../Experience";
import Product from "./Product";
import Environment from "./Environment";
import Floor from "./Floor";

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.meshes = this.experience.meshes;
        this.scene.background = new THREE.Color("#f9f1f1");

        this.resources = this.experience.resources;
        this.readableNames = this.resources.readableNames;
        this.resourceProgressBar = this.experience.resourceProgressBar;

        // Initialize objects that will be used
        this.GUITypes = {};
        this.types = {};
        this.parameters = {};

        /*
        ************************************************************
        START OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
        ************************************************************
        */

        // Set which models should not get a GUI folder (Do NOT use the readable names)
        this.GUIFoldersExclude = ["LowerSupportRod2"];
        // Set which parameters that should not be included for GUI control (Do USE the readable names)
        this.GUIParametersExclude = ["Upper Axle Diameter"];

        // Set initial scale and the scale limits
        this.scale = 0.6;
        this.scaleLimits = {
            min: 0.01,
            max: 2,
        };

        /*
        **********************************************************
        END OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
        **********************************************************
        */

        // Infer the initial values for GUITypes, types and parameters from the guiSetup
        const guiSetup = this.resources.guiSetup;
        for (const basePartKey of Object.keys(guiSetup)) {
            if (!this.GUIFoldersExclude.includes(basePartKey)) {
                // Keys of the GUITypes are the readable names for the base parts, and the values are the same but with the added " Type". The main purpose for GUITypes is to act as the identifier of the current type of base part in use.
                this.GUITypes[this.readableNames[basePartKey]] = this.readableNames[basePartKey] + " Type";
                // Types represent the current type in use for each base part.
                this.types[this.readableNames[basePartKey] + " Type"] = Object.keys(guiSetup[basePartKey])[0];

                // Selects the first possible value available for each parameter
                for (const parameter of Object.keys(guiSetup[basePartKey][Object.keys(guiSetup[basePartKey])[0]].parameters)) {
                    if (!(this.readableNames[parameter] in this.parameters)) {
                        this.parameters[this.readableNames[parameter]] =
                            guiSetup[basePartKey][Object.keys(guiSetup[basePartKey])[0]].parameters[parameter][0];
                    }
                }

                // Selects the .default value for each GUIControlSlidingParameter
                for (const parameter of Object.keys(
                    guiSetup[basePartKey][Object.keys(guiSetup[basePartKey])[0]].GUIControlSlidingParameters
                )) {
                    if (!(this.readableNames[parameter] in this.parameters)) {
                        this.parameters[this.readableNames[parameter]] =
                            guiSetup[basePartKey][Object.keys(guiSetup[basePartKey])[0]].GUIControlSlidingParameters[
                                parameter
                            ].default;
                    }
                }
            }
        }

        // Create the gui control
        this.createSliderGUI();

        // Wait for resources
        this.resources.on("ready", () => {
            //Setup
            this.floor = new Floor();
            this.buildProduct();

            this.environment = new Environment();
        });

        // Rebuild product whenever called. Used to update product when stl loads
        this.resources.on("updateProduct", () => {
            this.product.destroy();
            this.buildProduct();
        });

        // Update the progress when triggered by any loading of stl models
        this.resources.on("updateProgress", () => {
            const currProgress = (Object.keys(this.resources.loadedSTLFiles).length / this.resources.STLFilesToLoadTotal) * 100;
            this.experience.resourceProgressBar.updateProgress(currProgress);
            this.experience.resourceProgressBar.updateTextNode(
                Object.keys(this.resources.loadedSTLFiles).length + "/" + this.resources.STLFilesToLoadTotal
            );
        });
    }

    // Create the slider gui control based on the guiSetup
    createSliderGUI() {
        this.experience.createNewGUI();
        this.GUI = this.experience.GUI;

        if (this.GUI.active) {
            this.addGUISettingFolder("Slider");

            const guiSetup = this.resources.guiSetup;
            for (const basePartKey of Object.keys(guiSetup)) {
                if (!this.GUIFoldersExclude.includes(basePartKey)) {
                    this["GUIFolder" + basePartKey] = this.GUI.ui.addFolder(this.readableNames[basePartKey]);
                    for (const parameterKey of Object.keys(
                        guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters
                    )) {
                        if (
                            guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                parameterKey
                            ].length > 1 &&
                            !this.GUIParametersExclude.includes(this.readableNames[parameterKey]) &&
                            guiSetup[basePartKey][
                                this.types[this.GUITypes[this.readableNames[basePartKey]]]
                            ].GUIControlParameters.includes(parameterKey)
                        ) {
                            console.log(
                                basePartKey +
                                    " : " +
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ][0] +
                                    " - " +
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ][
                                        guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]]
                                            .parameters[parameterKey].length - 1
                                    ]
                            );
                            console.log(
                                guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                    parameterKey
                                ][1] -
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ][0]
                            );
                            this["GUIFolder" + basePartKey]
                                .add(
                                    this.parameters,
                                    this.readableNames[parameterKey],
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ][0],
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ][
                                        guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]]
                                            .parameters[parameterKey].length - 1
                                    ],
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ][1] -
                                        guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]]
                                            .parameters[parameterKey][0]
                                )
                                .onFinishChange(() => {
                                    this.product.destroy();
                                    this.buildProduct();
                                });
                        }
                    }

                    this.addSliderParameter(basePartKey, guiSetup);

                    if (Object.keys(guiSetup[basePartKey]).length > 1) {
                        this["GUIFolder" + basePartKey].add(
                            this.types,
                            this.GUITypes[this.readableNames[basePartKey]],
                            Object.keys(guiSetup[basePartKey])
                        );
                        this["GUIFolder" + basePartKey].controllers[
                            this["GUIFolder" + basePartKey].controllers.length - 1
                        ].onChange(() => {
                            let currIndex = 0;
                            for (const basePartTypeKey of Object.keys(guiSetup[basePartKey])) {
                                if (
                                    this["GUIFolder" + basePartKey].controllers[
                                        this["GUIFolder" + basePartKey].controllers.length - 1
                                    ].$select.options.selectedIndex == currIndex
                                ) {
                                    this.types[this.GUITypes[this.readableNames[basePartKey]]] =
                                        this.readableNames[basePartTypeKey];
                                    this.product.destroy();
                                    this.buildProduct();
                                }
                                currIndex++;
                            }
                        });
                    }
                }
            }
        }
    }

    // Create the dropdown gui control based on the guiSetup
    createDropDownGUI() {
        this.experience.createNewGUI();
        this.GUI = this.experience.GUI;

        if (this.GUI.active) {
            this.addGUISettingFolder("Drop Down");

            const guiSetup = this.resources.guiSetup;
            for (const basePartKey of Object.keys(guiSetup)) {
                if (!this.GUIFoldersExclude.includes(basePartKey)) {
                    this["GUIFolder" + basePartKey] = this.GUI.ui.addFolder(this.readableNames[basePartKey]);
                    for (const parameterKey of Object.keys(
                        guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters
                    )) {
                        if (
                            guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                parameterKey
                            ].length > 1 &&
                            !this.GUIParametersExclude.includes(parameterKey) &&
                            guiSetup[basePartKey][
                                this.types[this.GUITypes[this.readableNames[basePartKey]]]
                            ].GUIControlParameters.includes(parameterKey)
                        ) {
                            this["GUIFolder" + basePartKey]
                                .add(
                                    this.parameters,
                                    this.readableNames[parameterKey],
                                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].parameters[
                                        parameterKey
                                    ]
                                )
                                .onFinishChange(() => {
                                    this.product.destroy();
                                    this.buildProduct();
                                });
                        }
                    }

                    this.addSliderParameter(basePartKey, guiSetup);

                    if (Object.keys(guiSetup[basePartKey]).length > 1) {
                        this["GUIFolder" + basePartKey].add(
                            this.types,
                            this.GUITypes[this.readableNames[basePartKey]],
                            Object.keys(guiSetup[basePartKey])
                        );
                        this["GUIFolder" + basePartKey].controllers[
                            this["GUIFolder" + basePartKey].controllers.length - 1
                        ].onChange(() => {
                            let currIndex = 0;
                            for (const basePartTypeKey of Object.keys(guiSetup[basePartKey])) {
                                if (
                                    this["GUIFolder" + basePartKey].controllers[
                                        this["GUIFolder" + basePartKey].controllers.length - 1
                                    ].$select.options.selectedIndex == currIndex
                                ) {
                                    this.types[this.GUITypes[this.readableNames[basePartKey]]] =
                                        this.readableNames[basePartTypeKey];
                                    this.product.destroy();
                                    this.buildProduct();
                                }
                                currIndex++;
                            }
                        });
                    }
                }
            }
        }
    }

    // Defines the function for adding the first settings folder for both the slider and dropdown gui type
    addGUISettingFolder(sliderOrDropDown) {
        this.GUIFolderSettings = this.GUI.ui.addFolder("Settings");
        this.GUIFolderSettings.add({ "GUI Type": sliderOrDropDown }, "GUI Type", ["Slider", "Drop Down"]).onFinishChange(() => {
            if (this.GUIFolderSettings.controllers[0].$select.options.selectedIndex == 0) {
                this.createSliderGUI();
            }
            if (this.GUIFolderSettings.controllers[0].$select.options.selectedIndex == 1) {
                this.createDropDownGUI();
            }
        });

        this.GUIFolderSettings.add(this, "scale", this.scaleLimits.min, this.scaleLimits.max, 0.01).onFinishChange(() => {
            this.product.destroy();
            this.buildProduct();
        });
    }

    // Define that adds the sliding parameters (found in GUIControlSlidingParameters for each part) to the gui
    addSliderParameter(basePartKey, guiSetup) {
        for (const sliderParameter of Object.keys(
            guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].GUIControlSlidingParameters
        )) {
            this["GUIFolder" + basePartKey]
                .add(
                    this.parameters,
                    this.readableNames[sliderParameter],
                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].GUIControlSlidingParameters[
                        sliderParameter
                    ].min,
                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].GUIControlSlidingParameters[
                        sliderParameter
                    ].max,
                    guiSetup[basePartKey][this.types[this.GUITypes[this.readableNames[basePartKey]]]].GUIControlSlidingParameters[
                        sliderParameter
                    ].step
                )
                .onFinishChange(() => {
                    this.product.destroy();
                    this.buildProduct();
                });
        }
    }

    buildProduct() {
        this.product = new Product(this.parameters, this.types, this.GUITypes, this.scale, this.readableNames);
    }
}
