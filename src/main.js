import { UIManager } from './uiManager.js';
import { analyzeDocumentWithGemini } from './geminiService.js';
import { loadPdf, extractText, renderPdf, extractReferencesFromPdf } from './pdfService.js';

const ui = new UIManager();

async function processPdfFile(file) {
    ui.showLoading('Loading and reading PDF...');
    try {
        const pdfDoc = await loadPdf(file);
        const fullText = await extractText(pdfDoc);

        const cacheKey = 'gemini-cache-v3-' + hashString(fullText);
        let analysis = null;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                analysis = JSON.parse(cachedData);
                console.log('[App] Loaded analysis from cache.');
            } catch (e) {
                localStorage.removeItem(cacheKey);
            }
        }

        if (!analysis) {
            ui.showLoading('Analyzing with AI... This may take a moment.');
            analysis = await analyzeDocumentWithGemini(fullText);
            try {
                localStorage.setItem(cacheKey, JSON.stringify(analysis));
            } catch (e) {
                console.error("Failed to save to localStorage:", e);
            }
        }
        
        ui.displaySummary(analysis.paper_summary);
        ui.displayKeywords(analysis.keywords);
        ui.displayPeople(analysis.people);
        ui.displayEmails(analysis.emails);

        ui.showLoading('Extracting references from PDF...');
        const { referenceMap } = await extractReferencesFromPdf(pdfDoc);

        ui.showLoading('Rendering document...');
        await renderPdf(
            pdfDoc,
            analysis.keywords,
            analysis.people,
            analysis.emails,
            referenceMap,
            analysis.section_analysis
        );
        ui.showViewer();
    } catch (err) {
        console.error('An error occurred during processing:', err);
        ui.showError(`An error occurred: ${err.message}. Please try another file.`);
    } finally {
        ui.hideLoading();
    }
}

function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString();
}

function initialize() {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    
    // **FIX:** Added logic for the welcome splash screen
    const splash = document.getElementById('welcome-splash');
    const closeSplash = document.getElementById('close-splash');
    if (splash && closeSplash && !localStorage.getItem('hideSplash')) {
        splash.classList.remove('hidden');
        closeSplash.addEventListener('click', () => {
            splash.classList.add('hidden');
            localStorage.setItem('hideSplash', 'true');
        });
    }

    if (ui.uploadInput) {
        document.body.addEventListener('dragover', (e) => e.preventDefault());
        document.body.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') processPdfFile(file);
        });
        ui.uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) processPdfFile(file);
        });
    }
    
    ui.initialize();
}

initialize();