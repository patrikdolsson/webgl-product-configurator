# WebGL Product Configurator

Welcome to the WebGL Product Configurator template repo! This WebGL product configurator is based on the shelf configurator developed by @erik-nordvall ([shelf configurator](https://github.com/erik-nordvall/Shelf_Configurator)) and is developed for the [Design Automation Lab](https://liu.se/en/research/design-automation-lab) at the division of product realisation at Linköping University as part of my master thesis.

This repo intends to provide the code needed to create a product configurator in WebGL for any customizable product created in a similar way as provided by the [CATIA-product-configurator repo](https://github.com/patrikdolsson/CATIA-product-configurator). The [CATIA-product-configurator repo](https://github.com/patrikdolsson/CATIA-product-configurator) also serves as a template for exporting the STL files and STLinfo.json which will be an assumed input to this WebGL product configurator. The WebGL product configurator implementation uses THREE.js with a gui from dat.gui. The provided code base uses STL models as the 3D mesh format, but can be repurposed to use gltf models (the more native 3D mesh format for THREE.js).

A [startup guide](#getting-started), a [step by step guide to implement your own product configurator](#how-to-implement-your-own-product-configurator) and [brief descriptions for all classes included in this template](#brief-descriptions-of-all-the-classes) will follow.

## Getting Started

The repo contains an example to make sure that you have everything up and running before attempting to implement your own product configurator.

How to run the example:

-   Make sure your machine has node.js installed (You can install node.js from [https://nodejs.org/en/download](https://nodejs.org/en/download))
-   Download/clone this repo to a folder on your machine, or import this repo to your own repo
-   Open repo in IDE
-   Make sure your machine has Webpack installed for example by typing in `npm install --save-dev webpack` in the IDE terminal
-   After Webpack is installed, type in `npm install` to install all packages
-   Once all packages are installed you can run `npm run dev`
-   To terminate the local server, type ctrl + C in the IDE terminal

## How to implement your own product configurator

Anywhere marked with the following will mark areas where code can be modified to fit an arbitrary implementation of the WebGL product configurator

```
/*
************************************************************
START OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
************************************************************
*/

/*
**********************************************************
END OF CODE TO BE CHANGED TO FIT YOUR PRODUCT CONFIGURATOR
**********************************************************
*/
```

Use existing code as reference for how to implement your own product configurator.

### Step 1

Create a configurable product in CATIA and export all the STL models as desired according to the [CATIA-product-configurator repo](https://github.com/patrikdolsson/CATIA-product-configurator). Then replace the STL folder with the one generated from your product configurator using CATIA.

### Step 2 (optional)

In World.js, Set which, if any, of your parts should be excluded from the gui configuration control. Also set which, if any, of the configuration parameters should be excluded from the gui configuration control.

### Step 3

Build the product part by part in a similar way that the product is built in the CATIA product configurator. Each part is added one by one. The position is set by choosing a placement point according to the respective CATIA part and placing it in coincident with a coordinate. This coordinate can be chosen from an output point according to the respective CATIA part. Rotations are added as needed.

### Step 4 (optional)

Filter out reachable stl models from the gui configuration control if desired according to the example in Reasources.js

### Step 5

Test the product configurator by running `npm run dev` in the IDE terminal

### Step 6 (optional)

Due to the way WebGL handles interaction with the environment, the orientation of the coordinate system in relation to the CATIA part matters and it's possible you might need an adjustment. This is done by what is called initialRotations in Product.js.

The default orientation of the webgl coordinate system is presented in the following figure

![webgl coordinate system orientation](readme-images/coordinate_systems_right_handed.png)

Any desired orientation can be achieved by using [Tait-Bryan angles](https://en.wikipedia.org/wiki/Euler_angles#Tait%E2%80%93Bryan_angles) (with convention x-y'-z'' intrinsic rotations) or multiple steps of rotations in order.

### Step 7 (optional)

Adjust the scale as needed to make the product fit in the window appropriately when initializing the product configurator. the scale can be found in World.js

## Brief descriptions of all the classes
