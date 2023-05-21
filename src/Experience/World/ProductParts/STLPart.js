import Experience from "../../Experience";
import * as THREE from "three";

const stlInfoJson = require("../../../../static/STL/stlInfo.json");

/*
*************************************************************************
No change is needed in STLPart.js. I recommended to extend this class and
add whatever you want for your implementation if this class is not enough
*************************************************************************
*/

export default class STLPart {
    constructor(
        basePart,
        type,
        modelPlacementCoords,
        placementPointName,
        parameters,
        rotations,
        initialRotations,
        scale,
        readableNames,
        colorString
    ) {
        // Retrieve the instance of the Experience class and set some properties
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.meshes = this.experience.meshes;

        // Set some instance properties
        this.readableNames = readableNames;
        this.jsonBasePartArray = stlInfoJson.parts[basePart][type];
        this.modelPlacementCoords = new THREE.Vector3(modelPlacementCoords.x, modelPlacementCoords.y, modelPlacementCoords.z);
        this.parameters = parameters;
        this.rotations = rotations;
        this.initialRotations = initialRotations;
        this.scale = scale.clone();

        // Call the setGeometry method to set the geometry of the STL mesh
        this.setGeometry();

        // Set the local placement and output coordinates based on the geometry information
        this.localPlacementCoords = new THREE.Vector3(
            this.geometrySTLInfo.placement[placementPointName].x,
            this.geometrySTLInfo.placement[placementPointName].y,
            this.geometrySTLInfo.placement[placementPointName].z
        );

        this.localOutputCoords = {};
        for (const outputPoint of Object.keys(this.geometrySTLInfo.output)) {
            this.localOutputCoords[outputPoint] = new THREE.Vector3(
                this.geometrySTLInfo.output[outputPoint].x,
                this.geometrySTLInfo.output[outputPoint].y,
                this.geometrySTLInfo.output[outputPoint].z
            );
        }

        // Call the calculateModelMatrix method to calculate the model matrix for the STL mesh
        this.calculateModelMatrix();

        // Call the setTextures method to set the textures of the mesh
        this.setTextures();

        // Call the setMaterial method to set the material of the mesh according to the color from the input arguments
        this.setMaterial(colorString);

        // Call the setMesh method to set the mesh of the STLPart instance
        this.setMesh();
    }

    setGeometry() {
        // Select the best STL fitting object from the JSON array based on the configuration parameters and how close the solution is to the actual configuration parameters
        let bestSTLObject = this.jsonBasePartArray[0];
        let bestAverageAccuracy = 9999999999;
        for (const item of this.jsonBasePartArray) {
            let individualAccuracy = [];
            for (const parameterKey of Object.keys(item.parameters)) {
                let temp =
                    Math.abs(item.parameters[parameterKey] - this.parameters[this.readableNames[parameterKey]]) /
                    this.parameters[this.readableNames[parameterKey]];
                individualAccuracy.push(temp.toFixed(4));
            }
            const currAverageAccuracy = (individualAccuracy) => {
                let currAverage = 0;
                for (const parameterAccuracy of individualAccuracy) {
                    currAverage += Number(parameterAccuracy);
                }
                return Number(currAverage / individualAccuracy.length);
            };
            if (currAverageAccuracy(individualAccuracy) < bestAverageAccuracy) {
                bestAverageAccuracy = currAverageAccuracy(individualAccuracy);
                bestSTLObject = item;
            }
        }
        if (!(bestSTLObject.name in this.resources.items)) {
            this.resources.loadSTLFileAsync(bestSTLObject);
        }
        this.geometrySTLInfo = bestSTLObject;
        this.geometry = this.resources.items[bestSTLObject.name];
    }

    setTextures() {
        this.textures = {};
    }

    setMaterial(colorString) {
        this.material = new THREE.MeshStandardMaterial({
            color: colorString,
        });
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //this.mesh.matrixWorld = this.modelMatrix.clone();
        this.mesh.applyMatrix4(this.modelMatrix.clone());

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.meshes.push(this.mesh.id);
        this.scene.add(this.mesh);
    }

