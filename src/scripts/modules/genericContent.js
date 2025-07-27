/**
 * Generate content based on provided data
 * @param {Object} data - Data object containing content properties 
 * @returns {HTMLElement} - Generated HTML element with content
 */
export function generateContent(data) {
    if (!data) {
        console.warn('Missing data for content generation');
        return createElement('span', { content: '' });
    }
    const element = createElement(data.type || "span", {
        content:    !data?.type ? data : undefined,
        className:  data.className,
        id:         data.id,
        style:      data.css ? parseCSSProperties(data.css) : undefined,
        attributes: data.attributes,
        goto:       data.goto,
    });

    [data.content].flat().filter(Boolean).forEach(item => element.appendChild(generateContent(item, element)));
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
export function createElement(tag, options = {}, children) {
    const element = document.createElement(tag);
    if (options.content)    element.textContent =   options.content;
    if (options.className)  element.className =     options.className;
    if (options.id)         element.id =            options.id;
    if (options.content)    element.textContent =   options.content;
    if (options.style)      Object.assign(element.style, options.style);
    if (options.attributes) Object.entries(options.attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (options.properties) Object.assign(element, options.properties);
    if (options.goto) addScrollLink(element, options.goto);
    if (children) {
        children.forEach(child => {
            if (typeof child === 'string') element.appendChild(document.createTextNode(child));
            else if (child instanceof Node) element.appendChild(child);
        });
    }
    return element;
}

/** * Parse CSS properties from a string or array into an object
 * @param {string|Array} cssProperties - CSS properties as a string or array
 * @returns {Object} - Parsed CSS properties object
 */
const parseCSSProperties = cssProperties => {
    const parseProperty = (prop) => {
        const [key, value] = prop.split(':').map(s => s.trim());
        return key && value ? { [key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())]: value } : {};
    };
    const props = typeof cssProperties === 'string' 
    ? cssProperties.split(';').filter(p => p.trim()) 
    : cssProperties;
    return props.reduce((acc, prop) => ({ ...acc, ...parseProperty(prop) }), {});
};

/**
 * Add a smooth scroll link to a target element
 * @param {HTMLElement} element - The element to add the scroll link to
 * @param {string} targetId - The ID of the target element to scroll to
 */
export function addScrollLink(element, targetId) {
    element.addEventListener('click', (event) => {
        const offset = 30;
        event.preventDefault();
        event.stopPropagation();
        let goto = targetId;
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
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
}