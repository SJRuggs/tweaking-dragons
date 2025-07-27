/**
 * Fetch and parse JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} - Promise resolving to parsed JSON data
 */
export const fetchJSON = filePath => fetch(filePath)
    .then(response =>   { return response.json();   })
    .then(data =>       { return data;              })
    .catch(error =>     { throw error;              });

/**
 * Load DOM linked data sources
 * @param {object} registry - Registry to store loaded data
 */
export const loadDOMLinkedSources = async registry => {
    for (const src of document.querySelectorAll('link[rel="data"]')) {
        const id = src.getAttribute('data-id');
        registry[id] = await fetchJSON(src.getAttribute('href'));

        // if cssRules isn't an array, try to inherit from another data source
        if (!Array.isArray(registry[id].cssRules)) {
            if (!registry[id].cssRules.startsWith('inherit')) continue;
            else registry[id].cssRules = registry[registry[id].cssRules.split(':')[1]]?.cssRules || [];
        }

        // apply CSS rules to the document
        registry[id].cssRules.forEach(style => {
            const selector = style.selector;
            const rule = style.rule;
            if (selector.startsWith('--')) document.documentElement.style.setProperty(selector, rule);
            else selector.split(',').map(s => s.trim()).forEach(singleSelector => 
                registry.styles.sheet.insertRule(
                    `.generated-${id} ${singleSelector} { ${rule} }`,
                    registry.styles.sheet.cssRules.length
            ));
        });

        // log the loaded data
        console.log(`${id} loaded:`, registry[id]);
    }
};
