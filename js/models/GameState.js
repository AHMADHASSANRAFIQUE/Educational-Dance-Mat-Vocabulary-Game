// ====================================================================
//  GAME STATE MODEL
// ====================================================================
class GameState {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.levelIndex = 0;
        this.roundsCompleted = 0;
        
        this.isPlaying = false;
        this.roundActive = false;
        this.currentPhase = null;   // 'beginner' | 'intermediate' | 'advanced'
        this.currentMode = null;    // 'static' | 'moving' | 'stream'

        this.currentRound = null;
        this.blocks = [];

        this.speed = 0;
        this.baseSpeed = 0;
        this.spawnIntervalMs = 0;

        this.consecutivePerfects = 0;
        this.consecutiveMisses = 0;
        this.feverActive = false;

        this.language = 'en'; // 'en' or 'he'
        this.theme = localStorage.getItem('gameTheme') || 'midnight';

        this.analytics = new Analytics();
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.levelIndex = 0;
        this.roundsCompleted = 0;
        this.consecutivePerfects = 0;
        this.consecutiveMisses = 0;
        this.feverActive = false;
        this.blocks = [];
    }

    toggleLanguage() {
        this.language = this.language === 'en' ? 'he' : 'en';
        return this.language;
    }

    setTheme(themeKey) {
        if (GameThemes[themeKey]) {
            this.theme = themeKey;
            localStorage.setItem('gameTheme', themeKey);
        }
    }

    addScore(points, rating, word) {
        this.combo++;
        this.consecutivePerfects = (rating === 'Perfect!') ? this.consecutivePerfects + 1 : 0;
        this.consecutiveMisses = 0;

        let totalPoints = points + (this.combo * 5);
        if (this.feverActive) totalPoints *= GameConfig.feverPointMultiplier;

        this.score += totalPoints;
        this.analytics.record(word, true);

        return { totalPoints, consecutivePerfects: this.consecutivePerfects, combo: this.combo };
    }

    recordMiss(word) {
        this.combo = 0;
        this.consecutivePerfects = 0;
        this.consecutiveMisses++;
        if (word) this.analytics.record(word, false);
        return { consecutiveMisses: this.consecutiveMisses };
    }

    adaptSpeedUp() {
        this.speed = Math.max(GameConfig.adaptiveMinSpeed, this.speed * (1 + GameConfig.adaptiveSpeedChange));
    }

    adaptSpeedDown() {
        this.speed = Math.max(GameConfig.adaptiveMinSpeed, this.speed * (1 - GameConfig.adaptiveSpeedChange));
    }
}
