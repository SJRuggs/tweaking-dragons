// Import helper functions from the helpers module
import { fetchJSON, createElement, waitForDOM, parseCSSProperties, addScrollLink} from '/src/scripts/modules/helpers.js';

const data = { navbar: { menu: [ { type: "list", isNav: true, content: [
    { type: "item", content: "Home", href: "/classes/vampire/bloodmorph.html" },
    { type: "item", content: "Classes", href: "/classes/vampire/bloodmorph.html" }
]}]}};
const styles = document.createElement('style');
const menu = createElement('div', { className: 'menu desktop-menu' });
document.body.appendChild(menu);
document.head.appendChild(styles);





waitForDOM().then(async () => {
    await getSources();
    await collectGeneratedFields();    
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    createMobileMenuButton();
});





async function getSources() {
    const sources = document.querySelectorAll('link[rel="data"]');
    for (const src of sources) {
        const id = src.getAttribute('data-id');
        data[id] = await fetchJSON(src.getAttribute('href'));
        if (!Array.isArray(data[id].cssRules))
            if (!data[id].cssRules.startsWith('inherit')) {
                console.warn(`No CSS rules found for ${id}`);
                console.log(`${id} loaded:`, data[id]);
                continue;
            } else data[id].cssRules = data[data[id].cssRules.split(':')[1]]?.cssRules || [];
            data[id].cssRules.forEach(style => {
            const selector = style.selector;
            const rule = style.rule;
            if (selector.startsWith('--')) document.documentElement.style.setProperty(selector, rule);
            else selector.split(',').map(s => s.trim()).forEach(singleSelector => 
                styles.sheet.insertRule(`.generated-${id} ${singleSelector} { ${rule} }`, styles.sheet.cssRules.length));
        });
        console.log(`${id} loaded:`, data[id]);
    }
}





async function collectGeneratedFields() {
    for (const element of document.querySelectorAll('.generate')) {
        const src = element.getAttribute('src');
        element.classList.remove('generate');
        element.classList.add(`generated${data[src] ? `-${src}` : ''}`);
        switch (element.getAttribute('gen-type')) {
            case 'navbar':      generateNavbar(element); break;
            case 'class' :      generateClass(src, element); break;
            case 'subclass' :   generateSubclass(src, element); break;
        }
    }
}





function generateNavbar(element) {
    const navbarElements = [];
    data.navbar.menu[0].content.forEach(item => navbarElements.push(createElement('a', { className: 'navbar-item', href: item.href }, [item.content])));
    const start =   createElement('div',    { className: 'navbar-start' },      navbarElements);
    const menu =    createElement('div',    { className: 'navbar-menu' },       [start]);
    const navbar =  createElement('nav',    { className: 'navbar desktop' },    [menu]);
    element.appendChild(navbar);
    updateMenu(data.navbar.menu);
}
function generateClass(src, element) {
    const section = key => {
        const div = createElement('div');
        div.append(generateContent(data[src][key]));
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
    updateMenu(data[src].menu || []);
}
function generateSubclass(src, element) {
    const section = key => {
        const div = createElement('div');
        div.append(generateContent(data[src][key]));
        return div;
    };
    const features =    section('features');
    const container =   createElement('div', 
        { className: 'container section is-flex is-flex-direction-column', style: { 'gap': '2rem' } }, 
        [ features ]
    );
    console.log(`${src} generated:`, container);
    element.appendChild(container);
    generateGallery(src);
    updateMenu(data[src].menu || []);
}





function updateMenu(items) {
    items.forEach(item => {
        if (item.type === 'label') menu.appendChild(createElement('span', { className: 'menu-label', content: item.content }));
        else {
            const list = createElement('ul', { className: `menu-list ${item.isNav ? 'mobile' : ''}` });
            menu.appendChild(list);
            [item.content].flat().forEach(subItem => {
                const li = createElement('a', { className: 'menu-item' }, [ subItem.content ]);
                list.appendChild(li);
                if (subItem.href) li.setAttribute('href', subItem.href);
                if (subItem.goto) addScrollLink(li, subItem.goto);
                if(subItem.id) {
                    const src = subItem.id.slice(0, -'-gallery-button'.length);
                    if (data[src]?.gallery) generateGallery(li, src);
                }
            });
        }
    });
}




function createMobileMenuButton() {
    const button = createElement('button', { className: 'mobile-menu-button', id: 'mobile-menu-button' }, [createElement('i', { className: 'fa-solid fa-bars' })]);
    button.addEventListener('click', () => {
        menu.classList.toggle('desktop-menu');
        menu.classList.toggle('mobile-menu-background');
    });
    document.body.appendChild(button);
}





function generateGallery(openButton, src) {
    const images = data[src].gallery;
    let idx = 0;
    const background =  createElement('div',    { className: 'gallery-background' });
    const leftBtn =     createElement('button', { className: 'gallery-button',  id: `${src}-gallery-left` },        [createElement('i', { className: 'fa-solid fa-chevron-left' })]);
    const rightBtn =    createElement('button', { className: 'gallery-button',  id: `${src}-gallery-right` },       [createElement('i', { className: 'fa-solid fa-chevron-right' })]);
    const img =         createElement('img',    { className: 'gallery-image',   id: `${src}-gallery-image` });
    const credit =      createElement('a',      { className: 'gallery-credit',  id: `${src}-gallery-credit`,        attributes: { href: images[idx].href, target: '_blank' } }, [images[idx].credit]);
    const imgBox =      createElement('div',    { className: 'gallery-box',     id: `${src}-gallery-image-box` },   [img, credit]);
    const galleryMenu = createElement('div',    { className: 'gallery-menu',    id: `${src}-gallery-menu` },        images.length > 1 ? [leftBtn, imgBox, rightBtn] : [imgBox]);
    const content =     createElement('div',    { className: 'gallery-content' }, [galleryMenu]);
    const closeButton = createElement('button', { className: 'gallery-close-button modal-close is-large',           attributes: { 'aria-label': 'Close' } });
    const gallery =     createElement('div',    { className: 'modal gallery' },                                     [content, closeButton, background]);
    
    img.src = images[0].src;
    document.body.appendChild(gallery);

    function openGallery()      { [gallery, background].forEach(el => el.classList.add('is-active'));    }
    function closeGallery()     { [gallery, background].forEach(el => el.classList.remove('is-active')); }
    function showImage(newIdx)  { 
        idx = (newIdx + images.length) % images.length; 
        img.src = images[idx].src;
        credit.textContent = images[idx].credit;
    }
    function handleKey(e) {
        if (!gallery.classList.contains('is-active')) return;
        switch (e.key) {
            case 'ArrowLeft':   showImage(idx - 1); break;
            case 'ArrowRight':  showImage(idx + 1); break;
            case 'Escape':      closeGallery();     break;
        }
    }

    leftBtn.onclick = () =>     showImage(idx - 1);
    rightBtn.onclick = () =>    showImage(idx + 1);
    openButton.onclick = () =>  openGallery();
    closeButton.onclick = () => closeGallery();
    background.onclick = () =>  closeGallery();
    window.addEventListener('keydown', handleKey);
}



function generateContent(data) {
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