# WebGL Product Configurator

Welcome to the WebGL Product Configurator template repo! This WebGL product configurator is based on the shelf configurator developed by @erik-nordvall ([shelf configurator](https://github.com/erik-nordvall/Shelf_Configurator)) and is developed for the [Design Automation Lab](https://liu.se/en/research/design-automation-lab) at the division of product realisation at Linköping University as part of my master thesis.

This repo intends to provide the code needed to create a product configurator in WebGL for any customizable product created in a similar way as provided by the [CATIA-product-configurator repo](https://github.com/patrikdolsson/CATIA-product-configurator). The [CATIA-product-configurator repo](https://github.com/patrikdolsson/CATIA-product-configurator) also serves as a template for exporting the STL files and STLinfo.json which will be an assumed input to this WebGL product configurator. The WebGL product configurator implementation uses THREE.js with a gui from dat.gui. The provided code base uses STL models as the 3D mesh format, but can be repurposed to use gltf models (the more native 3D mesh format for THREE.js).

## Getting Started

The repo contains an example to make sure that you have everything up and running before attempting to implement your own product configurator.

How to run the example:

-   Make sure your machine has node.js installed (You can install node.js using [](https://nodejs.org/en/download))
-   Download/clone this repo to a folder on your machine, or import this repo to your own repo
-   Open repo in IDE
-   Make sure your machine has Webpack installed for example by typing in `npm install --save-dev webpack` in the IDE terminal
-   After Webpack is installed, type in `npm install` to install all packages
-   Once all packages are installed you can run `npm run dev`
-   To terminate the local server, type ctrl + C in the IDE terminal

![webgl coordinate system orientation](readme-images/coordinate_systems_right_handed.png)
