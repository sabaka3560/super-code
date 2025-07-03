// Global state
let currentFile = null;
let files = [];
let isPreviewMode = false;
let isDirty = false;

// DOM elements
let elements = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadFiles();
});

function initializeElements() {
    elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        errorMessage: document.getElementById('errorMessage'),
        errorText: document.getElementById('errorText'),
        appLayout: document.getElementById('appLayout'),
        createFileBtn: document.getElementById('createFileBtn'),
        createFileForm: document.getElementById('createFileForm'),
        newFileName: document.getElementById('newFileName'),
        filesList: document.getElementById('filesList'),
        mobileFileSelect: document.getElementById('mobileFileSelect'),
        currentFileName: document.getElementById('currentFileName'),
        currentFileLanguage: document.getElementById('currentFileLanguage'),
        noFileSelected: document.getElementById('noFileSelected'),
        codeEditor: document.getElementById('codeEditor'),
        codePreview: document.getElementById('codePreview'),
        previewCode: document.getElementById('previewCode'),
        previewToggle: document.getElementById('previewToggle'),
        saveBtn: document.getElementById('saveBtn'),
        saveText: document.getElementById('saveText'),
        lineCount: document.getElementById('lineCount'),
        charCount: document.getElementById('charCount'),
        currentLanguage: document.getElementById('currentLanguage'),
        createdDate: document.getElementById('createdDate')
    };
}

function setupEventListeners() {
    // Create file button
    elements.createFileBtn.addEventListener('click', showCreateForm);
    
    // Code editor
    elements.codeEditor.addEventListener('input', handleEditorChange);
    elements.codeEditor.addEventListener('keydown', handleKeyDown);
    
    // Auto-save on blur
    elements.codeEditor.addEventListener('blur', () => {
        if (isDirty && currentFile) {
            saveFile();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyDown);
}

function handleGlobalKeyDown(e) {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (currentFile) saveFile();
    }
    
    // Ctrl+N to create new file
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showCreateForm();
    }
    
    // Escape to hide forms
    if (e.key === 'Escape') {
        hideCreateForm();
        hideError();
    }
}

function handleKeyDown(e) {
    // Tab key handling
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const value = e.target.value;
        
        if (e.shiftKey) {
            // Remove indentation
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            if (value.substring(lineStart, lineStart + 2) === '  ') {
                e.target.value = value.substring(0, lineStart) + value.substring(lineStart + 2);
                e.target.selectionStart = e.target.selectionEnd = start - 2;
            }
        } else {
            // Add indentation
            e.target.value = value.substring(0, start) + '  ' + value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
        
        handleEditorChange();
    }
}

// API functions
async function loadFiles() {
    try {
        showLoading();
        const response = await fetch('/api/files');
        const data = await response.json();
        
        if (data.success) {
            files = data.files;
            renderFilesList();
            renderMobileSelect();
            
            // Select first file if available
            if (files.length > 0 && !currentFile) {
                selectFile(files[0]);
            }
        } else {
            showError(data.error || 'Failed to load files');
        }
    } catch (error) {
        console.error('Error loading files:', error);
        showError('Failed to connect to server');
    } finally {
        hideLoading();
    }
}

async function createFile(event) {
    event.preventDefault();
    
    const name = elements.newFileName.value.trim();
    if (!name) return;
    
    try {
        elements.createFileBtn.disabled = true;
        
        const response = await fetch('/api/files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                content: '// Start coding here...\n'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            files.push(data.file);
            renderFilesList();
            renderMobileSelect();
            selectFile(data.file);
            hideCreateForm();
            showToast('File created successfully!', 'success');
        } else {
            showError(data.error || 'Failed to create file');
        }
    } catch (error) {
        console.error('Error creating file:', error);
        showError('Failed to create file');
    } finally {
        elements.createFileBtn.disabled = false;
    }
}

