const Scene = require("Scene");
const Time = require('Time');
const console = require('Diagnostics');
const TouchGestures = require('TouchGestures');

/**
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * The Custom Console is a utility to create an on-screen console for debugging-
 * purposes. It does not draw the console on the screen, you have to do that in
 * Spark-AR yourself. The Console needs a reference to the debugging-textfield.
 * 
 * This is the documentation for a Custom Console API for Spark AR Studio.
 * To start using the API you first have to import it from FARlib.
 * You have to create the text field by yourself, its also possible to create
 * buttons like in the example below to control the console.
 * 
 * P.S.
 * Make sure you add 'TouchGestures' as a capability inside the properties-panel
 * (which can be found in the menu: Project/Edit Properties.../Capabilities)
 * 
 * More info:
 * https://github.com/ypmits/ARrrrLib/tree/develop/src/CustomConsole/README.md
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
export default class CustomConsole
{
	constructor(background, textfield, fontSize = 16, options = null)
	{
		if(options == null) options = {collapse: true, maxLines: 7, keepLog: true, debug: false};
		if(options.debug) console.log(`[CustomConsole] back:${background} tf:${textfield} size:${fontSize} options:${options}`);
		else {
			var collapse = (options.collapse != null) ? options.collapse : false;
			var maxLines = (options.maxLines != null) ? options.maxLines : 7;
			var keepLog = (options.keepLog != null) ? options.keepLog : false;

		}
		var startAt = 0;
		var scrollStartAt = 0;
		var lines = [];
		Time.setTimeout(() => {textfield.text = "";}, 1000);

		var autoRefreshInterval;
		if (options.resizeText) {
			TouchGestures.onPinch(background).subscribe(e =>
			{
				const lastScaleX = textfield.transform.scale.x.pinLastValue();
				const newScaleX = e.scale.mul(lastScaleX);
				this.log("Pinch lastScale:"+lastScaleX+" newScale:"+newScaleX);
				textfield.fontSize += 1;
			});
		}

		this.log = string =>
		{
			switch (typeof string)
			{
				case "number":
				case "string":
				case "boolean":
					if (collapse)
					{
						for (var i = 0; i < lines.length; i++)
						{
							if (lines[i].type == "logObject")
							{
								if (lines[i].string == string)
								{
									lines[i].addCount();
									refreshConsole();
									return;
								}
							}
						}
					}
					var l = new logObject(string);
					lines.push(l);
					refreshConsole();
					break;
				case "object":
					var l = new logObject("[object]");
					lines.push(l);
					refreshConsole();
					break;
				case "function":
					try
					{
						string.pinLastValue();
						var l = new logObject(string.pinLastValue());
						lines.push(l);
						refreshConsole();
					} catch (err)
					{
						var l = new logObject("[function]");
						lines.push(l);
						refreshConsole();
					}
					break;
				case "undefined":
					var l = new logObject("[undefined]");
					lines.push(l);
					refreshConsole();
					break;
				default:
					var l = new logObject("[type not found]");
					lines.push(l);
					refreshConsole();
					break;
			}
		}

		this.watch = (name, signal) =>
		{
			if (typeof signal == "function")
			{
				try
				{
					signal.pinLastValue();
					var l = new signalObject(name, signal);
					lines.push(l);

					refreshConsole();

					if (autoRefreshInterval == null)
					{
						autoRefreshInterval = Time.setInterval(() => { refreshConsole() }, 100);
					}
				} catch (err)
				{
					var l = new logObject(name + ": [not a signal]");
					lines.push(l);
					refreshConsole();
				}

			} else
			{
				var l = new logObject(name + ": [not a signal]");
				lines.push(l);
				refreshConsole();
			}
		}

		this.clear = () =>
		{
			scrollStartAt = null;
			abstrTempTextInLog("Clear()", i => { textfield.text = "";});
			lines = [];
			startAt = 0;
		}

		this.scrollToTop = () => { abstrTempTextInLog("ScrollToTop()"); scrollStartAt = 0; }

		this.scrollUp = () =>
		{
			abstrTempTextInLog("ScrollUp()");
			if (scrollStartAt != null) scrollStartAt--;
			else scrollStartAt = lines.length - maxLines - 1;
			if (scrollStartAt < 0) scrollStartAt = 0;
		}

		this.scrollDown = () =>
		{
			abstrTempTextInLog("ScrollDown()");
			if (scrollStartAt != null) scrollStartAt++;
			else scrollStartAt = lines.length - maxLines + 1;
			if (scrollStartAt > lines.length - maxLines) scrollStartAt = null;
		}

		this.scrollToBottom = () => { abstrTempTextInLog("ScrollToBottom()"); scrollStartAt = null; }


		/**
		 * Adds a button that will connects to a function when tapped on.
		 * Use something like Scene.root.findFirst("buttonName") as the buttonObjPromise-parameter
		 */
		// this.addButton = (buttonObj, clickFunc) =>
		// {
		// 	if (buttonObj == null || clickFunc == null) return;
			
		// 	TouchGestures.onTap(buttonObj).subscribe(e => { clickFunc(); });
		// 	return this;
		// }
		
		this.addClearButton = buttonString => abstrButtonPromise(Scene.root.findFirst(buttonString), this.clear);
		this.addToTopButton = buttonString => abstrButtonPromise(Scene.root.findFirst(buttonString), this.scrollToTop);
		this.addScrollUpButton = buttonString => abstrButtonPromise(Scene.root.findFirst(buttonString), this.scrollUp);
		this.addScrollDownButton = buttonString => abstrButtonPromise(Scene.root.findFirst(buttonString), this.scrollDown);
		this.addScrollToBottomButton = buttonString => abstrButtonPromise(Scene.root.findFirst(buttonString), this.scrollToBottom);
		
		var abstrButtonPromise = (buttonP, func) => {
			if(buttonP == null || func == null) return;
			buttonP.then(b => { TouchGestures.onTap(b).subscribe(e => func() ); })
		}

		var abstrTempTextInLog = (toLog, endFunc = null, duration = .5) => {
			this.log(toLog);
			if(endFunc != null) Time.setTimeout(() => {endFunc();}, duration * 1000);
		}

		var refreshConsole = () =>
		{
			if (!keepLog)
			{
				while (lines.length > maxLines)
				{
					lines.shift();
				}
			} else
			{
				if (lines.length < maxLines)
				{
					startAt = 0;
				} else
				{
					startAt = lines.length - maxLines;
				}
				// if(startAt)
			}

			var newText = "";

			for (var i = (lines.length > maxLines) ? maxLines - 1 : lines.length - 1; i >= 0; i--)
			{

				var index = i + startAt;
				if (scrollStartAt != null)
				{
					index = i + scrollStartAt;
				}

				if (lines[index].type == "logObject")
				{
					newText += ">>>" + ((lines[index].count <= 1) ? "   " : "[" + lines[index].count + "]") + " " + lines[index].string + "\n";
				} else if (lines[index].type = "signalObject")
				{
					newText += "<O>    " + lines[index].name + ":" + lines[index].signal.pinLastValue() + "\n";
				}
			}
			textfield.text = newText;

			var containsSignal = false;
			for (var i = lines.length - 1; i >= 0; i--)
			{
				if (lines[i].type == "signalObject")
				{
					containsSignal = true;
				}
			}
			if (!containsSignal)
			{
				if (autoRefreshInterval != null)
				{
					Time.clearInterval(autoRefreshInterval);
				}
			}
		}




		class logObject
		{
			constructor(string)
			{
				this.type = "logObject";
				this.string = string;
				this.count = 1;
			}

			addCount()
			{
				this.count++;
			}
		}

		class signalObject
		{
			constructor(name, signal)
			{
				this.type = "signalObject";
				this.name = name;
				this.signal = signal;
			}
		}
	}
}