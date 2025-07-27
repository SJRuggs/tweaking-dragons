import { generateContent, createElement, addScrollLink } from '/src/scripts/modules/genericContent.js';
import { loadDOMLinkedSources } from '/src/scripts/modules/JSONLoader.js';
import { generateGallery } from '/src/scripts/modules/gallery.js';

// initialize fields
const registry = {};

// start the application
start();




async function start() {
    registry.styles = document.createElement('style');
    registry.navbar = { menu: [ { type: "list", isNav: true, content: [
        { type: "item", content: "Home", href: "/classes/vampire/bloodmorph" },
        { type: "item", content: "Classes", href: "/classes/vampire/bloodmorph" }
    ]}]};
    registry.menu = createElement('div', { className: 'menu desktop-menu' });
    document.body.appendChild(registry.menu);
    document.head.appendChild(registry.styles);

    // generate content
    await loadDOMLinkedSources(registry);
    await generateAllContent();    
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    createMobileMenuButton();
}



/**
 * Generate content based on DOM elements with the class 'generate'
 */
async function generateAllContent() {
    for (const element of document.querySelectorAll('.generate')) {
        const src = element.getAttribute('src');
        element.classList.remove('generate');
        element.classList.add(`generated${registry[src] ? `-${src}` : ''}`);
        switch (element.getAttribute('gen-type')) {
            case 'navbar':      generateNavbar(element); break;
            case 'class' :      generateClass(src, element); break;
            case 'subclass' :   generateSubclass(src, element); break;
        }
    }
}




/** * Generate a navigation bar based on the registry
 * @param {HTMLElement} element - The element to append the navbar to
 */
function generateNavbar(element) {
    const navbarElements = [];
    registry.navbar.menu[0].content.forEach(item => navbarElements.push(createElement('a', { className: 'navbar-item', href: item.href }, [item.content])));
    const start =   createElement('div',    { className: 'navbar-start' },      navbarElements);
    const menu =    createElement('div',    { className: 'navbar-menu' },       [start]);
    const navbar =  createElement('nav',    { className: 'navbar' },    [menu]);
    element.appendChild(navbar);
    updateMenu(registry.navbar.menu);
}

/**
 * Generate content for a class
 * @param {string} src - The source identifier for the class
 * @param {HTMLElement} element - The element to append the class content to
 */
function generateClass(src, element) {
    const section = key => {
        const div = createElement('div');
        div.append(generateContent(registry[src][key]));
        return div;
    };
    const title =       section('title');
    const classTable =  section('classTable');
    const levels =      section('levels');
    const container =   createElement('div', 
        { className: 'container section is-flex is-flex-direction-column', style: { 'gap': '2rem' } }, 
        [ title, classTable, levels ]
    );
    console.log(`${src} generated:`, container);
    element.appendChild(container);
    updateMenu(registry[src].menu || []);
}

/**
 * Generate content for a subclass
 * @param {string} src - The source identifier for the subclass
 * @param {HTMLElement} element - The element to append the subclass content to
 */
function generateSubclass(src, element) {
    const section = key => {
        const div = createElement('div');
        div.append(generateContent(registry[src][key]));
        return div;
    };
    const features =    section('features');
    const container =   createElement('div', 
        { className: 'container section is-flex is-flex-direction-column', style: { 'gap': '2rem' } }, 
        [ features ]
    );
    console.log(`${src} generated:`, container);
    element.appendChild(container);
    updateMenu(registry[src].menu || []);
}

/**
 * Update the menu based on the provided items
 * @param {Array} items - Array of menu items 
 */
function updateMenu(items) {
    items.forEach(item => {
        if (item.type === 'label') registry.menu.appendChild(createElement('span', { className: 'menu-label', content: item.content }));
        else {
            const list = createElement('ul', { className: `menu-list ${item.isNav ? 'mobile' : ''}` });
            registry.menu.appendChild(list);
            [item.content].flat().forEach(subItem => {
                const li = createElement('a', { className: 'menu-item' }, [ subItem.content ]);
                list.appendChild(li);
                if (subItem.href) li.setAttribute('href', subItem.href);
                if (subItem.goto) addScrollLink(li, subItem.goto);
                if(subItem.id) {
                    const src = subItem.id.slice(0, -'-gallery-button'.length);
                    if (registry[src]?.gallery) generateGallery(registry[src].gallery, src, li);
                }
            });
        }
    });
}

/**
 * Create a mobile menu button that toggles the menu visibility
 * Is called once after the registry is filled and the menu is generated
 */
function createMobileMenuButton() {
    const button = createElement('button', { className: 'mobile-menu-button', id: 'mobile-menu-button' }, [createElement('i', { className: 'fa-solid fa-bars' })]);
    button.addEventListener('click', () => {
        registry.menu.classList.toggle('desktop-menu');
        registry.menu.classList.toggle('mobile-menu-background');
    });
    document.body.appendChild(button);
}