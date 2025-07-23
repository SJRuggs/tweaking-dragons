// Import helper functions from the helpers module
import { fetchJSON, createElement, waitForDOM, parseCSSProperties} from '/src/scripts/modules/helpers.js';





const data = {};
const styles = document.createElement('style');
document.head.appendChild(styles);





waitForDOM().then(async () => {
    await getSources();
    await collectGeneratedFields();    
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
});





async function getSources() {
    const sources = document.querySelectorAll('link[rel="data"]');
    for (const src of sources) {
        const id = src.getAttribute('data-id');
        data[id] = await fetchJSON(src.getAttribute('href'));
        data[id].cssRules.forEach(style => {
            const selector = style.selector;
            const rule = style.rule;
            if (selector.startsWith('--')) document.documentElement.style.setProperty(selector, rule);
            else selector.split(',').map(s => s.trim()).forEach(singleSelector => 
                styles.sheet.insertRule(`.generated-${id} ${singleSelector} { ${rule} }`, styles.sheet.cssRules.length));
        });
        console.log(`data "${id}" loaded:`, data[id]);
    }
}





async function collectGeneratedFields() {
    for (const element of document.querySelectorAll('.generate')) {
        const src = element.getAttribute('src');
        element.classList.remove('generate');
        element.classList.add(`generated-${src}`);
        switch (element.getAttribute('gen-type')) {
            case 'class' : element.appendChild(generateClass(src)); break;
        }
    }
}





function generateClass(src) {
    let container;
    const makeSection = key => {
        const div = createElement('div');
        div.append(generateContent(data[src][key]));
        return div;
    };
    const menu =        makeSection('menu');
    const title =       makeSection('title');
    const classTable =  makeSection('classTable');
    const onboarding =  makeSection('onboarding');
    const levels =      makeSection('levels');
    container = createElement( 'div', 
        { className: 'container section is-flex is-flex-direction-column', style: { 'gap': '2rem' } }, 
        [ title, classTable, onboarding, levels, menu ]
    );
    return container;
}





/**
 * Interprets and renders content based on its type
 * @param {Object} data - The content object with type and content properties
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