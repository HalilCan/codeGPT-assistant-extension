const { marked } = require('marked');
const highlight = require('highlight.js').default;
const cheerio = require('cheerio');

// Create a custom renderer
const renderer = new marked.Renderer();

// Override the default behavior for rendering <pre> tags
// (We override the code() method, which is responsible for rendering <pre> and <code> blocks.)
renderer.code = (code, language) => {
  console.log(code);
  // Check if a language is specified
  const validLanguage = !!(language && highlight.getLanguage(language));
  
  // Highlight the code if a valid language is specified
  const highlightedCode = validLanguage
    ? highlight.highlight(language, code).value
    : code;
  console.log(highlightedCode);
  // escape html encodings since they cause problems
  const escapedCode = highlightedCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
    
  // Return the rendered HTML
  // return `<pre><code class="${validLanguage ? 'hljs' : ''}">${highlightedCode}</code></pre>`;
  // new alternative:
  const codeWithClass = `<span class="${validLanguage ? 'hljs-code' : 'hljs-section'}">${escapedCode}</span>`;
  return `<pre><code>${codeWithClass}</code></pre>`;
};

const markedOptions = {
  renderer: renderer
};

const highlightFirstOptions = {
  highlight: function(code, language) {
    if (language && highlight.getLanguage(language)) {
      let highlighted = highlight.highlight(code, language).value;

      // If the language is JavaScript, handle strings containing HTML differently
      if (language.toLowerCase() === 'javascript') {
        highlighted = highlighted.replace(/`([^`]+)`/g, (match, p1) => {
          return '`' + p1.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') + '`';
        });
      }
      console.log('highlighted', highlighted);
      return highlighted;
    } 
    console.log('not highlighted', code);
    return code;
  }
};

module.exports = {
    renderer: renderer,
    markedOptions: highlightFirstOptions
}