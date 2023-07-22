// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { sendMessagetoAI, sendMessagetoAIWithContext, sendRetryRequest } = require('./ai-communication.cjs');
const { marked } = require('marked');
const { getSurroundingContext, getPrecedingContext, getFollowingContext } = require('./message-builder.cjs');
const { renderer, markedOptions } = require("./markedRenderer.cjs");
const path = require('path');
const { getPrompts } = require('./generate-commands.cjs');
const { getChatHtml } = require('./chat-window-html');
const { spawn } = require('child_process');

const _contextSize = 2048;
const _autoCompleteDelay = 500;
let _extensionPath, _highlightCssUri;
let lastKeyPressedTimestamp = Date.now();
let autoCompleteTimer = null;
let _prompts;
let serverProcess;

let config = vscode.workspace.getConfiguration('codegpt-assistant');
let serverPort = config.get('serverPort') || 3040;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// set up css for the webview before generating it.
	_extensionPath = context.extensionPath;
	// this is to make sure vscode filepath interpretation doesn't mess up our css locator
	_highlightCssUri = vscode.Uri.file(
		path.join(_extensionPath, 'node_modules', 'highlight.js', 'styles', 'default.css')
	).with({ scheme: 'vscode-resource' });

	_prompts = getPrompts();
	prepCommands(context);

	// Starting the server and watching it
	const serverPath = path.join(_extensionPath, "/server/server.js");
	serverProcess = spawn('node', [serverPath, serverPort]);
	serverProcess.stdout.on('data', (data) => {
	//   console.log(`Server: ${data}`);
	});
	serverProcess.stderr.on('data', (data) => {
	//   console.error(`Server Error: ${data}`);
	});
	serverProcess.on('close', (code) => {
	//   console.log(`Server exited with code ${code}`);
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codegpt-assistant.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from CodeGPT-Assistant!');
	});

	const functionDateTime = vscode.commands.registerCommand('codegpt-assistant.functionDateTime', function () {
		// The code you place here will be executed every time your command is executedv
		const currentdate = new Date();
		let dateTimeString =  currentdate.getMonth() + "/" + currentdate.getDay()
		+ "/" + currentdate.getFullYear() + " @ " 
		+ currentdate.getHours() + ":" 
		+ currentdate.getMinutes() + ":" + currentdate.getSeconds();

		// Display a message box to the user
		// vscode.window.showInformationMessage(dateTime, {modal: true});
		vscode.window.showInformationMessage(dateTimeString);
	});

	const chatWithAICommand = vscode.commands.registerCommand('codegpt-assistant.chatWithAI', () => {
        const panel = vscode.window.createWebviewPanel(
            'aiChat', 
            'AI Chat', 
            vscode.ViewColumn.Two,
            {
				retainContextWhenHidden: true,
				enableScripts: true,
				enableCommandUris: true,
						
				// Add the 'vscode-resource:' schema to the Content Security Policy
				localResourceRoots: [vscode.Uri.file(context.extensionPath)],
				enableFindWidget: true,
			}
        );
		
		panel.iconPath = vscode.Uri.joinPath(context.extensionUri, "media", "dark", "typewriter.svg");
		// panel.iconPath = vscode.Uri.joinPath(context.extensionUri, "media", "dark", "typewriter-white.svg");
        panel.webview.html = panel.webview.html || getChatHtml();
		panel.webview.onDidReceiveMessage (
			message => {
				switch (message.command) {
					case 'sendMessage':
						sendMessagetoAI(message.text, serverPort).then(response => { // properly handle promise
							// this is too much of a headache and largely not worth it.
							// const markdownHtml = marked(response.text, markedOptions);
							// let renderContent = response.text + "<br> now for the filtered: <br>" + markdownHtml;
							panel.webview.postMessage({ command: 'receiveMessage', text: response.text });
						}).catch(error => {
							console.error("communication error caught in extension: ", error);
							vscode.window.showErrorMessage(error.message);
						});
						break;
					case 'formatMessage':
						panel.webview.postMessage({command: 'returnFormattedMessage', text: message.text});
						// TODO: let's disable this for now. Makes input all wonky.
						// panel.webview.postMessage({command: 'returnFormattedMessage', text: marked(message.text, markedOptions)})
						break;
					case 'retry':
						sendRetryRequest(false, serverPort).then(response => {
							panel.webview.postMessage({ command: 'replaceLastMessage', text: response.text });
						}).catch(error => {
							console.error("communication error caught in extension: ", error);
							vscode.window.showErrorMessage(error.message);
						});
						break;
					default:
						// console.log(message);
				}
			},
			undefined,
			context.subscriptions
		)
    });

	context.subscriptions.push(chatWithAICommand);

	// TODO: AI FILL / autocomplete (with guidance?) is sorely needed.
}


