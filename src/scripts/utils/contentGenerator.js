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
        console.log(`${id} loaded:`, data[id]);
    }
}





async function collectGeneratedFields() {
    for (const element of document.querySelectorAll('.generate')) {
        const src = element.getAttribute('src');
        element.classList.remove('generate');
        element.classList.add(`generated-${src}`);
        switch (element.getAttribute('gen-type')) {
            case 'class' : generateClass(src, element); break;
        }
    }
}





function generateClass(src, element) {
    const section = key => {
        const div = createElement('div');
        div.append(generateContent(data[src][key]));
        return div;
    };
    const menu =        section('menu');
    const title =       section('title');
    const classTable =  section('classTable');
    const levels =      section('levels');
    const container =   createElement('div', 
        { className: 'container section is-flex is-flex-direction-column', style: { 'gap': '2rem' } }, 
        [ title, classTable, levels, menu ]
    );
    console.log(`${src} generated:`, container);
    element.appendChild(container);
    generateGallery(src); // optional gallery generation
}





function generateGallery(src) {
    const openButton = document.getElementById(`${src}-gallery-button`);
    const images = data[src].gallery || [];
    if (!images.length || !openButton) return;

    let idx = 0;

    const background = createElement('div',     { style: parseCSSProperties('background:rgba(0,0,0,0.7);position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:1;'), className: 'gallery-background' });
    const leftBtn = createElement('button',     { style: parseCSSProperties('font-size:2rem;background:none;border:none;cursor:pointer;'), id: `${src}-gallery-left` }, [createElement('i', { className: 'fa-solid fa-chevron-left' })]);
    const rightBtn = createElement('button',    { style: parseCSSProperties('font-size:2rem;background:none;border:none;cursor:pointer;'), id: `${src}-gallery-right` }, [createElement('i', { className: 'fa-solid fa-chevron-right' })]);
    const img = createElement('img',            { style: parseCSSProperties('width:60vw;height:90vh;object-fit:contain;border-radius:1rem;'), id: `${src}-gallery-image` });
    const credit = createElement('span',        { style: parseCSSProperties('font-size:0.8rem;'), id: `${src}-gallery-credit`, className: "img-credit" }, [images[idx].credit]);
    const imgBox = createElement('a',           { style: parseCSSProperties('flex:1;display:flex;justify-content:center;align-items:center;flex-direction:column;'), attributes: { href: images[idx].href, target: '_blank' } }, [credit, img]);
    const galleryMenu = createElement('div',    { style: parseCSSProperties('display:flex;align-items:center;justify-content:center;gap:2rem;min-height:10rem;'), id: 'image-gallery-menu' }, [leftBtn, imgBox, rightBtn]);
    const content = createElement('div',        { style: parseCSSProperties('z-index:2;position:relative;'), className: 'gallery-content' }, [galleryMenu]);
    const closeButton = createElement('button', { style: parseCSSProperties('z-index:2;'), className: 'gallery-close-button modal-close is-large', attributes: { 'aria-label': 'Close' } });
    const gallery = createElement('div',        { className: 'modal gallery' }, [background, content, closeButton]);
    
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