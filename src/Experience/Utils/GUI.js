/*
********************************************
No change is needed in this class definition
********************************************
*/

import * as dat from "lil-gui";

export default class GUI {
    constructor() {
        this.active = true; //window.location.hash == '#GUI'
        if (this.active) {
            this.ui = new dat.GUI();
        }
    }
}
