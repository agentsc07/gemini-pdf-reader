import { UIManager } from './uiManager.js';
const ui = new UIManager();

async function loadPdf(file) {
    const typedarray = new Uint8Array(await file.arrayBuffer());
    return window.pdfjsLib.getDocument(typedarray).promise;
}

async function extractText(pdfDoc) {
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ');
    }
    return fullText;
}

async function renderPdf(pdfDoc, keywords, people, emails, referenceMap, sectionAnalysis) {
    const pagesContainer = document.getElementById('pdf-pages-container');
    pagesContainer.innerHTML = '';

    for (let num = 1; num <= pdfDoc.numPages; num++) {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 });
        const pageDiv = document.createElement('div');
        pageDiv.className = 'pdf-page';
        pageDiv.dataset.pageNumber = num;
        const canvas = document.createElement('canvas');
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        pageDiv.appendChild(canvas);
        pageDiv.appendChild(textLayerDiv);
        pagesContainer.appendChild(pageDiv);

        const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        };

        await page.render(renderContext).promise;
        
        const textContent = await page.getTextContent();
        const textDivs = [];
        window.pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: textDivs
        });
        
        highlightKeywords(textDivs, keywords, people, emails, referenceMap);
        placeSectionSummaryIcons(textDivs, sectionAnalysis, pageDiv);
    }
}


function placeSectionSummaryIcons(textDivs, sectionAnalysis, pageElement) {
    if (!sectionAnalysis || sectionAnalysis.length === 0) return;

    const placedTitles = new Set();
    sectionAnalysis.forEach(section => {
        const cleanAITitle = section.section_title.replace(/^\d+\.?\s*/, '').toLowerCase().trim();
        if(placedTitles.has(cleanAITitle)) return;

        for (const span of textDivs) {
            const spanText = span.textContent.toLowerCase().trim();
            if (spanText.includes(cleanAITitle) && spanText.length < cleanAITitle.length + 20) {
                ui.addSectionSummaryIcon({
                    summary: section.section_summary,
                    top: span.style.top,
                    left: span.style.left,
                    pageElement: pageElement
                });
                placedTitles.add(cleanAITitle);
                break; 
            }
        }
    });
}

function highlightKeywords(textDivs, keywords, people, emails, referenceMap) {
    if (!textDivs || textDivs.length === 0) return;

    const textEntities = [
        ...keywords.map(kw => ({ text: kw.term, type: 'keyword', data: kw.definition })),
        ...people.map(p => ({ text: p.name, type: 'person', data: p.description })),
        ...emails.map(e => ({ text: e, type: 'email' })),
    ].filter(e => e.text && e.text.trim() !== '');
    
    const citationRegex = /\[(\d{1,3}(?:\s*[,-]\s*\d{1,3})*)\]/g;
    const textEntityRegex = textEntities.length > 0 ? new RegExp(
        textEntities
            .map(e => e.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
            .sort((a, b) => b.length - a.length)
            .join('|'),
        'gi'
    ) : null;

    textDivs.forEach(span => {
        if (!span.textContent.trim()) return;
        
        const originalHtml = span.innerHTML;
        const matches = [];

        // Find all text-based entity matches
        if (textEntityRegex) {
            for (const match of span.textContent.matchAll(textEntityRegex)) {
                const entity = textEntities.find(e => e.text.toLowerCase() === match[0].toLowerCase());
                if (entity) {
                    matches.push({ match, type: 'text', entity });
                }
            }
        }

        // Find all citation matches
        for (const match of span.textContent.matchAll(citationRegex)) {
            matches.push({ match, type: 'citation' });
        }

        if (matches.length === 0) return;

        // Sort all found matches by their starting position
        matches.sort((a, b) => a.match.index - b.match.index);

        let finalHtml = '';
        let lastIndex = 0;

        matches.forEach(({ match, type, entity }) => {
            // Skip overlapping matches
            if (match.index < lastIndex) return;

            // Add the text between the last match and this one
            finalHtml += originalHtml.substring(lastIndex, match.index);

            const matchedText = match[0];
            let replacementHtml = matchedText; // Default to original text

            if (type === 'citation') {
                const innerContent = match[1];
                const partRegex = /(\d+(?:-\d+)?)/g;
                let lastPartIndex = 0;
                let htmlParts = [];
                for (const partMatch of innerContent.matchAll(partRegex)) {
                    htmlParts.push(innerContent.substring(lastPartIndex, partMatch.index));
                    const partText = partMatch[0];
                    let refs = [];
                    if (partText.includes('-')) {
                        const [start, end] = partText.split('-').map(s => parseInt(s.trim()));
                        if (!isNaN(start) && !isNaN(end)) for (let k = start; k <= end; k++) refs.push(k);
                    } else {
                        const n = parseInt(partText.trim());
                        if (!isNaN(n)) refs.push(n);
                    }
                    const fullRefText = referenceMap[refs[0]] || `Reference ${refs[0]} not found`;
                    const escapedTooltip = fullRefText.replace(/"/g, '&quot;');
                    htmlParts.push(`<span class="reference-marker reference-clickable" data-tooltip="${escapedTooltip}" data-full-reference-text="${escapedTooltip}">${partText}</span>`);
                    lastPartIndex = partMatch.index + partText.length;
                }
                replacementHtml = `[${htmlParts.join('')}${innerContent.substring(lastPartIndex)}]`;
            } else if (type === 'text' && entity) {
                let className = '';
                const tooltip = (entity.data || '').replace(/"/g, '&quot;');
                switch(entity.type) {
                    case 'keyword': className = 'highlight'; break;
                    case 'person': className = 'person-marker'; break;
                    case 'email': className = 'email-marker'; break;
                }
                replacementHtml = `<span class="${className}" data-tooltip="${tooltip}">${matchedText}</span>`;
            }

            finalHtml += replacementHtml;
            lastIndex = match.index + matchedText.length;
        });

        // Add the rest of the original string after the last match
        finalHtml += originalHtml.substring(lastIndex);
        span.innerHTML = finalHtml;
    });
}

async function extractReferencesFromPdf(pdfDoc) {
    const numPages = pdfDoc.numPages;
    let combinedText = '';

    for (let i = Math.max(1, numPages - 2); i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        combinedText += content.items.map(item => item.str).join(' ');
    }
    
    const refHeaderMatch = combinedText.match(/(References|BIBLIOGRAPHY|Reference List|Works Cited)/i);
    let refBlockText = combinedText;
    if (refHeaderMatch) {
        refBlockText = combinedText.substring(refHeaderMatch.index);
    }

    const referenceMap = {};
    const markerRegex = /\[(\d{1,3})\]/g;
    const matches = [...refBlockText.matchAll(markerRegex)];

    if (matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const nextMatch = matches[i + 1];

            const refNumber = parseInt(currentMatch[1]);
            if (isNaN(refNumber)) continue;

            const startIdx = currentMatch.index;
            const endIdx = nextMatch ? nextMatch.index : refBlockText.length;
            
            let refText = refBlockText.substring(startIdx, endIdx).trim().replace(/\s+/g, ' ');
            referenceMap[refNumber] = refText;
        }
    }
    return { referenceMap };
}

export { loadPdf, extractText, renderPdf, extractReferencesFromPdf };