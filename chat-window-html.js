const clearCopyButtonsFunction = `// Get all button elements on the page
function clearCopyButtons() {
	const buttons = document.getElementsByTagName("button");

	// Loop through the buttons and remove those with the specified inner text
	for (let i = buttons.length - 1; i >= 0; i--) {
	const button = buttons[i];
	if (button.innerText === "Copy code") {
		button.parentNode.removeChild(button);
	}
	};
}`;

const webViewConstSetup = `const chatDiv = document.getElementById('chat');
const input = document.getElementById('input');
const sendButton = document.getElementById('sendButton');
const retryButton = document.getElementById('retryButton');
const toolbar = document.getElementById('toolbar');
const vsCode = acquireVsCodeApi();
let aiResponseCount = 0; // To track number of AI responses
let waitingForResponse = false; // To track if we are waiting for a response`

const sendButtonSetup = `sendButton.addEventListener('click', () => {
	const message = input.value
	input.value = '';
	
	waitingForResponse = true;
	updateRetryButtonVisibility();
	
	// get the formatted version
	vsCode.postMessage({
		command: 'formatMessage',
		text: message
	})
	
	// Send a message to the extension
	vsCode.postMessage({
		command: 'sendMessage',
		text: message
	}, '*');
});`

const messageListenerSetup = `// Send message with Ctrl + Enter
input.addEventListener('keydown', (event) => {
	if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
		// Ctrl+Enter (Windows/Linux) or Command+Enter (macOS)
		sendButton.click()
	}
});

// Shortcut to retry the last message (Ctrl + Shift + R)
document.addEventListener('keydown', (event) => {
	if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
		// Ctrl+Shift+R (Windows/Linux) or Command+Shift+R (macOS)
		document.getElementById('retryButton').click();
	  }
});

// Scroll chat to the bottom on new messages
const scrollToBottom = () => {
	chatDiv.scrollTop = chatDiv.scrollHeight;
};

// Listen for messages from the extension
window.addEventListener('message', event => {
	const message = event.data; 
	console.log("message event to window", message);
	try {
		switch (message.command) {
			case 'receiveMessage':
				aiResponseCount++;
				waitingForResponse = false;
				updateRetryButtonVisibility();

				var messageHTML = message.text;
				if (messageHTML.startsWith('undefined')) {
					messageHTML = messageHTML.slice('undefined'.length);
				}

				chatDiv.innerHTML += '<div class="ai-response message-block">AI: ' + messageHTML + '</div>';
				// saveState();
				break;
			case 'replaceLastMessage':
				waitingForResponse = false;
				updateRetryButtonVisibility();

				const responseList = document.getElementsByClassName("ai-response");
				responseList[responseList.length - 1].remove()

				var messageHTML = message.text;
				if (messageHTML.startsWith('undefined')) {
					messageHTML = messageHTML.slice('undefined'.length);
				}
				
				chatDiv.innerHTML += '<div class="ai-response message-block">AI: ' + messageHTML + '</div>';
				// saveState();
				break;
			case 'returnFormattedMessage':
				// Append the message to our chat
				const messageText = document.createElement('div');
				messageText.className = 'human-query message-block';
				messageText.innerText = 'You: ' + message.text;
				chatDiv.appendChild(messageText);
				break;
			default:
				console.log("error: malformed message.", message);
		}
		clearCopyButtons();
		scrollToBottom();
	} catch (err) {
		console.log("error in event handling: ", err);
	}
});`

const toolbarButtonsSetup = `// Retry button setup
retryButton.innerHTML = "&#8634; Retry";
retryButton.addEventListener('click', () => {
	vsCode.postMessage({ command: 'retry' });
});

// Toggle Word Wrap button setup
document.getElementById('toggleWrapButton').addEventListener('click', () => {
	let input = document.getElementById('input');
	input.setAttribute('wrap', input.getAttribute('wrap') === 'soft' ? 'off' : 'soft');
	let chat = document.getElementById('chat');
	chat.style.whiteSpace = chat.style.whiteSpace === 'pre-wrap' ? 'nowrap' : 'pre-wrap';
});

// Update visibility of the Retry button
const updateRetryButtonVisibility = () => {
    if (aiResponseCount > 0 && !waitingForResponse) {
        retryButton.disabled = false;
        retryButton.style.opacity = 1; // Make the button fully visible
		retryButton.style.pointerEvents = 'auto'; // allow pointer events such as clicking
		retryButton.classList.remove("disabled-toolbar-button");
    } else {
        retryButton.disabled = true;
        retryButton.style.opacity = 0.8; // Fade out the button
        retryButton.style.pointerEvents = 'none'; // disable pointer events
		retryButton.classList.add("disabled-toolbar-button");
    }
	if (waitingForResponse) {
		toolbar.classList.add("displays-loading-bottom-border-animation");
	} else {
		toolbar.classList.remove("displays-loading-bottom-border-animation");
	}
};
updateRetryButtonVisibility()`