    calculateModelMatrix() {
        // Create a 4x4 Matrix representing the rotations of local coordinate system along x-, y-, and z-axis respectively according to each rotation in the this.rotations array
        this.rotationMatrix = this.calculateRotationMatrix(this.rotations);
        // Create a 4x4 matrix representing the initial rotation of the local coordinate system in order to align with the orientation of the WebGL window
        this.initialRotationMatrix = this.calculateRotationMatrix(this.initialRotations);
        // Create a 4x4 translation matrix that represents the translation needed to place the mesh at the correct spot according the the rotations
        this.translationMatrix = this.calculateTranslationMatrix();
        // Create a scale matrix
        this.scaleMatrix = new THREE.Matrix4().scale(this.scale);

        // Calculate the model matrix according to M_model = M_scale * M_translation * M_initialRotation * M_rotation
        // This means that the rotation matrix is applied first, initialRotation matrix second and so on. (keep in mind, order matters!)
        this.modelMatrix = this.scaleMatrix
            .clone()
            .multiply(this.initialRotationMatrix)
            .multiply(this.translationMatrix)
            .multiply(this.rotationMatrix);
    }

    calculateRotationMatrix(rotationsArray) {
        // Create a 4x4 Matrix and then rotates it along x-, y-, and z-axis respectively according to each rotation in the rotationsArray
        let rotationMatrix = new THREE.Matrix4();
        for (const rotation of rotationsArray) {
            this.rotateMatrix4(rotation, rotationMatrix);
        }
        return rotationMatrix;
    }

    calculateTranslationMatrix() {
        // Calculate the translation for both the placement and output points without the initial rotation
        this.translationCoordinates = this.calculateTranslationCoords();
        this.outputPoints = this.calculateOutputCoords();

        // Set the position of a new Identity Matrix4 to the final translation coordinates
        let translationMatrix = new THREE.Matrix4();
        translationMatrix.setPosition(this.translationCoordinates);
        return translationMatrix;
    }

    calculateTranslationCoords() {
        // Rotate the coordinate of the placement point inside the stl file and express it in the world coordinate space
        this.rotatedLocalPlacementCoords = this.localPlacementCoords.clone().applyMatrix4(this.rotationMatrix);
        let translationCoordinates = this.modelPlacementCoords.clone();
        translationCoordinates.sub(this.rotatedLocalPlacementCoords);
        return translationCoordinates;
    }

    calculateOutputCoords() {
        // Rotate the coordinates of the output points inside the stl file and express it in the world coordinate space
        let outputPoints = {};
        this.rotatedLocalOutputCoords = {};
        for (const outputPoint in this.localOutputCoords) {
            this.rotatedLocalOutputCoords[outputPoint] = this.localOutputCoords[outputPoint]
                .clone()
                .applyMatrix4(this.rotationMatrix);
            outputPoints[outputPoint] = this.rotatedLocalOutputCoords[outputPoint].clone();
            outputPoints[outputPoint].add(this.translationCoordinates);
        }
        return outputPoints;
    }

    rotateMatrix4(xyzRotationArray, matrix) {
        const rotX = (xyzRotationArray[0] * Math.PI) / 180;
        const rotY = (xyzRotationArray[1] * Math.PI) / 180;
        const rotZ = (xyzRotationArray[2] * Math.PI) / 180;

        const rotMatrixX = new THREE.Matrix4().makeRotationX(rotX);
        const rotMatrixY = new THREE.Matrix4().makeRotationY(rotY);
        const rotMatrixZ = new THREE.Matrix4().makeRotationZ(rotZ);

        const rotMatrix = new THREE.Matrix4();

        // M_rotation = M_rotationX * M_rotationY * M_rotationZ.
        // This means that the matrix first applies the rotation around Z, then Y, and finally X.
        // These rotations represent the extrinsic rotation order z-y-x (or the intrinsic rotation order x-y'-z'')
        rotMatrix.multiply(rotMatrixX).multiply(rotMatrixY).multiply(rotMatrixZ);

        matrix.multiply(rotMatrix);
    }
}
