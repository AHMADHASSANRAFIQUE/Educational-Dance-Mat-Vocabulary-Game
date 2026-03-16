/**
 * ====================================================================
 * ADMIN VIEW
 * ====================================================================
 * Renders the admin login modal, admin panel with category tabs,
 * word table, and add/edit/delete modals with image upload.
 * ====================================================================
 */
class AdminView {
    constructor() {
        this.panel = document.getElementById('admin-panel');
        this.loginModal = document.getElementById('admin-login-modal');
        this.isOpen = false;
    }

    // ----------------------------------------------------------------
    // LOGIN MODAL
    // ----------------------------------------------------------------
    showLoginModal(onSubmit) {
        this.loginModal.innerHTML = `
            <div class="admin-login-box">
                <h2>🔐 Admin Login</h2>
                <p class="admin-login-hint">Enter the admin password to manage vocabulary.</p>
                <input type="password" id="admin-password-input" class="admin-input" placeholder="Password" autocomplete="off">
                <div id="admin-login-error" class="admin-error"></div>
                <div class="admin-login-actions">
                    <button id="admin-login-submit" class="admin-btn admin-btn-primary">Login</button>
                    <button id="admin-login-cancel" class="admin-btn">Cancel</button>
                </div>
            </div>
        `;
        this.loginModal.classList.remove('admin-hidden');

        const input = document.getElementById('admin-password-input');
        const errEl = document.getElementById('admin-login-error');
        input.focus();

        const submit = () => {
            const pw = input.value;
            if (!pw) { errEl.innerText = 'Please enter a password.'; return; }
            onSubmit(pw, (ok) => {
                if (!ok) {
                    errEl.innerText = '❌ Incorrect password.';
                    input.value = '';
                    input.focus();
                } else {
                    this.hideLoginModal();
                }
            });
        };

        document.getElementById('admin-login-submit').addEventListener('click', submit);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
        document.getElementById('admin-login-cancel').addEventListener('click', () => this.hideLoginModal());
    }

    hideLoginModal() {
        this.loginModal.classList.add('admin-hidden');
        this.loginModal.innerHTML = '';
    }

    // ----------------------------------------------------------------
    // ADMIN PANEL
    // ----------------------------------------------------------------
    openPanel(vocabManager, callbacks) {
        this.isOpen = true;
        this.vocabManager = vocabManager;
        this.callbacks = callbacks;
        this.activeCategory = null;
        this.renderPanel();
        this.panel.classList.remove('admin-hidden');
    }

    closePanel() {
        this.isOpen = false;
        this.panel.classList.add('admin-hidden');
        this.panel.innerHTML = '';
    }

    renderPanel() {
        const allSets = this.vocabManager.getAll();
        const categories = Object.keys(allSets);
        if (!this.activeCategory || !allSets[this.activeCategory]) {
            this.activeCategory = categories[0] || null;
        }

        this.panel.innerHTML = `
            <div class="admin-header">
                <h2>⚙️ Admin Panel — Vocabulary Manager</h2>
                <div class="admin-header-actions">
                    <button id="admin-import-btn" class="admin-btn" title="Import JSON">📥 Import</button>
                    <button id="admin-export-btn" class="admin-btn" title="Export JSON">📤 Export</button>
                    <button id="admin-close-btn" class="admin-btn">✕</button>
                </div>
            </div>

            <div class="admin-tabs">
                ${categories.map(key => `
                    <button class="admin-tab ${key === this.activeCategory ? 'admin-tab-active' : ''}" data-cat="${key}">
                        ${key} ${!this.vocabManager.isCustomCategory(key) ? '<span class="admin-badge">built-in</span>' : ''}
                    </button>
                `).join('')}
                <button id="admin-add-cat-btn" class="admin-tab admin-tab-add">+ New Category</button>
            </div>

            <div class="admin-body">
                ${this.activeCategory ? this.renderWordTable(allSets[this.activeCategory]) : '<p class="admin-empty">No categories yet. Create one above.</p>'}
            </div>

            <div class="admin-footer">
                ${this.activeCategory && this.vocabManager.isCustomCategory(this.activeCategory) ? `
                    <button id="admin-delete-cat-btn" class="admin-btn admin-btn-danger">🗑 Delete Category "${this.activeCategory}"</button>
                ` : ''}
                <button id="admin-add-word-btn" class="admin-btn admin-btn-primary">+ Add Word</button>
            </div>
        `;

        this.bindPanelEvents();
    }

