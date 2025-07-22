// Import helper functions from the helpers module
import { fetchJSON, createElement, waitForDOM, parseCSSProperties, interpretContent, kebabToCamelCase} from '../modules/helpers.js';

const data = {};

// Helper function to parse CSS properties from string or array format

// Initialize after DOM is ready
waitForDOM().then(async () => {
    await generateContent();    
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
});


async function generateContent() {
    for (const element of document.querySelectorAll('.generated')) {
        const genType = element.getAttribute('gen-type');
        const src = element.getAttribute('src');
        data[src] ??= await fetchJSON(`data/${src}.json`);
        element.appendChild(interpretContent(data[src][kebabToCamelCase(genType)], element));
    }
}






