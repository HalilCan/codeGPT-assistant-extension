let _AiServerBase = `http://localhost:`;
let _AiServer;
const axios = require('axios').default;
const vscode = require('vscode');

// Create a new status bar item that we can now manage
let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
// Show loading message
statusBarItem.text = `$(sync~spin) Oh how the typewriters turn...`;

function updateAiServer(serverPort) {
    _AiServer = `${_AiServerBase}${serverPort}`;
}

/**
 * Sends a message to the AI server and retrieves the response.
 * @param {string} message - The message to send to the AI server.
 * @returns {Promise<any>} - The response data from the AI server.
 */
async function sendMessagetoAI(message, serverPort) {
    statusBarItem.show();
    updateAiServer(serverPort);
    try {
        // Prepare the request options
        const options = {
            method: "POST",
            url: _AiServer + "/queryAi",
            data: {
                text: message
            },
            timeout: 0 // Disable the request timeout
        }

        // Send the request to the AI server
        const response = await axios.post(options.url, options.data, options);
        // console.log(response);
        statusBarItem.hide();

        return response.data;
    } catch (error) {
        console.error("Error in sendMessagetoAI:", error);
        statusBarItem.hide();
        throw error;
    }
}

/**
 * Sends a retry request to the AI server to get a new response.
 * @param {boolean} isOnlyCodeExpected - Indicates if only code is expected in the response.
 * @returns {Promise<any>} - The response data from the AI server.
 */
async function sendRetryRequest(isOnlyCodeExpected, serverPort) {
    statusBarItem.show();
    updateAiServer(serverPort);
    try {
        // Prepare the request options
        const options = {
            method: "GET",
            url: _AiServer + "/retry",
            timeout: 0 // Disable the request timeout
        }

        // Send the request to the AI server
        const response = await axios.get(options.url, options);
        statusBarItem.hide();

        if (isOnlyCodeExpected) {
            return filterCodeFromResponse(response.data);
        } else {
            return response.data;
        }
    } catch (error) {
        statusBarItem.hide();
        console.error("Error in sendRetryRequest:", error);
        throw error;
    }
}

/**
 * Sends a message to the AI server with context and retrieves the response.
 * @param {string} message - The message to send to the AI server.
 * @param {string} context - The context to provide to the AI server.
 * @param {boolean} isOnlyCodeExpected - Indicates if only code is expected in the response.
 * @returns {Promise<any>} - The response data from the AI server.
 */
async function sendMessagetoAIWithContext(message, context, isOnlyCodeExpected, serverPort) {
    statusBarItem.show();
    updateAiServer(serverPort);
    try {
        // Prepare the request options
        const options = {
            method: "POST",
            url: _AiServer + "/queryAi",
            data: {
                text: message,
                context: context
            },
            timeout: 0 // Disable the request timeout
        }

        // Send the request to the AI server
        const response = await axios.post(options.url, options.data, options);
        statusBarItem.hide();

        if (isOnlyCodeExpected) {
            return filterCodeFromResponse(response.data);
        } else {
            return response.data;
        }
    } catch (error) {
        statusBarItem.hide();
        console.error("Error in sendMessagetoAIWithContext:", error);
        throw error;
    }
}

/**
 * Filters code blocks from the AI response using regular expressions.
 * @param {string} response - The AI response to filter code blocks from.
 * @returns {string} - The filtered code blocks from the response.
 */
function filterCodeFromResponse(response) {
    // This function uses regular expressions to find blocks of code within the response.
    // Modify this function according to your AI's response format.
    let filteredResponse = '';
    const codeBlockRegex = /```([^`]+)```/g;
    let match;
    while ((match = codeBlockRegex.exec(response)) !== null) {
        filteredResponse += match[1] + '\n';
    }
    return filteredResponse.trim();
}

module.exports = {
    sendMessagetoAI: sendMessagetoAI,
    sendMessagetoAIWithContext: sendMessagetoAIWithContext,
    filterCodeFromResponse: filterCodeFromResponse,
    sendRetryRequest: sendRetryRequest
};

/*
This code provides a set of functions for communicating with an AI server and handling the responses. Here's a breakdown of the code and its functionality:

The _AiServer constant holds the URL of the AI server.
The axios and vscode modules are imported.
A status bar item is created to show loading messages.
The sendMessagetoAI function sends a message to the AI server and retrieves the response. It sets the necessary options, such as the HTTP method, URL, data payload, and timeout. The function uses axios.post to make the HTTP request and awaits the response. The response data is returned.
The sendRetryRequest function sends a retry request to the AI server to get a new response. It has similar functionality to sendMessagetoAI, but with a different URL. It also checks if only code is expected in the response and calls filterCodeFromResponse to filter out code blocks if needed.
The sendMessagetoAIWithContext function is similar to sendMessagetoAI but includes an additional context parameter. It sends a message to the AI server with context and retrieves the response. It also checks if only code is expected and filters code blocks from the response if needed.
The filterCodeFromResponse function filters code blocks from the AI response using regular expressions. It extracts the code blocks enclosed in triple backticks (```).
Finally, the functions are exported for use in other modules.
*/