// Import helper functions from the helpers module
import { fetchJSON, createElement, waitForDOM, parseCSSProperties} from '../modules/helpers.js';

const data = {};

// Helper function to parse CSS properties from string or array format

// Initialize after DOM is ready
waitForDOM().then(() => {
    document.querySelectorAll('.class-table').forEach(table => generateClassTable(table));
});






async function generateClassTable(tableElement) {
    const classID = tableElement.id.replace('-class-table', '');
    data[classID] = await fetchJSON(`data/classes/${classID}.json`);
    
    // Clear existing content
    tableElement.innerHTML = '';
    
    // Create table header and store column styles
    const thead = createElement('thead');
    const columnStyles = []; // Store styles for each column
    
    // Handle new double-header structure
    data[classID].classTable.header.rows.forEach((headerRow, rowIndex) => {
        const tr = createElement('tr');
        
        headerRow.cells.forEach((headerCell, cellIndex) => {
            const headerStyle = parseCSSProperties(headerCell.CSSProperties);
            
            // Store css styles for this column
            columnStyles[cellIndex] = headerStyle;
            const finalStyle = rowIndex < data[classID].classTable.header.rows.length - 1 
                ? { ...headerStyle, borderBottom: '0px', paddingBottom: '0px' }
                : data[classID].classTable.header.rows.length > 1 
                    ? { ...headerStyle, paddingTop: '0px' }
                    : headerStyle;
            
            const th = createElement('th', {
                content: headerCell.content,
                style: finalStyle,
                attributes: headerCell.colspan ? { 'colspan': headerCell.colspan.toString() } : {}
            });
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });
    
    tableElement.appendChild(thead);
    
    // Create table body
    const tbody = createElement('tbody');
    data[classID].classTable.rows.forEach((row, rowIndex) => {
        const tr = createElement('tr', {
            properties: {
                onclick: (event) => {
                    // Only trigger if the click didn't come from an anchor link
                    if (event.target.tagName !== 'A') {
                        const targetId = `${classID}-level-${rowIndex + 1}`;
                        console.log(`Navigating to: #${targetId}`);
                        
                        // Navigate to the level section
                        window.location.hash = targetId;
                        
                        // Smooth scroll to the element if it exists
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            },
            style: { cursor: 'pointer' } // Visual feedback that row is clickable
        });
        row.forEach((cell, columnIndex) => {
            // Merge column style with any cell-specific styles
            const cellStyle = parseCSSProperties(cell.content?.CSSProperties);
            
            const td = createElement('td', {
                style: { ...columnStyles[columnIndex], ...cellStyle }
            });
            
            // Handle different content types
            switch (cell.content?.type) {
                case 'text':
                    td.textContent = cell.content.content;
                    break;
                    
                case 'features':
                    // Create feature list with Bulma styling
                    const featureContainer = createElement('div', { className: 'content' });
                    
                    cell.content.content.forEach((feature, index) => {
                        const featureLink = createElement('a', {
                            content: feature.name,
                            attributes: { 
                                'href': `#${feature.id}`,
                                'title': `Go to ${feature.name} description`
                            },
                            properties: {
                                onclick: (event) => {
                                    console.log(`Navigating to: #${feature.id}`);
                                    
                                    // Smooth scroll to the element if it exists
                                    const targetElement = document.getElementById(feature.id);
                                    if (targetElement) {
                                        event.preventDefault(); // Prevent default hash navigation
                                        targetElement.scrollIntoView({ behavior: 'smooth' });
                                        window.location.hash = feature.id;
                                    }
                                }
                            }
                        });
                        featureContainer.appendChild(featureLink);
                        
                        // Add comma separator except for last item
                        if (index < cell.content.content.length - 1) {
                            featureContainer.appendChild(document.createTextNode(', '));
                        }
                    });
                    
                    td.appendChild(featureContainer);
                    break;
                    
                default:
                    td.textContent = cell.content || '—';
                    break;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    tableElement.appendChild(tbody);
}







