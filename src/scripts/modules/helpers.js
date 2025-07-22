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
 * @param {string} [options.goto] - Element ID to navigate to on click
 * @param {string} [options.elementType] - Type of element for goto behavior
 * @returns {HTMLElement} - Created element
 */

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
    const parseProperty = (prop) => {
        const [key, value] = prop.split(':').map(s => s.trim());
        return key && value ? { [key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())]: value } : {};
    };
    const props = typeof cssProperties === 'string' 
        ? cssProperties.split(';').filter(p => p.trim()) 
        : cssProperties;
    return props.reduce((acc, prop) => ({ ...acc, ...parseProperty(prop) }), {});
}

/**
 * Interprets and renders content based on its type
 * @param {Object} data - The content object with type and content properties
 */
export function interpretContent(data) {
    const element = createElement(data.type || "span", {
        content:    !data?.type ? data : undefined,
        className:  data.className,
        id:         data.id,
        style:      data.css ? parseCSSProperties(data.css) : undefined,
        attributes: data.attributes,
        goto:       data.goto,
    });

    [data.content].flat().filter(Boolean).forEach(item => element.appendChild(interpretContent(item, element)));
    return element;
}

/**
 * Create a DOM element with optional properties and navigation functionality
 * @param {string} tag - HTML tag name
 * @param {Object} options - Configuration object
 * @param {string} [options.className] - CSS class name
 * @param {string} [options.id] - Element ID
 * @param {string} [options.content] - Text content
 * @param {Object} [options.style] - Style properties object
 * @param {Object} [options.attributes] - Custom attributes object
 * @param {Object} [options.properties] - Custom properties to set on element
 * @param {string} [options.goto] - Element ID to navigate to on click
 * @returns {HTMLElement} - Created element
 */
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.content)    element.textContent =   options.content;
    if (options.className)  element.className =     options.className;
    if (options.id)         element.id =            options.id;
    if (options.content)    element.textContent =   options.content;
    if (options.style)      Object.assign(element.style, options.style);
    if (options.attributes) Object.entries(options.attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (options.properties) Object.assign(element, options.properties);
    if (options.goto) {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            let goto = options.goto;
            let targetElement = document.getElementById(goto);
            const parts = goto.split('-');
            let num = parseInt(parts.pop());
            const str = parts.join('-');
            if (!targetElement && !isNaN(num) && num > 0) {
                while (!targetElement && num > 0) {
                    const nextElement = document.getElementById(`${str}-${num}`);
                    if (nextElement) {
                        targetElement = nextElement;
                        goto = `${str}-${num}`;
                        break;
                    }
                    num--;
                }
            }
            if (targetElement) {
                console.log(`Navigating to: #${goto}`);
                const y = targetElement.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
                setTimeout(() => { window.location.hash = goto; }, 400);
            }
        });
    }
    return element;
}