// Listen to keyboard activity to update lastKeyPressedTimestamp
vscode.workspace.onDidChangeTextDocument(() => {
    lastKeyPressedTimestamp = Date.now();
});

// create hovering webview for markdown message display
function createSimpleWebview(htmlContent, title) {
    const panel = vscode.window.createWebviewPanel(
        'showHtml', // Identifies the type of the webview. Used internally
        title, // Title of the panel displayed to the user
        vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
        { 
            enableScripts: true, // Enables JavaScript in the WebView
            retainContextWhenHidden: true, // Keeps the state of the WebView even when it's not visible
        }
    );

	if (htmlContent.startsWith('undefined')) {
		htmlContent = htmlContent.slice('undefined'.length);
	}

	// we want the button cleaner to run immediately after filling out the content.
	htmlContent += `<script>
	// Get all button elements on the page
	(function clearCopyButtons() {
		const buttons = document.getElementsByTagName("button");

		// Loop through the buttons and remove those with the specified inner text
		for (let i = buttons.length - 1; i >= 0; i--) {
			const button = buttons[i];
			if (button.innerText === "Copy code") {
				button.parentNode.removeChild(button);
			}
		};
	})();
	</script>`

    panel.webview.html = htmlContent;

	
}

function prepCommands(context) {
	for (const commandData of _prompts) {
		// TODO: superfluous isEnabled
        // @ts-ignore
        const { name, command, isEnabled, promptSettings } = commandData;

        if (isEnabled) {
            const commandHandler = createCommandHandler(promptSettings);
            const commandDisposable = vscode.commands.registerCommand(command, commandHandler);
            context.subscriptions.push(commandDisposable);
        }
    }
}

function createCommandHandler(promptSettings) {
    return () => {
		/*
            "requiresEditorContext": true,
            "editorContextSettings": {
                "contextAnchor": "selection|cursor|none?file",
                "contextDirection": "before|after|both",
                "bothDirectionFiller": "\n... discussed code cut out of here ...\n",
                "maxContextChars": 2048,
                "getFullLines": true
            },
            "messagePreamble": "Please explain the following lines of code given the context below it:\n",
            "messageContextIndicator": "\n *** The context I mentioned is below: ***\n",
            "messageConclusion": "\n Thank you for your help."
        */

        // Get the current text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
		const { editorContextSettings } = promptSettings;

        // Get the document and selected text
        const document = editor.document;
		let selection, selectedText, fullContext, fullQueryText;
		try {
			if (promptSettings.requiresEditorContext) {
			switch (editorContextSettings.contextAnchor) {
				case "selection":
					selection = editor.selection;
					selectedText = document.getText(selection);
					switch(editorContextSettings.contextDirection) {
						case "before":
							fullContext = getPrecedingContext(document, selection.start, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
							break;
						case "after":
							fullContext = getFollowingContext(document, selection.end, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
							break;
						case "both":
							fullContext = getSurroundingContext(document, selection, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
							break;
						default:
							throw "malformed editorContextSettings.contextDirection in prompts. This command is borked.";
					}
					break;
				case "cursor" || "none":
					const position = editor.selection.active;
					// eslint-disable-next-line no-unused-vars
					const line = editor.document.lineAt(position.line).text; 
					const precedingLines = getPrecedingContext(editor.document, position, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
					selectedText = precedingLines;
					switch(editorContextSettings.contextDirection) {
						case "before":
							fullContext = getPrecedingContext(document, position, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
							break;
						case "after":
							fullContext = getFollowingContext(document, position, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
							break;
						case "both":
							fullContext = getSurroundingContext(document, position, editorContextSettings.maxContextChars, editorContextSettings.bothDirectionFiller);
							break;
						default:
							throw "malformed editorContextSettings.contextDirection in prompts. This command is borked.";
					}
					break;
				default:
					throw "malformed editorContextSettings.contextAnchor in prompts. This command is borked.";
			}
			
			fullQueryText = `${promptSettings.messagePreamble}\n${selectedText}\n${promptSettings.messageContextIndicator}\n${fullContext}\n${promptSettings.messageConclusion}`;
		}


		} catch (err) {
			debugger;
			console.error(err);
		}
		
		if (fullQueryText === undefined) {
			console.error("query building failed - undefined. This command is borked.");
			throw "query building failed - undefined. This command is borked."
		}

		// Send the selected text and context to the AI model
		sendMessagetoAI(fullQueryText, serverPort).then(response => {
			// console.log(response);
			createSimpleWebview(response.text, promptSettings.responseWindowTitle);
		}).catch(error => {
			console.error("communication error caught in extension: ", error);
			vscode.window.showErrorMessage(error.message);
		});
    };
}


// This method is called when your extension is deactivated
function deactivate() {
	if (serverProcess) {
		serverProcess.kill();
	}
}

module.exports = {
	activate,
	deactivate,
}
