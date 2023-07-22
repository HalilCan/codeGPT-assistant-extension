const vscode = require('vscode');

/**
 * Helper function to get line-aligned context.
 * 
 * @param {String} text - Full document text.
 * @param {number} start - Context start position.
 * @param {number} end - Context end position.
 */
function alignContext(text, start, end) {
    // Decrement the start index until a new line character is found
    while (start > 0 && text[start] !== '\n') {
        start--;
    }
    
    // Increment the end index until a new line character is found
    while (end < text.length && text[end] !== '\n') {
        end++;
    }
    
    // Return the start and end indices, which should now be at line boundaries
    return { start, end };
}

/**
 * Returns context from the given document, based on the given position and context length.
 * 
 * @param {vscode.TextDocument} document - The text document.
 * @param {vscode.Position} position - The position for which to return the context.
 * @param {number} precedingChars - The maximum number of preceding characters to return.
 * @param {number} followingChars - The maximum number of following characters to return.
 * @param {String} connector - The string that is put between preceding and following context.
 */
function getContext(document, position, precedingChars, followingChars, connector = "") {
    // Get the full text of the document
    const fullText = document.getText();
    
    // Check if the position is a selection
    const isSelection = position instanceof vscode.Selection;
    
    // Get the start offset, based on whether the position is a selection
    const startOffset = document.offsetAt(isSelection ? position.start : position);
    
    // Get the end offset, based on whether the position is a selection
    const endOffset = isSelection ? document.offsetAt(position.end) : startOffset;

    // If the selection contains all the context, log a message and return
    if (startOffset === 0 && endOffset >= fullText.length - 1) {
        // console.log("The selection contains all the context");
        return "The selection contains all the context";
    }

    // Calculate the start and end indices for the context
    let start = Math.max(0, startOffset - Math.floor(precedingChars));
    let end = Math.min(fullText.length, endOffset + Math.floor(followingChars));
    
    // Align the context to line boundaries
    const { start: alignedStart, end: alignedEnd } = alignContext(fullText, start, end);

    // Return the context, which includes the preceding context, the connector string, and the following context
    return fullText.substring(alignedStart, startOffset) + connector + fullText.substring(endOffset, alignedEnd);
}

// Function to get the preceding context of a given position
function getPrecedingContext(document, position, maxChars, placeholderString = "") {
    // Get the context with all the preceding characters and no following characters
    return getContext(document, position, maxChars, 0, placeholderString);
}

// Function to get the following context of a given position
function getFollowingContext(document, position, maxChars, placeholderString = "") {
    // Get the context with no preceding characters and all the following characters
    return getContext(document, position, 0, maxChars, placeholderString);
}

// Function to get the surrounding context of a given position
function getSurroundingContext(document, position, maxChars, connector = "") {
    // Divide the maximum characters by two to get the number of preceding and following characters
    const halfChars = Math.floor(maxChars / 2);
    
    // Get the context with equal preceding and following characters
    return getContext(document, position, halfChars, halfChars, connector);
}

// Export the functions for use in other modules
module.exports = {
    getSurroundingContext,
    getPrecedingContext,
    getFollowingContext
};
