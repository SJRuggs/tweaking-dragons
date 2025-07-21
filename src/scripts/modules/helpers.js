// Helper Functions Module

/**
 * Fetch and parse JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} - Promise resolving to parsed JSON data
 */
export function fetchJSON(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`Loaded data from ${filePath}:`, data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching the file:', error);
            throw error; // Re-throw to let caller handle it
        });
}

/**
 * Create a DOM element with optional properties
 * @param {string} tag - HTML tag name
 * @param {Object} options - Configuration object
 * @param {string} [options.className] - CSS class name
 * @param {string} [options.id] - Element ID
 * @param {string} [options.content] - Text content
 * @param {Object} [options.style] - Style properties object
 * @param {Object} [options.attributes] - Custom attributes object
 * @param {Object} [options.properties] - Custom properties to set on element
 * @returns {HTMLElement} - Created element
 */
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.content) element.textContent = options.content;
    if (options.style) Object.assign(element.style, options.style);
    if (options.attributes) Object.entries(options.attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (options.properties) Object.assign(element, options.properties);
    return element;
}

/**
 * Wait for DOM content to be loaded
 * @returns {Promise<void>}
 */
export function waitForDOM() {
    return new Promise(resolve => {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve);
        else resolve();
    });
}

export function kebabToCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/** * Parse CSS properties from string or array format
 * @param {string|Array<string>} cssProperties - CSS properties in string or array format
 * @returns {Object} - Parsed CSS properties as an object
 */
export function parseCSSProperties(cssProperties) {
    if (!cssProperties) return {};
    
    if (typeof cssProperties === 'string') {
        // Handle string format: "property: value; property2: value2"
        return cssProperties.split(';').reduce((acc, prop) => {
            const trimmed = prop.trim();
            if (trimmed) {
                const [key, value] = trimmed.split(':').map(s => s.trim());
                if (key && value) acc[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value;
            }
            return acc;
        }, {});
    } else if (Array.isArray(cssProperties)) {
        // Handle array format: ["property: value", "property2: value2"]
        return cssProperties.reduce((acc, prop) => {
            const [key, value] = prop.split(': ');
            acc[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value;
            return acc;
        }, {});
    }
    
    return {};
}

/**
 * Interprets and renders content based on its type
 * @param {Object} data - The content object with type and content properties
 */
export function interpretContent(data) {
    if (!data?.type) return createElement('span', { content: data });
    const element = createElement(data.type);
    
    // Check if content is an array or a single object
    if (Array.isArray(data.content))
        data.content.forEach(item => {
            const itemElement = interpretContent(item);
            if (itemElement) element.appendChild(itemElement);
        });
    else if (data.content) element.appendChild(interpretContent(data.content));

    // Set properties and attributes
    if (data.className) element.classList.add(...data.className.split(' '));
    if (data.css) Object.assign(element.style, parseCSSProperties(data.css));
    if (data.id) element.id = data.id;
    if (data.goto) {
        element.addEventListener('click', (event) => {
            if (event.defaultPrevented) return;
            event.stopPropagation(); // Prevent event from bubbling to parent elements
            console.log(`Navigating to: #${data.goto}`);
            const targetElement = document.getElementById(data.goto);
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                window.location.hash = data.goto;
            }
        });
    }

    return element;
}