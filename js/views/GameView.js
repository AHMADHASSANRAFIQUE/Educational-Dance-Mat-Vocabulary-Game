// ====================================================================
//  GAME VIEW
// ====================================================================
class GameView {
    constructor() {
        // DOM
        this.container    = document.getElementById('game-container');
        this.board        = document.getElementById('game-board');
        this.staticBoard  = document.getElementById('static-board');
        this.scoreEl      = document.getElementById('score-value');
        this.comboEl      = document.getElementById('combo-value');
        this.levelEl      = document.getElementById('level-value');
        this.modeEl       = document.getElementById('mode-value');
        this.promptImg    = document.getElementById('prompt-image');
        this.promptLabel  = document.getElementById('prompt-label');
        this.feedbackEl   = document.getElementById('feedback-text');
        this.startOverlay = document.getElementById('start-overlay');
        this.gameoverOverlay = document.getElementById('gameover-overlay');
        this.finalScoreEl = document.getElementById('final-score');
        this.levelBanner  = document.getElementById('level-up-banner');
        this.levelBannerText = document.getElementById('level-up-text');
        this.feverOverlay  = document.getElementById('fever-overlay');
        this.feverBanner   = document.getElementById('fever-banner');
        this.multiplierBadge = document.getElementById('multiplier-badge');
        this.adaptiveIndicator = document.getElementById('adaptive-indicator');
        this.adaptiveText  = document.getElementById('adaptive-text');
        this.ttsToggle     = document.getElementById('tts-toggle');
        this.langToggle    = document.getElementById('lang-toggle');
        this.dashboardPanel = document.getElementById('dashboard-panel');
        this.analyticsTbody = document.getElementById('analytics-tbody');

        // Audio
        this.bgMusic = new Audio(GameConfig.bgmUrl);
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4;

        this.ttsEnabled = true;

        this.feedbackTimeout = null;
        this.levelBannerTimeout = null;
        this.adaptiveTimeout = null;

        // Theme
        this.themePanel = document.getElementById('theme-panel');
    }

