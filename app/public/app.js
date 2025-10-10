let pages = [];
let currentPageId = null;
let isPreviewMode = false;

// Load all pages on startup
async function loadPages() {
    try {
        const response = await fetch('/api/pages');
        pages = await response.json();
        renderPagesList();
    } catch (error) {
        console.error('Error loading pages:', error);
        showStatus('Error loading pages', 'error');
    }
}

// Render pages list in sidebar
function renderPagesList() {
    const pagesList = document.getElementById('pagesList');
    pagesList.innerHTML = '';

    pages.forEach(page => {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item' + (page.id === currentPageId ? ' active' : '');
        pageItem.innerHTML = `
            <span class="page-title" onclick="selectPage(${page.id})">
                <i data-lucide="file-text"></i>
                ${escapeHtml(page.title)}
            </span>
            <button class="delete-btn" onclick="deletePage(${page.id}, event)" title="Delete note">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        pagesList.appendChild(pageItem);
    });

    // Re-initialize Lucide icons for the newly added elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Select a page and load its content
async function selectPage(pageId) {
    try {
        const response = await fetch(`/api/pages/${pageId}`);
        const page = await response.json();

        currentPageId = page.id;
        document.getElementById('pageTitle').value = page.title;
        document.getElementById('pageContent').value = page.content || '';

        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('editorArea').style.display = 'flex';

        // Reset to edit mode when selecting a new page
        if (isPreviewMode) {
            togglePreview();
        }

        renderPagesList();
    } catch (error) {
        console.error('Error loading page:', error);
        showStatus('Error loading page', 'error');
    }
}

// Add a new page
async function addPage() {
    try {
        const response = await fetch('/api/pages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Untitled Note',
                content: ''
            })
        });

        const newPage = await response.json();
        pages.unshift(newPage);
        renderPagesList();
        selectPage(newPage.id);
        showStatus('New note created', 'success');

        // Focus on title input for quick editing
        setTimeout(() => {
            const titleInput = document.getElementById('pageTitle');
            titleInput.focus();
            titleInput.select();
        }, 100);
    } catch (error) {
        console.error('Error creating page:', error);
        showStatus('Error creating note', 'error');
    }
}

// Save current page
async function savePage() {
    if (!currentPageId) return;

    try {
        const title = document.getElementById('pageTitle').value.trim() || 'Untitled Note';
        const content = document.getElementById('pageContent').value;

        const response = await fetch(`/api/pages/${currentPageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        const updatedPage = await response.json();

        // Update pages list
        const pageIndex = pages.findIndex(p => p.id === currentPageId);
        if (pageIndex !== -1) {
            pages[pageIndex] = updatedPage;
            renderPagesList();
        }

        showStatus('Note saved successfully', 'success');
    } catch (error) {
        console.error('Error saving page:', error);
        showStatus('Error saving note', 'error');
    }
}

// Refresh current page
async function refreshPage() {
    if (!currentPageId) return;

    try {
        const response = await fetch(`/api/pages/${currentPageId}`);
        const page = await response.json();

        document.getElementById('pageTitle').value = page.title;
        document.getElementById('pageContent').value = page.content || '';

        // Update preview if in preview mode
        if (isPreviewMode) {
            const preview = document.getElementById('markdownPreview');
            preview.innerHTML = marked.parse(page.content || '');
        }

        showStatus('Note refreshed', 'success');
    } catch (error) {
        console.error('Error refreshing page:', error);
        showStatus('Error refreshing note', 'error');
    }
}

// Delete a page
async function deletePage(pageId, event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        await fetch(`/api/pages/${pageId}`, {
            method: 'DELETE'
        });

        pages = pages.filter(p => p.id !== pageId);

        if (currentPageId === pageId) {
            currentPageId = null;
            document.getElementById('emptyState').style.display = 'flex';
            document.getElementById('editorArea').style.display = 'none';
        }

        renderPagesList();
        showStatus('Note deleted', 'success');
    } catch (error) {
        console.error('Error deleting page:', error);
        showStatus('Error deleting note', 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;

    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 3000);
}

// Toggle between edit and preview mode
function togglePreview() {
    const textarea = document.getElementById('pageContent');
    const preview = document.getElementById('markdownPreview');
    const toggleBtn = document.getElementById('togglePreview');

    isPreviewMode = !isPreviewMode;

    if (isPreviewMode) {
        // Switch to preview mode
        const content = textarea.value;
        preview.innerHTML = marked.parse(content);

        textarea.classList.add('hidden');
        preview.classList.add('active');
        toggleBtn.classList.add('active');

        // Update icon
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', 'edit-3');
            lucide.createIcons();
        }
    } else {
        // Switch to edit mode
        textarea.classList.remove('hidden');
        preview.classList.remove('active');
        toggleBtn.classList.remove('active');

        // Update icon
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', 'eye');
            lucide.createIcons();
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentPageId) {
            savePage();
        }
    }

    // Ctrl/Cmd + N to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addPage();
    }

    // Ctrl/Cmd + P to toggle preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (currentPageId) {
            togglePreview();
        }
    }
});

// Auto-save functionality (save after 2 seconds of inactivity)
let autoSaveTimeout;
const titleInput = document.getElementById('pageTitle');
const contentTextarea = document.getElementById('pageContent');

function setupAutoSave() {
    [titleInput, contentTextarea].forEach(element => {
        element.addEventListener('input', () => {
            if (!currentPageId) return;

            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                savePage();
            }, 2000);
        });
    });
}

// Initialize app
loadPages();
setupAutoSave();