const webViewStyle = `<style>
body {
	font-family: Arial, sans-serif;
	padding: 0;
	margin: 0;
}

#toolbar {
	background-color: transparent;
    padding: 5px;
    border-bottom: 1px solid #ff86867d;
    text-align: right;
	height: 20px;
}

#chat {
	padding: 10px;
	overflow-y: scroll;
	height: calc(100vh - 171px);
}

.message-block {
	padding: 10px;
}

.human-query {
	white-space: pre-line;
	background: #463f3f40;
}

.ai-response {
	white-space: pre-line;
	background: #29212163;
}

#input {
	width: 100%;
	height: 120px;
	box-sizing: border-box;
	padding: 5px;
	resize: none;
	background: transparent;
    color: #dcdada;
}

.toolbar-button {
	/* background-color: #005257ad;
    color: #d0dada;    
	border: 1px solid #000000cc;    
	*/
	border-radius: 2px;
	border: 1px solid #000000cc;    
    background: #313131;
    bottom: 15px;
    color: #ccc;
}

.toolbar-button:hover, .toolbar-button:focus {
	background-color: #005257ad;
    color: #d0dada;
}

.disabled-toolbar-button{
	background: #4200004a;
	color: black;
}

#input-area {
	display: flex;
	height: 120px;
	position: relative;
}

#sendButton {
	position: absolute;
    right: 10px;
    border-radius: 5px;
    background: #313131;
    bottom: 15px;
    color: #ccc;
    font-weight: bolder;
}
#sendButton:hover, #sendButton:focus {
	background-color: #005257ad;
    color: #d0dada;
}
.displays-loading-bottom-border-animation{
	animation: loading-bottom-border-animation 2s linear infinite;
}

@keyframes loading-bottom-border-animation {
	0% {
	  border-bottom: 1px solid #f1f1f1;
	}
	50% {
	  border-bottom: 1px solid #ff86867d;
	}
	100% {
	  border-bottom: 1px solid #f1f1f1;
	}
  }
</style>
`
const searchModalCss = `
#searchModal {
	display: none; 
	position: fixed; 
	z-index: 1; 
	left: 0;
	top: 0;
	width: 100%; 
	height: 100%; 
	overflow: auto; 
	background-color: rgba(0,0,0,0.4);
}

#searchModalContent {
	background-color: #fefefe;
	margin: 15% auto;
	padding: 20px;
	border: 1px solid #888;
	width: 80%;
}

.close {
	color: #aaa;
	float: right;
	font-size: 28px;
	font-weight: bold;
}

.close:hover, .close:focus {
	color: black;
	text-decoration: none;
	cursor: pointer;
}`

const searchModalHTML = `<!-- The Search Modal -->
<div id="searchModal">
    <!-- Modal content -->
    <div id="searchModalContent">
        <span class="close">&times;</span>
        <input id="searchInput" type="text" placeholder="Search..">
        <button id="prevResult">&larr;</button>
        <button id="nextResult">&rarr;</button>
        <span id="resultCounter"></span>
    </div>
</div>`

