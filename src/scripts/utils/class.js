// Import helper functions from the helpers module
import { fetchJSON, createElement, waitForDOM, parseCSSProperties, interpretContent, kebabToCamelCase} from '../modules/helpers.js';

const data = {};

// Helper function to parse CSS properties from string or array format

// Initialize after DOM is ready
waitForDOM().then(() => {
    generateContent([
        { type: 'class-table', src: 'vampire' },
        { type: 'core-table', src: 'vampire' }
    ]);
});


async function generateContent(typeArray) {
    for (const {type, src} of typeArray) {
        const elements = document.querySelectorAll(`.${type}`);
        data[src] ??= await fetchJSON(`data/${src}.json`);
        elements.forEach(content => content.appendChild(interpretContent(data[src][kebabToCamelCase(type)])));
    }
}






