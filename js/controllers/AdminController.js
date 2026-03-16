/**
 * ====================================================================
 * ADMIN CONTROLLER
 * ====================================================================
 * Orchestrates admin authentication and CRUD operations,
 * bridging AdminView and VocabManager.
 * ====================================================================
 */
class AdminController {
    constructor(vocabManager, adminView) {
        this.vocabManager = vocabManager;
        this.view = adminView;
        this.isAuthenticated = false;
    }

    /**
     * Attempt admin login. Uses SHA-256 hash comparison.
     */
    async login(password, callback) {
        const hash = await this.hashPassword(password);
        if (hash === GameConfig.adminPasswordHash) {
            this.isAuthenticated = true;
            callback(true);
            this.openPanel();
        } else {
            callback(false);
        }
    }

    async hashPassword(pw) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Show login modal or open panel if already authenticated.
     */
    requestAccess() {
        if (this.isAuthenticated) {
            this.openPanel();
        } else {
            this.view.showLoginModal((pw, cb) => this.login(pw, cb));
        }
    }

    openPanel() {
        this.view.openPanel(this.vocabManager, {
            onAddWord: (setKey, wordObj) => this.vocabManager.addWord(setKey, wordObj),
            onUpdateWord: (setKey, wordId, updates) => this.vocabManager.updateWord(setKey, wordId, updates),
            onDeleteWord: (setKey, wordId) => this.vocabManager.deleteWord(setKey, wordId),
            onCreateCategory: (name) => this.vocabManager.createCategory(name),
            onRenameCategory: (oldKey, newKey) => this.vocabManager.renameCategory(oldKey, newKey),
            onDeleteCategory: (key) => this.vocabManager.deleteCategory(key),
            onExport: () => this.vocabManager.exportJSON(),
            onImport: (json) => this.vocabManager.importJSON(json),
            onAssignCategory: (phaseKey, vocabKey) => this.vocabManager.assignCategoryToMode(phaseKey, vocabKey),
            onUnassignCategory: (phaseKey, vocabKey) => this.vocabManager.unassignCategoryFromMode(phaseKey, vocabKey),
        });
    }

    logout() {
        this.isAuthenticated = false;
        this.view.closePanel();
    }
}