    bindEvents(onStartRequest, onRestartRequest, onTTSggle, onDashboardToggle, onCloseDashboard, onExportCSV, onClearData, onLangToggle, onThemeSelect) {
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => onStartRequest(btn.dataset.phase));
        });

        document.getElementById('restart-btn').addEventListener('click', onRestartRequest);

        this.ttsToggle.addEventListener('click', () => {
            this.ttsEnabled = !this.ttsEnabled;
            this.ttsToggle.classList.toggle('active', this.ttsEnabled);
            this.ttsToggle.innerText = this.ttsEnabled ? '🔊' : '🔇';
            if(onTTSggle) onTTSggle(this.ttsEnabled);
        });
        this.ttsToggle.classList.add('active'); // start enabled

        if (this.langToggle) {
            this.langToggle.addEventListener('click', () => {
                if(onLangToggle) onLangToggle();
            });
        }

        // Theme button
        document.getElementById('theme-toggle').addEventListener('click', () => this.openThemePicker());
        document.getElementById('theme-close').addEventListener('click', () => this.closeThemePicker());
        this._onThemeSelect = onThemeSelect;

        document.getElementById('dashboard-toggle').addEventListener('click', onDashboardToggle);
        document.getElementById('dashboard-close').addEventListener('click', onCloseDashboard);
        document.getElementById('export-csv-btn').addEventListener('click', onExportCSV);
        document.getElementById('clear-data-btn').addEventListener('click', onClearData);
    }

    showStartScreen() {
        this.startOverlay.style.display = 'flex';
        this.gameoverOverlay.style.display = 'none';
    }

    showGameScreen(mode, phaseName) {
        this.startOverlay.style.display = 'none';
        this.gameoverOverlay.style.display = 'none';

        if (mode === 'static') {
            this.staticBoard.style.display = 'flex';
            this.board.style.display = 'none';
        } else {
            this.staticBoard.style.display = 'none';
            this.board.style.display = 'flex';
        }

        this.modeEl.innerText = phaseName;
    }

    showGameOver(finalScore) {
        this.finalScoreEl.innerText = finalScore;
        this.gameoverOverlay.style.display = 'flex';
    }

    updateHUD(score, combo, levelIndex) {
        this.scoreEl.innerText = score;
        this.comboEl.innerText = combo;
        this.levelEl.innerText = levelIndex + 1;
    }

    showFeedback(text, className) {
        this.feedbackEl.innerText = text;
        this.feedbackEl.className = className;
        this.feedbackEl.style.opacity = '1';
        this.feedbackEl.style.transform = 'translateY(0)';

        if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => {
            this.feedbackEl.style.opacity = '0';
            this.feedbackEl.style.transform = 'translateY(-10px)';
        }, 600);
    }

    showLevelUpBanner(levelName) {
        this.levelBannerText.innerText = `⬆ ${levelName}`;
        this.levelBanner.style.display = 'block';
        this.levelBannerText.style.animation = 'none';
        this.levelBannerText.offsetHeight;
        this.levelBannerText.style.animation = 'levelPop 1.5s ease-out forwards';

        if (this.levelBannerTimeout) clearTimeout(this.levelBannerTimeout);
        this.levelBannerTimeout = setTimeout(() => { this.levelBanner.style.display = 'none'; }, 1800);
    }

    showAdaptiveIndicator(multiplier, message) {
        this.adaptiveText.innerText = message;
        this.adaptiveIndicator.className = multiplier > 1 ? 'adaptive-up' : 'adaptive-down';
        this.adaptiveIndicator.style.display = 'block';

        if (this.adaptiveTimeout) clearTimeout(this.adaptiveTimeout);
        this.adaptiveTimeout = setTimeout(() => {
            this.adaptiveIndicator.style.display = 'none';
        }, 2000);
    }

    setFeverUI(active) {
        const method = active ? 'add' : 'remove';
        this.container.classList[method]('fever-active');
        this.feverOverlay.classList.toggle('fever-visible', active);
        this.feverOverlay.classList.toggle('fever-hidden', !active);
        this.feverBanner.classList.toggle('fever-visible', active);
        this.feverBanner.classList.toggle('fever-hidden', !active);
        this.multiplierBadge.classList.toggle('fever-visible', active);
        this.multiplierBadge.classList.toggle('fever-hidden', !active);
    }

    // UI Language Toggle
    updateLanguageToggleUI(language) {
        if (this.langToggle) {
            this.langToggle.innerText = language === 'en' ? 'EN' : 'HE';
        }
    }

    // TTS
    speakWord(word, language = 'en') {
        if (!this.ttsEnabled) return;

        let spokenWord = typeof word === 'object' ? word[language] || word.en || word.id : word;
        const targetLang = language === 'he' ? 'he' : 'en';

        // Try native Web Speech API first
        if (window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            const hasVoice = voices.some(v => v.lang.startsWith(targetLang));

            if (hasVoice) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(spokenWord);
                utterance.lang = language === 'he' ? 'he-IL' : 'en-US';
                let voice = voices.find(v => v.lang === utterance.lang);
                if (!voice) voice = voices.find(v => v.lang.startsWith(targetLang));
                if (voice) utterance.voice = voice;
                utterance.rate = 0.85;
                utterance.pitch = 1.1;
                utterance.volume = 0.9;
                window.speechSynthesis.speak(utterance);
                return;
            }
        }

        // Fallback: Google Translate TTS (works for Hebrew without installing voice packs)
        try {
            const encoded = encodeURIComponent(spokenWord);
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encoded}`;
            const audio = new Audio(url);
            audio.volume = 0.9;
            audio.play().catch(() => {});
        } catch(e) {
            // silently fail
        }
    }

    // Audio
    playBGM() {
        this.bgMusic.currentTime = 0;
        this.bgMusic.play().catch(() => {});
    }
    stopBGM() {
        this.bgMusic.pause();
    }

    // Dashboard
    openDashboard(analyticsData) {
        this.renderDashboard(analyticsData);
        this.dashboardPanel.classList.remove('dashboard-hidden');
    }

    closeDashboard() {
        this.dashboardPanel.classList.add('dashboard-hidden');
    }

    renderDashboard(data) {
        this.analyticsTbody.innerHTML = '';
        if (data.length === 0) {
            this.analyticsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;opacity:0.5;padding:20px;">No data yet. Play a round first!</td></tr>';
            return;
        }

        for (const item of data) {
            const accClass = item.accuracy >= 80 ? 'accuracy-high' : item.accuracy >= 50 ? 'accuracy-mid' : 'accuracy-low';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.word}</strong></td>
                <td>${item.shown}</td>
                <td>${item.correct}</td>
                <td>${item.missed}</td>
                <td class="${accClass}">${item.accuracy}%</td>
            `;
            this.analyticsTbody.appendChild(tr);
        }
    }

    // Rendering Game Board Helpers
    setPrompt(imageUrl, labelText, imageClass = 'img-pop') {
        this.promptImg.src = imageUrl;
        this.promptImg.style.opacity = '1';
        this.promptImg.className = imageClass;
        this.promptLabel.innerText = labelText;
    }

    fadePromptImage() {
        this.promptImg.classList.add('ghost-fade');
    }

    unfadePromptImage() {
        this.promptImg.classList.remove('ghost-fade');
    }

    shakePromptImage() {
        this.promptImg.className = 'img-shake';
    }

    prepareStaticSlots(wordsArray, correctWordObj, language) {
        const slots = document.querySelectorAll('.static-slot');
        slots.forEach((slot, i) => {
            const block = slot.querySelector('.static-block');
            const wordSpan = block.querySelector('.block-word');
            wordSpan.innerText = wordsArray[i][language] || wordsArray[i].id;
            block.classList.remove('correct-flash', 'wrong-flash');
            block.classList.add('pulse');
            block.dataset.wordId = wordsArray[i].id;
            block.dataset.isCorrect = wordsArray[i].id === correctWordObj.id ? 'true' : 'false';
        });
    }

    spawnMovingBlock(trackDef, vocab, isDecoy, startY, language) {
        const trackEl = document.querySelector(`#game-board .track[data-track="${trackDef.id}"]`);

        const blockEl = document.createElement('div');
        blockEl.className = `vocab-block ${trackDef.colorClass}`;
        if (isDecoy) blockEl.classList.add('decoy-block');

        const displayWord = typeof vocab === 'object' && vocab[language] ? vocab[language] : (vocab.word || vocab.id || vocab);

        blockEl.innerHTML = `
            <span class="block-arrow">${trackDef.arrow}</span>
            <span class="block-word">${displayWord}</span>
        `;

        blockEl.style.top = `${startY}px`;
        trackEl.appendChild(blockEl);
        
        return blockEl;
    }

    flashTargetZone(trackId) {
        const tz = document.querySelector(`.track[data-track="${trackId}"] .target-zone`);
        if(tz) {
            tz.classList.add('active');
            setTimeout(() => tz.classList.remove('active'), 120);
        }
    }

    // ================================================================
    // THEME SYSTEM
    // ================================================================
    applyTheme(themeKey) {
        const theme = GameThemes[themeKey];
        if (!theme) return;

        const root = document.documentElement;
        for (const [prop, value] of Object.entries(theme.vars)) {
            root.style.setProperty(`--${prop}`, value);
        }

        // Set data-theme for CSS overrides (e.g., light mode)
        root.dataset.theme = themeKey;

        // Update active state on theme cards if picker is open
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('theme-active', card.dataset.theme === themeKey);
        });
    }

    openThemePicker() {
        this.renderThemePicker();
        this.themePanel.classList.remove('theme-hidden');
    }

    closeThemePicker() {
        this.themePanel.classList.add('theme-hidden');
    }

    renderThemePicker() {
        const grid = this.themePanel.querySelector('.theme-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const currentTheme = document.documentElement.dataset.theme || 'midnight';

        for (const [key, theme] of Object.entries(GameThemes)) {
            const card = document.createElement('div');
            card.className = `theme-card ${key === currentTheme ? 'theme-active' : ''}`;
            card.dataset.theme = key;

            const colors = [theme.vars['color-pink'], theme.vars['color-purple'], theme.vars['color-green'], theme.vars['color-orange']];
            const dotsHtml = colors.map(c => `<span class="theme-color-dot" style="background:${c}"></span>`).join('');

            card.innerHTML = `
                <span class="theme-card-icon">${theme.icon}</span>
                <span class="theme-card-name">${theme.name}</span>
                <div class="theme-card-preview">${dotsHtml}</div>
            `;

            card.addEventListener('click', () => {
                if (this._onThemeSelect) this._onThemeSelect(key);
                this.applyTheme(key);
                // Update active states
                grid.querySelectorAll('.theme-card').forEach(c => c.classList.remove('theme-active'));
                card.classList.add('theme-active');
            });

            grid.appendChild(card);
        }
    }
}