async function saveFile() {
    if (!currentFile || !isDirty) return;
    
    try {
        elements.saveBtn.disabled = true;
        elements.saveText.textContent = 'Saving...';
        
        const content = elements.codeEditor.value;
        
        const response = await fetch(`/api/files/${currentFile.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentFile.content = content;
            isDirty = false;
            updateFileInList(data.file);
            showToast('File saved!', 'success');
        } else {
            showError(data.error || 'Failed to save file');
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showError('Failed to save file');
    } finally {
        elements.saveBtn.disabled = false;
        elements.saveText.textContent = 'Save';
    }
}

async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            files = files.filter(f => f.id !== fileId);
            renderFilesList();
            renderMobileSelect();
            
            if (currentFile && currentFile.id === fileId) {
                currentFile = null;
                if (files.length > 0) {
                    selectFile(files[0]);
                } else {
                    showNoFileSelected();
                }
            }
            
            showToast('File deleted!', 'success');
        } else {
            showError(data.error || 'Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        showError('Failed to delete file');
    }
}

async function renameFile(fileId, newName) {
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateFileInList(data.file);
            if (currentFile && currentFile.id === fileId) {
                currentFile = data.file;
                updateEditorHeader();
            }
            renderMobileSelect();
            showToast('File renamed!', 'success');
        } else {
            showError(data.error || 'Failed to rename file');
        }
    } catch (error) {
        console.error('Error renaming file:', error);
        showError('Failed to rename file');
    }
}

// UI functions
function renderFilesList() {
    const container = elements.filesList;
    container.innerHTML = '';
    
    files.forEach(file => {
        const item = createFileItem(file);
        container.appendChild(item);
    });
}

function createFileItem(file) {
    const item = document.createElement('div');
    item.className = `file-item ${currentFile && currentFile.id === file.id ? 'active' : ''}`;
    item.onclick = () => selectFile(file);
    
    item.innerHTML = `
        <div class="file-main">
            <i data-lucide="file-text"></i>
            <span class="file-name" id="fileName-${file.id}">${file.name}</span>
            <div class="file-actions">
                <button class="file-action" onclick="event.stopPropagation(); startRename('${file.id}')" title="Rename">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="file-action" onclick="event.stopPropagation(); copyFileContent('${file.id}')" title="Copy">
                    <i data-lucide="copy"></i>
                </button>
                <button class="file-action" onclick="event.stopPropagation(); downloadSingleFile('${file.id}')" title="Download">
                    <i data-lucide="download"></i>
                </button>
                <button class="file-action danger" onclick="event.stopPropagation(); deleteFile('${file.id}')" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
        <div class="file-meta">
            <span>${file.language} • ${file.content.length} chars</span>
            <span>${new Date(file.createdAt).toLocaleDateString()}</span>
        </div>
    `;
    
    return item;
}

function renderMobileSelect() {
    const select = elements.mobileFileSelect;
    select.innerHTML = '<option value="">Select a file</option>';
    
    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file.id;
        option.textContent = file.name;
        if (currentFile && currentFile.id === file.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function selectFile(file) {
    // Save current file if dirty
    if (isDirty && currentFile) {
        saveFile();
    }
    
    currentFile = file;
    isDirty = false;
    
    // Update UI
    updateEditorHeader();
    elements.codeEditor.value = file.content;
    updateStats();
    
    // Show editor
    elements.noFileSelected.classList.add('hidden');
    elements.codeEditor.classList.remove('hidden');
    
    // Update preview if in preview mode
    if (isPreviewMode) {
        updatePreview();
    }
    
    // Update active file in sidebar
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.file-item[onclick*="${file.id}"]`)?.classList.add('active');
    
    // Update mobile select
    elements.mobileFileSelect.value = file.id;
    
    // Re-initialize Lucide icons
    lucide.createIcons();
}

function selectMobileFile() {
    const fileId = elements.mobileFileSelect.value;
    if (fileId) {
        const file = files.find(f => f.id === fileId);
        if (file) selectFile(file);
    } else {
        showNoFileSelected();
    }
}

function showNoFileSelected() {
    currentFile = null;
    elements.noFileSelected.classList.remove('hidden');
    elements.codeEditor.classList.add('hidden');
    elements.codePreview.classList.add('hidden');
    elements.currentFileName.textContent = 'Select a file';
    elements.currentFileLanguage.textContent = '';
    elements.saveBtn.disabled = true;
}

function updateEditorHeader() {
    if (!currentFile) return;
    
    elements.currentFileName.textContent = currentFile.name;
    elements.currentFileLanguage.textContent = currentFile.language;
    elements.createdDate.textContent = `Created: ${new Date(currentFile.createdAt).toLocaleString()}`;
}

function handleEditorChange() {
    if (!currentFile) return;
    
    isDirty = true;
    elements.saveBtn.disabled = false;
    updateStats();
    
    if (isPreviewMode) {
        updatePreview();
    }
}

function updateStats() {
    const content = elements.codeEditor.value;
    const lines = content.split('\n').length;
    const chars = content.length;
    
    elements.lineCount.textContent = `Lines: ${lines}`;
    elements.charCount.textContent = `Characters: ${chars}`;
    elements.currentLanguage.textContent = `Language: ${currentFile ? currentFile.language : 'text'}`;
}

function togglePreview() {
    isPreviewMode = !isPreviewMode;
    
    if (isPreviewMode) {
        elements.codeEditor.classList.add('hidden');
        elements.codePreview.classList.remove('hidden');
        elements.previewToggle.innerHTML = '<i data-lucide="code"></i>Edit';
        updatePreview();
    } else {
        elements.codeEditor.classList.remove('hidden');
        elements.codePreview.classList.add('hidden');
        elements.previewToggle.innerHTML = '<i data-lucide="eye"></i>Preview';
    }
    
    lucide.createIcons();
}

function updatePreview() {
    if (!currentFile) return;
    
    const content = elements.codeEditor.value;
    const language = currentFile.language;
    
    elements.previewCode.textContent = content;
    
    // Highlight syntax
    if (window.Prism) {
        Prism.highlightElement(elements.previewCode);
    }
}

// Utility functions
function showCreateForm() {
    elements.createFileForm.classList.remove('hidden');
    elements.newFileName.focus();
}

function hideCreateForm() {
    elements.createFileForm.classList.add('hidden');
    elements.newFileName.value = '';
}

function showLoading() {
    elements.loadingScreen.classList.remove('hidden');
    elements.appLayout.classList.add('hidden');
}

function hideLoading() {
    elements.loadingScreen.classList.add('hidden');
    elements.appLayout.classList.remove('hidden');
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(hideError, 5000);
}

function hideError() {
    elements.errorMessage.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateFileInList(updatedFile) {
    const index = files.findIndex(f => f.id === updatedFile.id);
    if (index !== -1) {
        files[index] = updatedFile;
        renderFilesList();
    }
}

async function copyToClipboard() {
    if (!currentFile) return;
    
    try {
        const content = elements.codeEditor.value;
        await navigator.clipboard.writeText(content);
        showToast('Copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showToast('Failed to copy to clipboard', 'error');
    }
}

async function copyFileContent(fileId) {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    try {
        await navigator.clipboard.writeText(file.content);
        showToast('File content copied!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showToast('Failed to copy content', 'error');
    }
}

function downloadFile() {
    if (!currentFile) return;
    
    const content = elements.codeEditor.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('File downloaded!', 'success');
}

function downloadSingleFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('File downloaded!', 'success');
}

function startRename(fileId) {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const fileNameElement = document.getElementById(`fileName-${fileId}`);
    const currentName = file.name;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'form-input';
    input.style.fontSize = '0.875rem';
    input.style.padding = '0.25rem 0.5rem';
    
    input.onblur = () => finishRename(fileId, input.value, fileNameElement, currentName);
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            input.blur();
        } else if (e.key === 'Escape') {
            fileNameElement.textContent = currentName;
            fileNameElement.style.display = '';
            input.remove();
        }
    };
    
    fileNameElement.style.display = 'none';
    fileNameElement.parentNode.insertBefore(input, fileNameElement);
    input.focus();
    input.select();
}

function finishRename(fileId, newName, fileNameElement, oldName) {
    const input = fileNameElement.parentNode.querySelector('input');
    if (input) {
        input.remove();
    }
    
    fileNameElement.style.display = '';
    
    if (newName.trim() && newName.trim() !== oldName) {
        renameFile(fileId, newName.trim());
    } else {
        fileNameElement.textContent = oldName;
    }
}

// Auto-save functionality
setInterval(() => {
    if (isDirty && currentFile) {
        saveFile();
    }
}, 30000); // Auto-save every 30 seconds

// Export functions to global scope for onclick handlers
window.createFile = createFile;
window.hideCreateForm = hideCreateForm;
window.hideError = hideError;
window.togglePreview = togglePreview;
window.copyToClipboard = copyToClipboard;
window.downloadFile = downloadFile;
window.saveFile = saveFile;
window.selectMobileFile = selectMobileFile;
window.deleteFile = deleteFile;
window.copyFileContent = copyFileContent;
window.downloadSingleFile = downloadSingleFile;
window.startRename = startRename;