    renderWordTable(words) {
        if (!words || words.length === 0) {
            return '<p class="admin-empty">No words in this category. Click "+ Add Word" to get started.</p>';
        }

        return `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>ID</th>
                        <th>English</th>
                        <th>Hebrew</th>
                        <th>Source</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${words.map(w => `
                        <tr>
                            <td><img class="admin-thumb" src="${w.image || ''}" alt="${w.id}" onerror="this.style.display='none'"></td>
                            <td><strong>${w.id}</strong></td>
                            <td>${w.en}</td>
                            <td>${w.he || '—'}</td>
                            <td><span class="admin-badge ${w.builtIn ? '' : 'admin-badge-custom'}">${w.builtIn ? 'built-in' : 'custom'}</span></td>
                            <td>
                                ${!w.builtIn ? `
                                    <button class="admin-btn-sm admin-edit-word" data-id="${w.id}">✏️</button>
                                    <button class="admin-btn-sm admin-btn-danger admin-delete-word" data-id="${w.id}">🗑</button>
                                ` : '<span class="admin-readonly">🔒</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // ----------------------------------------------------------------
    // PANEL EVENT BINDINGS
    // ----------------------------------------------------------------
    bindPanelEvents() {
        // Close
        document.getElementById('admin-close-btn').addEventListener('click', () => this.closePanel());

        // Category tabs
        document.querySelectorAll('.admin-tab[data-cat]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeCategory = tab.dataset.cat;
                this.renderPanel();
            });
        });

        // Add category
        document.getElementById('admin-add-cat-btn').addEventListener('click', () => this.showAddCategoryModal());

        // Delete category
        const delCatBtn = document.getElementById('admin-delete-cat-btn');
        if (delCatBtn) {
            delCatBtn.addEventListener('click', () => {
                if (confirm(`Delete category "${this.activeCategory}" and all its words?`)) {
                    this.callbacks.onDeleteCategory(this.activeCategory);
                    this.activeCategory = null;
                    this.renderPanel();
                }
            });
        }

        // Add word
        document.getElementById('admin-add-word-btn').addEventListener('click', () => this.showWordModal());

        // Edit / Delete word buttons
        document.querySelectorAll('.admin-edit-word').forEach(btn => {
            btn.addEventListener('click', () => {
                const wordId = btn.dataset.id;
                const words = this.vocabManager.getAll()[this.activeCategory];
                const word = words.find(w => w.id === wordId);
                if (word) this.showWordModal(word);
            });
        });

        document.querySelectorAll('.admin-delete-word').forEach(btn => {
            btn.addEventListener('click', () => {
                const wordId = btn.dataset.id;
                if (confirm(`Delete word "${wordId}"?`)) {
                    this.callbacks.onDeleteWord(this.activeCategory, wordId);
                    this.renderPanel();
                }
            });
        });

