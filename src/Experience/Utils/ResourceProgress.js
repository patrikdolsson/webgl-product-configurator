/*
********************************************
No change is needed in this class definition
********************************************
*/

export default class ResourceProgress {
    constructor(document) {
        this.mainDiv = document.createElement("div");
        this.mainDiv.style.position = "absolute";
        this.mainDiv.style.bottom = "10px";
        this.mainDiv.style.left = "50%";
        this.mainDiv.style.transform = "translateX(-50%)";
        this.mainDiv.style.padding = "10px";
        this.mainDiv.style.border = "2px solid white";
        this.mainDiv.style.borderRadius = "10px";
        this.mainDiv.style.zIndex = "1";

        // Create the progress bar element
        this.progress = document.createElement("div");
        this.progress.style.position = "absolute";
        this.progress.style.top = "0";
        this.progress.style.left = "0";
        this.progress.style.height = "100%";
        this.progress.style.width = "0%";
        this.progress.style.backgroundColor = "green";
        this.progress.style.borderRadius = "10px";
        this.progress.style.zIndex = "0";

        // Add the progress bar to the main element
        this.mainDiv.appendChild(this.progress);

        // Create an empty div to hold the text
        this.textDiv = document.createElement("div");
        this.textDiv.style.position = "relative";
        this.textDiv.style.zIndex = "2";

        // Add the text to the text div
        const preProgress = "STL Files Loaded: ";
        let progressText = "0";
        this.textNode = document.createTextNode(preProgress + progressText);
        this.textDiv.appendChild(this.textNode);

        // Add the text div to the main element
        this.mainDiv.appendChild(this.textDiv);

        this.button = document.createElement("button");
        this.button.id = "loadResourcesButton";
        this.button.style.position = "absolute";
        this.button.style.top = "0";
        this.button.style.right = "-100px"; // Position the button to the right of the progress bar
        this.button.style.width = "100px";
        this.button.style.height = "100%";
        this.button.style.backgroundColor = "gray";
        this.button.style.borderRadius = "10px";
        this.button.style.zIndex = "3"; // Set the z-index to 3 to make the button appear on top of the text and progress bar
        this.button.innerHTML = "Load All Resources";

        // Add the button to the main element
        this.mainDiv.appendChild(this.button);

        // Add the HTML element to the page
        document.body.appendChild(this.mainDiv);
    }

    updateProgress(percentage) {
        const width = Math.min(Math.max(percentage, 0), 100);
        this.progress.style.width = `${width}%`;
        if (percentage === 100) {
            document.getElementById("loadResourcesButton").remove();
        }
    }

    updateTextNode(text) {
        this.textNode.textContent = "STL Files Loaded: " + text;
    }
}
