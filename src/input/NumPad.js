import Scene from 'Scene';
import Animation from 'Animation';
import Textures from 'Textures';

import console from './../Console';
// import retrieveImage from './../retrieveImage';

/**
 * NumPad is a container for an oldskool T9-like button-pad
 * @param {number} maxLength The maximum length of 
 */
export default class
{
	constructor(sceneObject, maxLength)
	{
		this.secret = Scene.root.find("Secret").material.diffuse;
		this.secret.currentFrame = 0;
		this.numbersArray = [];

		this.sceneObject = sceneObject;
		this.sceneObject.hidden = false;
		this.useTextfield = false;
		this.maxLength = maxLength;
	}

	/**
	 * Adds a character to the textfield
	 * @param {string} value The value that needs to be added to the textfield
	 * @param {AudioObject} soundOK This is the AudioObject that will be played when the value is added correctly
	 * @param {AudioObject} soundWrong This is the AudioObject that will be played when the value cannot be added (when the textfield-content is too long f.i.)
	 */
	add(value, soundOK, soundWrong)
	{
		// if (this.maxLength) {
		// 	if (soundWrong != undefined) soundWrong.play();
		// 	return;
		// }
		// if (soundOK != undefined) soundOK.play();

		this.numbersArray.push(value);
		this.secret.currentFrame = this.numbersArray.length;

		if (this.numbersArray.length >= this.maxLength) {

			var canvasKeyboard = Scene.root.find("canvasKeyboard");
			canvasKeyboard.hidden = true;

			if (this.numbersArray.length > this.maxLength) {
				console.log("Error: this should never happen. Code is longer than 6 chars! Cutting off the excess")
				this.numbersArray = this.numbersArray.slice(0, this.maxLength);
			}

			var userTypedCode = this.numbersArray.toString().replace(/,/g,"");
			console.log(userTypedCode);
			
		// 	// retrieveImage(userTypedCode);
		// 	retrieveImage().then(result => {
		// 		// TODO: move this to another place
		// 		// console.log(result);
		// 		var name_card = Scene.root.find("name_card");
		// 		name_card.material.diffuse = result;
		// 		// console.log(name_card.material.diffuse);
	
		// 	})
		// 	// add a fallback default code for wrong typing
			
		// 	// temporary code to fix horrible bugs in the prototype
		// 	// TODO: fix this otherwise
		// 	var faceTrackerCanvas = Scene.root.find("facetracker");
		// 	faceTrackerCanvas.hidden = false;
		// }
	}

	/**
	 * Removes the last character if the total length is larger than 0
	 * @param {AudioObject} sound This is the AudioObject that will be played when the function is called
	 */
	removeLast(element, sound) {

		this.backgroundMaterial = element.material;
		this.glow = element.find("Glow");
		this.number = element.find("Number");

		this.glow.material.opacity = 1;
		var driver = Animation.timeDriver({durationMilliseconds:150, loopCount: 1, mirror: false});
		var values = Animation.samplers.easeOutCubic(1, 0);
		var anim = Animation.animate(driver, values);
		this.glow.material.opacity = anim;
		driver.start();

		this.numbersArray.pop();
		this.secret.currentFrame = this.numbersArray.length;
		// console.log(this.numbersArray);
		// console.log(this.secret.currentFrame);

		// if (this.t.length <= 0) return;
		// if (sound != undefined) sound.play();
		// this.t = this.t.substr(0, this.t.length - 1);
		// this.textfield.text = this.t;
	}

	/**
	 * Removes all characters if the total length is larger than 0
	 * @param {AudioObject} sound This is the AudioObject that will be played when the function is called
	 */
	removeAll(element, sound) {
		this.backgroundMaterial = element.material;
		this.glow = element.find("Glow");
		this.number = element.find("Number");

		this.glow.material.opacity = 1;
		var driver = Animation.timeDriver({durationMilliseconds:150, loopCount: 1, mirror: false});
		var values = Animation.samplers.easeOutCubic(1, 0);
		var anim = Animation.animate(driver, values);
		this.glow.material.opacity = anim;
		driver.start();

		this.numbersArray = [];		
		this.secret.currentFrame = 0;
		// console.log(this.numbersArray);
		// console.log(this.secret.currentFrame);

		// if (this.t.length <= 0) return;
		// if (sound != undefined) sound.play();
		// this.t = "";
		// this.textfield.text = this.t;
	}
}