        // Import / Export
        document.getElementById('admin-export-btn').addEventListener('click', () => this.callbacks.onExport());
        document.getElementById('admin-import-btn').addEventListener('click', () => this.showImportModal());
    }

    // ----------------------------------------------------------------
    // ADD/EDIT WORD MODAL
    // ----------------------------------------------------------------
    showWordModal(existingWord = null) {
        const isEdit = !!existingWord;
        const modal = document.createElement('div');
        modal.className = 'admin-modal-overlay';
        modal.innerHTML = `
            <div class="admin-modal">
                <h3>${isEdit ? '✏️ Edit Word' : '➕ Add New Word'}</h3>
                <label class="admin-label">Word ID (unique key)
                    <input type="text" id="modal-word-id" class="admin-input" value="${isEdit ? existingWord.id : ''}" ${isEdit ? 'disabled' : ''} placeholder="e.g. apple">
                </label>
                <label class="admin-label">English
                    <input type="text" id="modal-word-en" class="admin-input" value="${isEdit ? existingWord.en : ''}" placeholder="e.g. Apple">
                </label>
                <label class="admin-label">Hebrew
                    <input type="text" id="modal-word-he" class="admin-input" value="${isEdit ? (existingWord.he || '') : ''}" placeholder="e.g. תפוח">
                </label>
                <label class="admin-label">Image
                    <div class="admin-image-upload">
                        <input type="text" id="modal-word-image-url" class="admin-input" value="${isEdit ? (existingWord.image || '') : ''}" placeholder="URL or upload below">
                        <div class="admin-dropzone" id="modal-dropzone">
                            <span>📁 Drag & drop an image or <label for="modal-file-input" class="admin-file-label">browse</label></span>
                            <input type="file" id="modal-file-input" accept="image/*" style="display:none">
                        </div>
                        <img id="modal-image-preview" class="admin-thumb-lg" src="${isEdit && existingWord.image ? existingWord.image : ''}" style="${isEdit && existingWord.image ? '' : 'display:none'}">
                    </div>
                </label>
                <div id="modal-error" class="admin-error"></div>
                <div class="admin-modal-actions">
                    <button id="modal-save" class="admin-btn admin-btn-primary">${isEdit ? 'Save Changes' : 'Add Word'}</button>
                    <button id="modal-cancel" class="admin-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const preview = document.getElementById('modal-image-preview');
        const urlInput = document.getElementById('modal-word-image-url');

        // File upload → base64
        document.getElementById('modal-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                urlInput.value = reader.result;
                preview.src = reader.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });

        // Drag & drop
        const dropzone = document.getElementById('modal-dropzone');
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('admin-dropzone-hover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('admin-dropzone-hover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('admin-dropzone-hover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    urlInput.value = reader.result;
                    preview.src = reader.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // URL change → preview
        urlInput.addEventListener('input', () => {
            if (urlInput.value) {
                preview.src = urlInput.value;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        });

        // Save
        document.getElementById('modal-save').addEventListener('click', () => {
            const errEl = document.getElementById('modal-error');
            const wordObj = {
                id: document.getElementById('modal-word-id').value.trim().toLowerCase().replace(/\s+/g, '_'),
                en: document.getElementById('modal-word-en').value.trim(),
                he: document.getElementById('modal-word-he').value.trim(),
                image: urlInput.value.trim()
            };

            if (!wordObj.id || !wordObj.en) {
                errEl.innerText = 'Word ID and English are required.';
                return;
            }

            let result;
            if (isEdit) {
                result = this.callbacks.onUpdateWord(this.activeCategory, existingWord.id, wordObj);
            } else {
                result = this.callbacks.onAddWord(this.activeCategory, wordObj);
            }

            if (result && !result.success) {
                errEl.innerText = result.error;
            } else {
                modal.remove();
                this.renderPanel();
            }
        });

        document.getElementById('modal-cancel').addEventListener('click', () => modal.remove());
    }

    // ----------------------------------------------------------------
    // ADD CATEGORY MODAL
    // ----------------------------------------------------------------
    showAddCategoryModal() {
        const name = prompt('Enter new category name:');
        if (name && name.trim()) {
            const result = this.callbacks.onCreateCategory(name.trim());
            if (result && !result.success) {
                alert(result.error);
            } else {
                this.activeCategory = result.key;
                this.renderPanel();
            }
        }
    }

    // ----------------------------------------------------------------
    // IMPORT MODAL
    // ----------------------------------------------------------------
    showImportModal() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const result = this.callbacks.onImport(reader.result);
                if (result && !result.success) {
                    alert('Import failed: ' + result.error);
                } else {
                    alert('✅ Vocabulary imported successfully!');
                    this.renderPanel();
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }
}
