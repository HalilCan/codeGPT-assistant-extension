const fs = require('fs');
const path = require('path');

const promptsFilePath = path.join(__dirname, 'prompts.json');
const packageJsonPath = path.join(__dirname, 'package.json');

function loadJsonFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`Error reading file: ${filePath}`, err);
        } else {
            console.error(`Error parsing JSON from file: ${filePath}`, err);
        }
        throw err;
    }
}

const prompts = loadJsonFile(promptsFilePath).filter(prompt => prompt.isEnabled);
const packageJson = loadJsonFile(packageJsonPath);

let vscodeCommands = [];
let vsCodeEditorTitleButtons = [];

prompts.forEach(prompt => {
    const commandObject = {
        command: prompt.command,
        title: prompt.vscodeCommandSettings.title,
        category: prompt.vscodeCommandSettings.category
    };

    vscodeCommands.push(commandObject);

    if (prompt.hasEditorTitleButton) {
        commandObject.icon = prompt.editorTitleButtonSettings.icon;
        vsCodeEditorTitleButtons.push({
            command: prompt.command,
            when: "editorTextFocus",
            group: "navigation",
            icon: prompt.editorTitleButtonSettings.icon
        });
    }
});

vscodeCommands.push({
    "command": "codegpt-assistant.chatWithAI",
    "title": "Chat with AI",
    "category": "CodeGPT Assistant"
});

packageJson.contributes.commands = vscodeCommands;
packageJson.contributes.menus["editor/title"] = vsCodeEditorTitleButtons;

try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
} catch (err) {
    console.error("Error writing to package.json file", err);
    throw err;
}

function getPrompts() {
    try {
        const response = JSON.parse(fs.readFileSync(promptsFilePath, 'utf8')).filter(prompt => prompt.isEnabled);
        return response;
    } catch (err) {
        console.error("error parsing prompts", err);
        throw err;
    }
}


module.exports = {
    promptsFilePath: promptsFilePath,
    prompts: prompts,
    getPrompts: getPrompts
}
