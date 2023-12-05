# Your *other* AI pair programmer

I don't care who Bill sends; I am not paying *double* for the same* AI.

![CodeGPT Assistant Refactor Screenshot](https://github.com/HalilCan/codeGPT-assistant-extension/blob/main/media/screenshots/refactor.png?raw=true)

## What is CodeGPT Assistant?

CodeGPT Assistant is your intelligent coding co-pilot that lives in the editor. It has near-complete CoPilot X parity with some additional features and near-effortless extensibility. I initially made it for myself, and still use it daily. You can edit `prompts.json` to easily add more AI actions and interface elements.

You do not need an API key. This does not use the OpenAI API. It uses my [`headless-chatgpt`](https://github.com/HalilCan/headless-chatgpt) API emulator.

CodeGPT Assistant comes with the following actions:

![CodeGPT Assistant Command Palette Screenshot](https://github.com/HalilCan/codeGPT-assistant-extension/blob/main/media/screenshots/command-palette.png?raw=true)

* `Chat with AI`: starts a chat window,
* `Explain selection`,
* `Refactor selection`,
* `Find and fix problems in selection`,
* `Optimize code in selection`,
* `Continue code from cursor`,
* `Generate comments for selection`,
* `Generate unit tests`

The extension is context-aware: It remains aware of your growing conversation, and it considers the code surrounding your selection whenever you use an `selection` or `cursor` action.

Chat log too long? You can use `vscode`'s own `ctrl+f` search modal to search within your chat window.

Streaming and auto-complete are coming soon (feel free to make a PR). In the meantime, you can use the `Continue code from cursor` command as a slightly less "auto" complete.

## Usage Guide

1. Install the extension.
2. You may not have all necessary packages, and `puppeteer`'s puppet Chrome installation does not always trigger successfully. We will now fix this: 
    1. Navigate to the extension directory. You can search for `codegpt-assistant` to find this directory on your machine. The path should be something like `... /.vscode/extensions/halilcan.codegpt-assistant-1.1.0`.
    2. Run `npm install` to install any missing dependencies.
    3. Run `node node_modules/puppeteer/install.js` to make sure `puppeteer`'s puppet Chrome is successfully installed. This is a ~120MB download.
3. Run any one of the above CodeGPT Assistant commands, such as `Chat with AI`. (Note: `Ctrl + Shift + p` opens up the palette where you can execute this command. This is `Command + Shift + p` on Mac.)
4. If this is the first time you are running the extension since starting VSCode, a browser window will pop up with the ChatGPT log-in page. Do so. *Do not close the browser* afterwards, as the browser is how the extension controls ChatGPT "remotely".
5. You are good to go.

![CodeGPT Assistant Chat Screen Screenshot](https://github.com/HalilCan/codeGPT-assistant-extension/blob/main/media/screenshots/chat-screen.png?raw=true)

## Adding New AI Actions

https://github.com/HalilCan/codeGPT-assistant-extension/assets/3583967/26624769-f664-4ef7-8585-1f41b37bb599

All AI actions are effectively ChatGPT prompt "recipes" that are composed of some preset text, optional context, and your input (e.g. your selected code). The extension uses these recipes to prepare its prompts. The first entry in `prompts.json` is a template that demonstrates how that works. In addition, every default AI action was refactored into this format and you can see how each works in the same file.

Here is how you add a new AI action:

1. Add the new action entry into `prompts.json`.
2. Run `npm run prepackage` in the extension's directory. 
3. Reload the extension in VSCode. (Or restart VSCode)

The video above shows this in action.

## Privacy

This is a strictly local extension, but it still uses ChatGPT. If you can use ChatGPT, you can use this.

CodeGPT Assistant does not save your data or send it anywhere else except for ChatGPT itself. All of those operations are visible in the browser. Please feel free to check the code on Github to verify this. A good firewall should corroborate these, as well.

---

## Requirements

* A ChatGPT account.
* Internet access.
* Node and NPM.

## Extension Settings

This extension contributes the following settings:

* `codegpt-assistant.serverPort`: In case of port conflicts, you can change the port used by the local ChatGPT puppet-API server. If there *is* a port conflict, the extension will tell you. Changing this will require reloading the extension.

## Known Issues

* **Do not close the browser** if you are not done with the extension for the current VSCode session. Similarly, **do not close the ChatGPT tab**. The puppet-API will be upset if you do.
* Chat **alone** does not make the AI **aware** of editor contents. You currently need to either use one of the editor functions to let AI know about that, or simply copy/paste what you want into the `Chat with AI` chat window (as you would with ChatGPT itself). If this is a concern, you can look at what the AI knows in the browser.
* **Captchas** arise more often if you log in repeatedly. Prolonged use itself does not cause any more than normal. If a captcha does jump at you, solving it generally lets the extension continue without any problem.
* **Too long inputs** (as defined by ChatGPT) can result in strange behavior.
* Outputs are allowed to continue. (as in pressing the "Continue generating." button when prompted)
* Staying logged in for too long (varies, but I haven't experienced it before 3-4 hours) can cause the **ChatGPT session** to **expire**. Restarting the extension and logging in again solves this issue. If for some reason it does not, restarting VSCode certainly will.
* **Logging in is not automated** because the heightened security during log-in could otherwise upset ChatGPT and make it decide that *you* are a bot. Moreover, 2FA would have been manual anyway.

## Release Notes

## 2.0
- 2.0.1: Various versioning, readme, and packaging fixes.
- 2.0.0: The Big Fix: Openai changed ChatGPT's interface sufficiently to break key functionality. That has been fixed. More features added to the backend API emulator, which are coming to the extension presently.

## 1.2
- 1.2.0: Added cookie management. No more superfluous logins between sessions, as long as you submitted one query sometime recently.

### 1.1

- 1.1.4: Modify the puppet browser to be able to interact with OpenAI's new buttons. 
- 1.1.2: Clean up debug methods and add reminder in readme that text search within the chat window is enabled. 
- 1.1.1: Package installation instructions included in the readme to fix `npm` and `puppeteer` dependency issues.  
- 1.1.0: `Headless-ChatGPT` API Server integrated into the extension. No more need for juggling the two.

### 1.0

* Initial release of CodeGPT Assistant. Various issues fixed and features added.
