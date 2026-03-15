// ====================================================================
//  ANALYTICS MODEL
// ====================================================================
class Analytics {
    constructor() {
        this.storageKey = 'danceMatVocabAnalytics';
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    record(word, isCorrect) {
        if (!this.data[word]) {
            this.data[word] = { shown: 0, correct: 0, missed: 0 };
        }
        this.data[word].shown++;
        if (isCorrect) this.data[word].correct++;
        else this.data[word].missed++;
        this.save();
    }

    getAll() {
        return Object.entries(this.data).map(([word, stats]) => ({
            word,
            ...stats,
            accuracy: stats.shown > 0 ? Math.round((stats.correct / stats.shown) * 100) : 0
        })).sort((a, b) => a.accuracy - b.accuracy); // worst first
    }

    clear() {
        this.data = {};
        localStorage.removeItem(this.storageKey);
    }

    exportCSV() {
        const rows = [['Word', 'Shown', 'Correct', 'Missed', 'Accuracy %']];
        for (const item of this.getAll()) {
            rows.push([item.word, item.shown, item.correct, item.missed, item.accuracy]);
        }
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vocabulary_report.csv';
        a.click();
    }
}
