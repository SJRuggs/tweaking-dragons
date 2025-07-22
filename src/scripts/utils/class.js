// Import helper functions from the helpers module
import { fetchJSON, createElement, waitForDOM, interpretContent, kebabToCamelCase} from '/src/scripts/modules/helpers.js';

const data = {};

// Helper function to parse CSS properties from string or array format

// Initialize after DOM is ready
waitForDOM().then(async () => {
    await generateContent();    
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
});


async function generateContent() {
    for (const element of document.querySelectorAll('.generate-class')) {
        const classNode = await generateClass(element.getAttribute('src'));
        element.append(classNode);
    }

    for (const element of document.querySelectorAll('.generated')) {
        const src = element.getAttribute('src');
        data[src] ??= await fetchJSON(`/data/${src}.json`);
        switch (element.getAttribute('gen-type')) {
            case 'class' :
                const data = await fetchJSON(`/data/${src}.json`);
                const container = createElement('div', { className: 'section container' });
                const flex = createElement('div', { className: 'is-flex mobile-column' });

                const makeSection = key => {
                    const div = createElement('div');
                    div.append(interpretContent(data[key]));
                    return div;
                };

                const title      = makeSection('title');
                const classTable = makeSection('classTable');
                const onboarding = makeSection('onboarding');
                const coreTable  = makeSection('coreTable');
                const levels     = makeSection('levels');

                flex.append(onboarding, coreTable);
                container.append(title, classTable, flex, levels);
                element.appendChild(container);
                break;
            }
    }
}

async function generateClass(src) {
    const data = await fetchJSON(`/data/${src}.json`);
    const container = createElement('div', { className: 'section container' });
    const flex = createElement('div', { className: 'is-flex mobile-column' });

    const makeSection = key => {
        const div = createElement('div');
        div.append(interpretContent(data[key]));
        return div;
    };

    const title      = makeSection('title');
    const classTable = makeSection('classTable');
    const onboarding = makeSection('onboarding');
    const coreTable  = makeSection('coreTable');
    const levels     = makeSection('levels');

    flex.append(onboarding, coreTable);
    container.append(title, classTable, flex, levels);

    return container;
}



