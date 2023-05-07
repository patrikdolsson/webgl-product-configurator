import * as THREE from "three";
import Experience from "../Experience";
import STLPart from "./ProductParts/STLPart";

// Load the JSON file that contains the STL information
const stlInfoJson = require("../../../static/STL/stlInfo.json");

// Defines the class for the product
export default class Product {
    constructor(parameters, types, GUITypes, scale, readableNames) {
        // Retrieve the instantiated instance of the Experience class
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.meshes = this.experience.meshes;

        // Store the input arguments as class instance properties
        this.parameters = { ...parameters };
        this.types = types;
        this.GUITypes = GUITypes;
        this.scale = new THREE.Vector3(scale, scale, scale);
        this.readableNames = readableNames;

        // Initialize the rotation arrays and parts object
        this.initialRotation = [];
        this.rotations = [];
        this.parts = {};

        /*
        ******************************************************************
        START BLOCK OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
        ******************************************************************
        */

        // Add initial rotations and set first placement point
        this.initialRotation.push([-90, 0, 0]);
        let placementPoint = new THREE.Vector3();

        // Start building the product by adding the first stl model
        console.log("TableLamp instantiating");
        /*
        first argument ("lampBase") represents the whole object of the instantiated STL part. It will become a property inside 
            the "this.parts" object. One of the main purposes of having access to each individual instatiated part is to 
            provide the output points coordinates for use in subsequent instantiations as can be seen in this example.

        The second argument ("LampBase") represents the basePartKey that is used to traverse and find the appropriate STL 
            file inside of the stl info json. (Note, do NOT use readable name)

        The third argument (placementPoint) is a THREE.Vector3 object or a normal object that at least contains the 
            coordinate properties x, y, z with appopriate values for each representing the coordinate in the world 
            space that will be used to help place the stl model

        The fourth argument ("PlacementPoint") represents the exact string used to name the point in the CATIA placement
            geometrical set that should coincide with the coordinate received from the placementPoint

        The fifth argument (this.rotations) represent an array of the rotations that the model should do in order from start
            to finish. A single element of this array is its own array that represents a single set of rotations using 
            "Tait-Bryan angles" with the order x,y,z. (Order is important)

        The sixth element ("#154360") represents the hexcode for the color that the model should have when displayed
        */
        this.addSTLModel("lampBase", "LampBase", placementPoint, "PlacementPoint", this.rotations, "#154360");

        // Add subsequent models by adding rotations and selecting placement points as needed
        placementPoint = this.parts.lampBase.outputPoints.OutputPoint1;
        this.rotations.push([0, 0, parameters["Lamp Swivel Angle"]]);
        this.addSTLModel("baseConnection", "BaseConnection", placementPoint, "PlacementPoint", this.rotations, "#154360");

        placementPoint = this.parts.baseConnection.outputPoints.OutputPoint1;
        this.addSTLModel("lowerAxle", "LowerAxle", placementPoint, "PlacementPoint1", this.rotations, "#154360");

        placementPoint = this.parts.lowerAxle.outputPoints.OutputPoint2;
        this.rotations.push([parameters["Lower Axle Angle"], 0, 0]);

        this.addSTLModel("lowerSupportRod1", "LowerSupportRod1", placementPoint, "PlacementPoint", this.rotations, "#154360");

        placementPoint = this.parts.lowerAxle.outputPoints.OutputPoint1;
        this.addSTLModel("lowerSupportRod2", "LowerSupportRod1", placementPoint, "PlacementPoint", this.rotations, "#154360");

        placementPoint = this.parts.lowerSupportRod2.outputPoints.OutputPoint1;
        this.rotations.push([parameters["Upper Axle Angle"], 0, 0]);
        this.addSTLModel("upperAxle", "UpperAxle", placementPoint, "PlacementPoint2", this.rotations, "#154360");

        placementPoint = this.parts.upperAxle.outputPoints.OutputPoint3;
        this.rotations.push([0, 0, parameters["Head Support Angle"]]);
        this.addSTLModel("upperSupportRod", "UpperSupportRod", placementPoint, "PlacementPoint", this.rotations, "#154360");

        placementPoint = this.parts.upperSupportRod.outputPoints.OutputPoint1;
        this.addSTLModel("headSupport", "HeadSupport", placementPoint, "PlacementPoint", this.rotations, "#154360");

        placementPoint = this.parts.headSupport.outputPoints.OutputPoint1;
        this.rotations.push([parameters["Lamp Head Angle"], 0, 0]);
        this.addSTLModel("lampHead", "LampHead", placementPoint, "PlacementPoint", this.rotations, "#154360");

        /*
        **********************************************************
        END OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
        **********************************************************
        */
    }

    // Defines the function for adding stl models to the webgl scene based on the partName and the parameters
    addSTLModel(instanceName, partName, placementPointCoordinates, placementPointName, rotations, colorString) {
        let readableType = this.types[this.GUITypes[this.readableNames[partName]]];
        let type = "";
        for (const currType of Object.keys(stlInfoJson.parts[partName])) {
            if (this.readableNames[currType] === readableType) {
                type = currType;
            }
        }
        this.parts[instanceName] = new STLPart(
            partName,
            type,
            placementPointCoordinates,
            placementPointName,
            this.parameters,
            rotations,
            this.initialRotation,
            this.scale,
            this.readableNames,
            colorString
        );
    }

    destroy() {
        this.meshes.map((i) => {
            const object = this.scene.getObjectByProperty("id", i);
            object.geometry.dispose();
            object.material.dispose();
            this.scene.remove(object);
        });
        this.experience.meshes = [];
    }
}
