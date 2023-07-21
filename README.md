# Your *other* AI pair programmer

I don't care who Bill sends; I am not paying *double* for the same AI.

![CodeGPT Assistant Refactor Screenshot](https://github.com/HalilCan/codeGPT-assistant-extension/blob/main/media/screenshots/refactor.png?raw=true)

## What is CodeGPT Assistant?

CodeGPT Assistant has near-complete CoPilot X parity with some additional features and near-effortless extensibility. You can edit `prompts.json` to easily add more AI actions and interface elements!

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

Streaming and auto-complete are coming soon (feel free to make a PR). In the meantime, you can use the `Continue code from cursor` command as a slightly less "auto" complete.

## Usage Guide

1. Install the extension.
2. Run one of the above commands, such as `Chat with AI`. (Note: `Ctrl + Shift + p` opens up the palette where you can execute this command. This is `Command + Shift + p` on Mac.)
3. If this is the first time you are running the extension since starting VSCode, a browser window will pop up with the ChatGPT log-in page. Do so. *Do not close the browser* afterwards, as the browser is how the extension controls ChatGPT "remotely".
4. You are good to go.

![CodeGPT Assistant Chat Screen Screenshot](https://github.com/HalilCan/codeGPT-assistant-extension/blob/main/media/screenshots/chat-screen.png?raw=true)

## Adding New AI Actions

https://github.com/HalilCan/codegpt-assistant-2/assets/3583967/9ae7d23e-8b9c-409e-b240-a2619de704b8

All AI actions are effectively ChatGPT prompts that are composed of some preset text, optional context, and your input (e.g. your selected code). The first entry in `prompts.json` is a template that demonstrates how that works. In addition, every default AI action was refactored into this format and you can see how each works in the same file.

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

### 1.1.0

* `Headless-ChatGPT` API Server integrated into the extension. No more need for juggling the two.

### 1.0.0

* Initial release of CodeGPT Assistant. Various issues fixed and features added.
