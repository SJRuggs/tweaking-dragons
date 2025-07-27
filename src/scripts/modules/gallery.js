import { createElement } from '/src/scripts/modules/genericContent.js';

/**
 * Generate a gallery for the specified source
 * @param {Array} images - Array of image objects with src and credit properties
 * @param {string} src - The source identifier for the gallery
 * @param {HTMLElement} openButton - The button that opens the gallery
 */
export function generateGallery(images, src, openButton) {
    // set the initial index and touchscreen tracker
    let idx = 0;
    let touchStartX = null;

    // create the gallery elements
    const background =  createElement('div',    { className: 'gallery-background' });
    const leftBtn =     createElement('button', { className: 'gallery-arrow',   id: `${src}-gallery-left` },        [createElement('i', { className: 'fa-solid fa-chevron-left' })]);
    const rightBtn =    createElement('button', { className: 'gallery-arrow',   id: `${src}-gallery-right` },       [createElement('i', { className: 'fa-solid fa-chevron-right' })]);
    const img =         createElement('img',    { className: 'gallery-image',   id: `${src}-gallery-image` });
    const credit =      createElement('a',      { className: 'gallery-credit',  id: `${src}-gallery-credit`,        attributes: { href: images[idx].href, target: '_blank' } }, [images[idx].credit]);
    const imgBox =      createElement('div',    { className: 'gallery-box',     id: `${src}-gallery-image-box` },   [img, credit]);
    const galleryMenu = createElement('div',    { className: 'gallery-menu',    id: `${src}-gallery-menu` },        images.length > 1 ? [leftBtn, imgBox, rightBtn] : [imgBox]);
    const content =     createElement('div',    { className: 'gallery-content' },                                   [galleryMenu]);
    const gallery =     createElement('div',    { className: 'modal gallery' },                                     [content, background]);
    
    // append the gallery to the body and set the initial image
    img.src = images[0].src;
    document.body.appendChild(gallery);

    // define functions to handle gallery interactions
    function openGallery()      { [gallery, background].forEach(el => el.classList.add('is-active'));    }
    function closeGallery()     { [gallery, background].forEach(el => el.classList.remove('is-active')); }
    function showImage(newIdx)  { 
        idx = (newIdx + images.length) % images.length; 
        img.src = images[idx].src;
        credit.setAttribute('href', images[idx].href);
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
    function touchStart(e) { touchStartX = e.touches[0].clientX; }
    function touchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) showImage(idx + 1); // Swipe left
        else if (touchEndX - touchStartX > 50) showImage(idx - 1); // Swipe right
    }
    function popStateHandler(event) {
        if (gallery.classList.contains('is-active')) {
            closeGallery();
            event.preventDefault();
        }
    }

    // assign event listeners
    leftBtn.onclick = () =>     showImage(idx - 1);
    rightBtn.onclick = () =>    showImage(idx + 1);
    openButton.onclick = () =>  openGallery();
    background.onclick = () =>  closeGallery();
    img.addEventListener(       'touchstart',   touchStart);
    img.addEventListener(       'touchend',     touchEnd);
    window.addEventListener(    'keydown',      handleKey);
    window.addEventListener(    'popstate',     popStateHandler);
}