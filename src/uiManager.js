export class UIManager {
    constructor() {
        this.uploadInput = document.getElementById('pdf-upload');
        this.viewerContainer = document.getElementById('pdf-viewer-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.loadingText = document.getElementById('loading-text');
        this.tooltip = document.getElementById('tooltip');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggles = document.querySelectorAll('#sidebar-toggle, #sidebar-toggle-close');
        this.sidebarSummary = document.getElementById('sidebar-summary');
        this.sidebarKeywords = document.getElementById('sidebar-keywords');
        this.sidebarPeople = document.getElementById('sidebar-people');
        this.sidebarEmails = document.getElementById('sidebar-emails');
        this.copySummaryBtn = document.getElementById('copy-summary');
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        
        this.activeTooltipTarget = null;
    }

    initialize() {
        this.initializeTooltipEvents();
        this.initializeCopySummary();
        this.initializeThemeToggle();
        this.initializeSidebar();
    }
    
    positionTooltip(anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        this.tooltip.style.left = `${rect.left + window.scrollX}px`;
        this.tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
    }

    hideTooltip() {
        this.activeTooltipTarget = null;
        this.tooltip.style.visibility = 'hidden';
        this.tooltip.style.opacity = '0';
    }

    addSectionSummaryIcon({ summary, top, left, pageElement }) {
        const icon = document.createElement('span');
        icon.className = 'section-summary-icon';
        icon.textContent = '✨';
        icon.style.top = top;
        icon.style.left = `calc(${left} - 24px)`;
        icon.dataset.tooltip = summary;
        pageElement.appendChild(icon);
    }

    initializeTooltipEvents() {
        // This single handler now manages all tooltips (keywords, people, sections)
        this.viewerContainer.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (target.dataset.tooltip) {
                this.activeTooltipTarget = target;
                this.tooltip.innerHTML = target.dataset.tooltip.replace(/\n/g, '<br>');
                this.positionTooltip(target);
                this.tooltip.style.visibility = 'visible';
                this.tooltip.style.opacity = '1';
            }
        });
        this.viewerContainer.addEventListener('mouseout', (e) => {
            if (e.target.dataset.tooltip) {
                this.hideTooltip();
            }
        });
        
        // This handles clicks for references to open Google Search
        this.viewerContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.reference-clickable');
            if (target && target.dataset.fullReferenceText) {
                const query = target.dataset.fullReferenceText;
                const cleanedQuery = query.replace(/^\[\d+\]\s*/, '');
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanedQuery)}&btnI=1`;
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
            }
        });
    }

    displayPeople(people) {
        if (!this.sidebarPeople) return;
        this.sidebarPeople.innerHTML = '';
        (people || []).forEach(person => {
            const chip = document.createElement('span');
            chip.className = 'person-chip';
            chip.textContent = person.name;
            // The description is now added as a tooltip, just like keywords.
            chip.dataset.tooltip = person.description;
             // Add hover listeners to the sidebar chips for the generic tooltip
            chip.addEventListener('mouseenter', (e) => {
                this.activeTooltipTarget = e.currentTarget;
                this.tooltip.innerHTML = e.currentTarget.dataset.tooltip;
                this.positionTooltip(e.currentTarget);
                this.tooltip.style.visibility = 'visible';
                this.tooltip.style.opacity = '1';
            });
            chip.addEventListener('mouseleave', () => this.hideTooltip());
            this.sidebarPeople.appendChild(chip);
        });
    }
    
    displayKeywords(keywords) {
        if (!this.sidebarKeywords) return;
        this.sidebarKeywords.innerHTML = '';
        (keywords || []).forEach(kw => {
            const chip = document.createElement('span');
            chip.className = 'keyword-chip';
            chip.textContent = kw.term;
            chip.dataset.tooltip = kw.definition;
             // Add hover listeners to the sidebar chips for the generic tooltip
            chip.addEventListener('mouseenter', (e) => {
                this.activeTooltipTarget = e.currentTarget;
                this.tooltip.innerHTML = e.currentTarget.dataset.tooltip;
                this.positionTooltip(e.currentTarget);
                this.tooltip.style.visibility = 'visible';
                this.tooltip.style.opacity = '1';
            });
            chip.addEventListener('mouseleave', () => this.hideTooltip());
            this.sidebarKeywords.appendChild(chip);
        });
    }
    
    displaySummary(summary) { if (this.sidebarSummary) this.sidebarSummary.textContent = summary; }

    displayEmails(emails) {
        if (!this.sidebarEmails) return;
        this.sidebarEmails.innerHTML = '';
        (emails || []).forEach(email => {
            const chip = document.createElement('span');
            chip.className = 'email-chip';
            chip.textContent = email;
            this.sidebarEmails.appendChild(chip);
        });
    }
    
    showLoading(message) {
        this.loadingText.textContent = message;
        this.loadingIndicator.classList.remove('hidden');
    }

    hideLoading() { this.loadingIndicator.classList.add('hidden'); }

    showError(message) {
        this.loadingText.textContent = message;
        this.loadingIndicator.classList.remove('hidden');
    }

    showViewer() {
        const container = document.getElementById('pdf-viewer-container');
        if(container) container.classList.remove('hidden');
    }
    
    initializeSidebar() {
        if (!this.sidebar || !this.sidebarToggles) return;
        
        this.sidebarToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.sidebar.classList.toggle('translate-x-full');
                this.sidebar.classList.toggle('translate-x-0');
            });
        });
    }

    initializeCopySummary() {
        if (!this.copySummaryBtn || !this.sidebarSummary) return;
        this.copySummaryBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(this.sidebarSummary.textContent);
                const icon = this.copySummaryBtn.querySelector('span.material-icons');
                const text = this.copySummaryBtn.querySelector('span:not(.material-icons)');
                
                const originalIcon = icon.textContent;
                const originalText = text.textContent;

                icon.textContent = 'check';
                text.textContent = 'Copied!';
                
                setTimeout(() => {
                    icon.textContent = originalIcon;
                    text.textContent = originalText;
                }, 1500);
            } catch {
                alert('Failed to copy summary.');
            }
        });
     }

    initializeThemeToggle() {
        if (!this.themeToggle || !this.themeIcon) return;
        
        const applyTheme = (isDark) => {
            if (isDark) {
                document.documentElement.classList.add('dark');
                this.themeIcon.textContent = 'light_mode';
            } else {
                document.documentElement.classList.remove('dark');
                this.themeIcon.textContent = 'dark_mode';
            }
        };

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');

        applyTheme(savedTheme === 'dark' || (savedTheme === null && prefersDark));

        this.themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            applyTheme(isDark);
        });
    }
}