const searchModalScript = `let searchModal = document.getElementById("searchModal");
let searchInput = document.getElementById("searchInput");
let span = document.getElementsByClassName("close")[0];
let resultCounter = document.getElementById("resultCounter");
let prevResultButton = document.getElementById("prevResult");
let nextResultButton = document.getElementById("nextResult");

// Holds the search positions
let searchPositions = [];
// Holds the current position index
let currentPositionIndex = -1;
// To prevent insane crashing
let searchTimeout = null;

document.addEventListener("input", function(e) {
	if (e.target.id === "searchInput") {

		// Clear the existing timeout if there is one
		if (searchTimeout !== null) {
			clearTimeout(searchTimeout);
		}
		// Set a new timeout to start the search after the user has stopped typing for 300ms
		searchTimeout = setTimeout(() => {
			let searchText = e.target.value;
			searchAndUpdate(searchText);
			searchTimeout = null;
		}, 300);
	
	}
});

function searchAndUpdate(searchText) {
	let chatText = chatDiv.textContent;

	searchPositions = getAllIndices(chatText, searchText);
	currentPositionIndex = -1;

	if (searchPositions.length > 0) {
		currentPositionIndex = 0;
		highlightAndScroll(chatDiv, searchPositions[currentPositionIndex]);
	}
}

function toggleSearchModal() {
	console.log("toggling search");
	if (searchModal.style.display === "block") {
		searchModal.style.display = "none";
		input.focus();
	} else {
		searchModal.style.display = "block";
		searchInput.focus();
	}
}

function nextSearchItem() {
	if (searchPositions.length > 0) {
		currentPositionIndex = (currentPositionIndex + 1) % searchPositions.length;
		highlightAndScroll(chatDiv, searchPositions[currentPositionIndex]);
	}
}

function prevSearchItem() {
	if (searchPositions.length > 0) {
		currentPositionIndex = (currentPositionIndex - 1 + searchPositions.length) % searchPositions.length;
		highlightAndScroll(chatDiv, searchPositions[currentPositionIndex]);
	}
}

document.addEventListener("keydown", function(e) {
	// if ((e.ctrlKey || e.metaKey) && e.key === "f") {
	// 	e.preventDefault();
	// 	toggleSearchModal();
	// }
	
	if (e.target.id != "searchInput") {
		return;
	}
	if (searchModal.style.display === "block" && (e.key === "Enter" || e.key === "Return")) {
		e.preventDefault();
		nextSearchItem();
	}
	if (searchModal.style.display === "block" && event.shiftKey && (e.key === "Enter" || e.key === "Return")) {
		e.preventDefault();
		prevSearchItem();
	}
});

prevResultButton.onclick = function() {
	prevSearchItem();
}

nextResultButton.onclick = function() {
	nextSearchItem();
}

span.onclick = function() {
	searchModal.style.display = "none";
}

window.onclick = function(event) {
	if (event.target == searchModal) {
		searchModal.style.display = "none";
	}
}

function getAllIndices(str, val) {
	let indices = [], i = -1;
	while ((i = str.indexOf(val, i+1)) != -1) indices.push(i);
	return indices;
}
  
function highlightAndScroll(chatDiv, position) {
    const searchText = document.getElementById("searchInput").value;
    const searchTextLength = searchText.length;
    
    let node;
    let textNodes = [];
    let currentPos = 0;
    
    // Recursively find all the text nodes in the chatDiv
    function findTextNodes(element) {
        for (node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                findTextNodes(node);
            }
        }
    }
    
    findTextNodes(chatDiv);
    
    // Find the text node that contains the search term at the given position
    for (node of textNodes) {
        const textContent = node.textContent;
        const startIndex = textContent.indexOf(searchText);
        
        if (startIndex !== -1 && currentPos + startIndex <= position && position < currentPos + startIndex + searchTextLength) {
            // Split the node at the start of the search term
            const firstPart = node.splitText(startIndex);
            
            // Split the node at the end of the search term
            const secondPart = firstPart.splitText(searchTextLength);
            
            // Create a new span element to highlight the search term
            const highlightSpan = document.createElement("span");
            highlightSpan.style.backgroundColor = "yellow";
            highlightSpan.textContent = searchText;
            
            // Replace the text node with the new span element
            node.parentNode.replaceChild(highlightSpan, firstPart);
            
            // Scroll to the highlighted text
            highlightSpan.scrollIntoView({behavior: "smooth", block: "center"});
            break;
        }
        
        currentPos += textContent.length;
    }
}


`


const webViewContent = `<div id="toolbar" class="bar">
	<button id="retryButton" class="toolbar-button" title = "Click me or press Ctrl + Shift + R to regenerate the last AI response.">Retry</button>
	<button id="toggleWrapButton" class="toolbar-button" title="I don't care who Bill sends; I'm not paying DOUBLE for the same AI.">Toggle Word Wrap</button>
</div>

<div id="chat">
	<!-- Messages will be appended here -->
</div>
<div id="input-area">
	<textarea id="input" wrap="soft" placeholder="Type your message here and press Ctrl + Enter to send..."></textarea>
	<button id="sendButton" title="Click me to send your message to the AI.">&#10095;</button>
</div>
`

const webViewStateScript = `
// Check if we have an old state to restore from
const previousState = vscode.getState();
chatDiv = previousState ? previousState.chatDiv : chatDiv;
chatDiv.innerHTML = chatDiv.innerHTML; // what

function saveState() {
	console.log()
	vscode.setState({ chatDiv });
};`

// this gives us the initial AI chat sidebar html
function getChatHtml() {
	const webViewHtml = `
    <html>
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link rel="stylesheet" href="{{_highlightCssUri}}">
			<title>Chat</title>
			${webViewStyle}
		</head>
        <body>
			${webViewContent}

            <script>
				(function() {
					${webViewConstSetup}        

					${toolbarButtonsSetup}
					
					${clearCopyButtonsFunction}
	
					${sendButtonSetup}
	
					${messageListenerSetup}
				}());			
            </script>
        </body>
    </html>
    `
	console.log(webViewHtml);
	return webViewHtml;
}


module.exports = {
    getChatHtml: getChatHtml
}