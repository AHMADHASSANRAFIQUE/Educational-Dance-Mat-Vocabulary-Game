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
        this.custom = this.load();
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
                // Entirely custom category
                merged[setKey] = words.map(w => ({ ...w, builtIn: false }));
            } else {
                // Append custom words to existing category
                for (const w of words) {
                    // Don't duplicate: skip if built-in has same id
                    if (!merged[setKey].some(b => b.id === w.id)) {
                        merged[setKey].push({ ...w, builtIn: false });
                    }
                }
            }
        }

        return merged;
    }

    /** Get flat list of all words for a given set key */
    getSet(setKey) {
        const all = this.getAll();
        return all[setKey] || [];
    }

    /** Get all category keys */
    getCategories() {
        const all = this.getAll();
        return Object.keys(all);
    }

    /** Check if a category is entirely custom (not in built-in) */
    isCustomCategory(setKey) {
        return !GameConfig.vocabularySets[setKey];
    }

    // ----------------------------------------------------------------
    // WORD CRUD
    // ----------------------------------------------------------------
    addWord(setKey, wordObj) {
        if (!this.custom[setKey]) this.custom[setKey] = [];

        // Prevent duplicate IDs within the set
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
        // Clean up empty custom category
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
        const blob = new Blob([JSON.stringify(this.custom, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'custom_vocabulary.json';
        a.click();
    }

    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (typeof data !== 'object' || Array.isArray(data)) {
                return { success: false, error: 'Invalid format. Expected an object of sets.' };
            }
            // Merge imported data
            for (const [key, words] of Object.entries(data)) {
                if (!Array.isArray(words)) continue;
                if (!this.custom[key]) this.custom[key] = [];
                for (const w of words) {
                    if (w.id && w.en && !this.custom[key].some(x => x.id === w.id)) {
                        this.custom[key].push({ id: w.id, en: w.en, he: w.he || '', image: w.image || '' });
                    }
                }
            }
            this.save();
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Invalid JSON: ' + e.message };
        }
    }
}
