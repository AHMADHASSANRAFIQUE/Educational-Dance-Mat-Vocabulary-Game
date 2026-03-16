/**
 * ====================================================================
 * VOCAB MANAGER MODEL
 * ====================================================================
 * Manages vocabulary sets: merges built-in (from GameConfig) with
 * custom sets stored in localStorage. Provides full CRUD operations.
 * ====================================================================
 */
class VocabManager {
    constructor() {
        this.storageKey = 'danceMatCustomVocab';
        this.modeStorageKey = 'danceMatModeAssignments';
        this.custom = this.load();
        this.modeAssignments = this.loadModeAssignments();
    }

    // ----------------------------------------------------------------
    // PERSISTENCE
    // ----------------------------------------------------------------
    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.custom));
    }

    loadModeAssignments() {
        try {
            const raw = localStorage.getItem(this.modeStorageKey);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }

    saveModeAssignments() {
        localStorage.setItem(this.modeStorageKey, JSON.stringify(this.modeAssignments));
    }

    // ----------------------------------------------------------------
    // GET ALL SETS (merged built-in + custom)
    // ----------------------------------------------------------------
    getAll() {
        const merged = {};

        // 1. Copy built-in sets, marking each word
        for (const [setKey, words] of Object.entries(GameConfig.vocabularySets)) {
            merged[setKey] = words.map(w => ({ ...w, builtIn: true }));
        }

        // 2. Overlay custom sets
        for (const [setKey, words] of Object.entries(this.custom)) {
            if (!merged[setKey]) {
                merged[setKey] = words.map(w => ({ ...w, builtIn: false }));
            } else {
                for (const w of words) {
                    if (!merged[setKey].some(b => b.id === w.id)) {
                        merged[setKey].push({ ...w, builtIn: false });
                    }
                }
            }
        }

        return merged;
    }

    getSet(setKey) {
        const all = this.getAll();
        return all[setKey] || [];
    }

    getCategories() {
        const all = this.getAll();
        return Object.keys(all);
    }

    isCustomCategory(setKey) {
        return !GameConfig.vocabularySets[setKey];
    }

    // ----------------------------------------------------------------
    // MODE ASSIGNMENT — Assign categories as levels to game modes
    // ----------------------------------------------------------------
    /**
     * Get merged levels for a phase: built-in levels + custom assigned levels
     */
    getMergedLevels(phaseKey) {
        const phaseDef = GameConfig.phases[phaseKey];
        if (!phaseDef) return [];

        // Start with built-in levels
        const levels = phaseDef.levels.map(l => ({ ...l, builtIn: true }));

        // Append custom assignments for this phase
        const customs = this.modeAssignments[phaseKey] || [];
        for (const assignment of customs) {
            // Only add if the category actually has words
            const words = this.getSet(assignment.vocabKey);
            if (words.length > 0) {
                levels.push({
                    name: assignment.name || assignment.vocabKey,
                    vocabKey: assignment.vocabKey,
                    roundsPerLevel: assignment.roundsPerLevel || 6,
                    speed: assignment.speed || phaseDef.levels[0]?.speed || 2.0,
                    spawnIntervalMs: assignment.spawnIntervalMs || phaseDef.levels[0]?.spawnIntervalMs || 2500,
                    builtIn: false
                });
            }
        }

        return levels;
    }

    /**
     * Assign a category to a game mode
     */
    assignCategoryToMode(phaseKey, vocabKey, options = {}) {
        if (!this.modeAssignments[phaseKey]) this.modeAssignments[phaseKey] = [];

        // Prevent duplicates
        if (this.modeAssignments[phaseKey].some(a => a.vocabKey === vocabKey)) {
            return { success: false, error: `"${vocabKey}" is already assigned to this mode.` };
        }

        // Get default speed settings from the phase
        const phaseDef = GameConfig.phases[phaseKey];
        const defaults = phaseDef?.levels[0] || {};

        this.modeAssignments[phaseKey].push({
            vocabKey,
            name: options.name || vocabKey,
            roundsPerLevel: options.roundsPerLevel || 6,
            speed: options.speed || defaults.speed || 2.0,
            spawnIntervalMs: options.spawnIntervalMs || defaults.spawnIntervalMs || 2500,
        });

        this.saveModeAssignments();
        return { success: true };
    }

    /**
     * Remove a category assignment from a game mode
     */
    unassignCategoryFromMode(phaseKey, vocabKey) {
        if (!this.modeAssignments[phaseKey]) return { success: false, error: 'No assignments for this mode.' };

        const idx = this.modeAssignments[phaseKey].findIndex(a => a.vocabKey === vocabKey);
        if (idx === -1) return { success: false, error: 'Assignment not found.' };

        this.modeAssignments[phaseKey].splice(idx, 1);
        this.saveModeAssignments();
        return { success: true };
    }

    /**
     * Get assignments for a specific mode
     */
    getModeAssignments(phaseKey) {
        return this.modeAssignments[phaseKey] || [];
    }

    // ----------------------------------------------------------------
    // WORD CRUD
    // ----------------------------------------------------------------
    addWord(setKey, wordObj) {
        if (!this.custom[setKey]) this.custom[setKey] = [];

        const all = this.getAll();
        if (all[setKey] && all[setKey].some(w => w.id === wordObj.id)) {
            return { success: false, error: 'A word with this ID already exists in this set.' };
        }

        this.custom[setKey].push({
            id: wordObj.id,
            en: wordObj.en,
            he: wordObj.he || '',
            image: wordObj.image || ''
        });
        this.save();
        return { success: true };
    }

    updateWord(setKey, wordId, updates) {
        if (!this.custom[setKey]) return { success: false, error: 'Cannot edit built-in words.' };

        const word = this.custom[setKey].find(w => w.id === wordId);
        if (!word) return { success: false, error: 'Word not found in custom set.' };

        if (updates.en !== undefined) word.en = updates.en;
        if (updates.he !== undefined) word.he = updates.he;
        if (updates.image !== undefined) word.image = updates.image;
        this.save();
        return { success: true };
    }

    deleteWord(setKey, wordId) {
        if (!this.custom[setKey]) return { success: false, error: 'Cannot delete built-in words.' };

        const idx = this.custom[setKey].findIndex(w => w.id === wordId);
        if (idx === -1) return { success: false, error: 'Word not found.' };

        this.custom[setKey].splice(idx, 1);
        if (this.custom[setKey].length === 0 && this.isCustomCategory(setKey)) {
            delete this.custom[setKey];
        }
        this.save();
        return { success: true };
    }

    // ----------------------------------------------------------------
    // CATEGORY CRUD
    // ----------------------------------------------------------------
    createCategory(setKey) {
        const key = setKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (this.getAll()[key]) return { success: false, error: 'Category already exists.' };

        this.custom[key] = [];
        this.save();
        return { success: true, key };
    }

    renameCategory(oldKey, newKey) {
        if (!this.isCustomCategory(oldKey)) return { success: false, error: 'Cannot rename built-in categories.' };
        const nk = newKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (this.getAll()[nk]) return { success: false, error: 'Category name already exists.' };

        this.custom[nk] = this.custom[oldKey] || [];
        delete this.custom[oldKey];
        this.save();
        return { success: true, key: nk };
    }

    deleteCategory(setKey) {
        if (!this.isCustomCategory(setKey)) return { success: false, error: 'Cannot delete built-in categories.' };
        delete this.custom[setKey];
        this.save();
        return { success: true };
    }

    // ----------------------------------------------------------------
    // IMPORT / EXPORT
    // ----------------------------------------------------------------
    exportJSON() {
        const exportData = {
            vocabulary: this.custom,
            modeAssignments: this.modeAssignments
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'custom_vocabulary.json';
        a.click();
    }

    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // Support both old format (just vocab) and new format (vocab + assignments)
            const vocabData = data.vocabulary || data;
            const assignData = data.modeAssignments || {};

            if (typeof vocabData === 'object' && !Array.isArray(vocabData)) {
                for (const [key, words] of Object.entries(vocabData)) {
                    if (!Array.isArray(words)) continue;
                    if (!this.custom[key]) this.custom[key] = [];
                    for (const w of words) {
                        if (w.id && w.en && !this.custom[key].some(x => x.id === w.id)) {
                            this.custom[key].push({ id: w.id, en: w.en, he: w.he || '', image: w.image || '' });
                        }
                    }
                }
                this.save();
            }

            if (typeof assignData === 'object' && !Array.isArray(assignData)) {
                for (const [phaseKey, assignments] of Object.entries(assignData)) {
                    if (!Array.isArray(assignments)) continue;
                    if (!this.modeAssignments[phaseKey]) this.modeAssignments[phaseKey] = [];
                    for (const a of assignments) {
                        if (a.vocabKey && !this.modeAssignments[phaseKey].some(x => x.vocabKey === a.vocabKey)) {
                            this.modeAssignments[phaseKey].push(a);
                        }
                    }
                }
                this.saveModeAssignments();
            }

            return { success: true };
        } catch (e) {
            return { success: false, error: 'Invalid JSON: ' + e.message };
        }
    }
}

