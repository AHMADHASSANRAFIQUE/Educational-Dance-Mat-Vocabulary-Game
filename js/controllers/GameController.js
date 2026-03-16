// ====================================================================
//  GAME CONTROLLER
// ====================================================================
class GameController {
    constructor(state, view, vocabManager) {
        this.state = state;
        this.view = view;
        this.vocabManager = vocabManager;
        this.input = new InputController((trackId) => this.handleInput(trackId));

        // Timers
        this.gameLoopId = null;
        this.roundTimer = null;

        this.bindViewEvents();
    }

    bindViewEvents() {
        this.view.bindEvents(
            (phase) => this.startGame(phase),
            () => this.restartGame(),
            null, // onTTSggle is handled inside view directly for self-state
            () => this.view.openDashboard(this.state.analytics.getAll()),
            () => this.view.closeDashboard(),
            () => this.state.analytics.exportCSV(),
            () => { this.state.analytics.clear(); this.view.renderDashboard(this.state.analytics.getAll()); },
            () => this.handleLanguageToggle(),
            (themeKey) => this.state.setTheme(themeKey)
        );
        this.view.updateLanguageToggleUI(this.state.language);

        // Apply saved theme on init
        this.view.applyTheme(this.state.theme);
    }

    handleLanguageToggle() {
        const newLang = this.state.toggleLanguage();
        this.view.updateLanguageToggleUI(newLang);
        
        // Update all on-screen blocks if a round is currently active
        // Static blocks
        if (this.state.currentMode === 'static' && this.state.roundActive) {
            document.querySelectorAll('.static-block').forEach(block => {
                const wordId = block.dataset.wordId;
                const vocab = this.getVocab().find(v => v.id === wordId);
                if (vocab) {
                    block.querySelector('.block-word').innerText = vocab[newLang] || vocab.id;
                }
            });
        }
        
        // Moving blocks
        if (this.state.blocks && this.state.blocks.length > 0) {
           this.state.blocks.forEach(b => {
               if (b.active && b.el) {
                   const displayWord = b.vocab && b.vocab[newLang] ? b.vocab[newLang] : (b.vocab.id || b.vocab);
                   b.el.querySelector('.block-word').innerText = displayWord;
               }
           });
        }
    }

    startGame(phaseKey) {
        this.state.reset();
        this.state.currentPhase = phaseKey;
        const phaseDef = GameConfig.phases[phaseKey];
        this.state.currentMode = phaseDef.mode;

        this.view.showGameScreen(this.state.currentMode, phaseDef.name);
        this.view.setFeverUI(false);
        this.view.updateHUD(this.state.score, this.state.combo, this.state.levelIndex);
        
        this.applyLevelSettings();

        this.state.isPlaying = true;
        this.view.playBGM();
        this.input.startGamepadPolling();
        
        this.scheduleNextRound(800);
    }

    restartGame() {
        this.clearAllBlocks();
        if (this.roundTimer) clearTimeout(this.roundTimer);
        this.startGame(this.state.currentPhase);
    }

    endGame() {
        this.state.isPlaying = false;
        this.state.roundActive = false;
        this.view.stopBGM();
        this.clearAllBlocks();
        this.input.stopGamepadPolling();
        this.view.setFeverUI(false);

        if (this.roundTimer) clearTimeout(this.roundTimer);
        this.view.showGameOver(this.state.score);
    }

    applyLevelSettings() {
        const phaseDef = GameConfig.phases[this.state.currentPhase];
        const lvl = phaseDef.levels[this.state.levelIndex];

        if (this.state.currentMode !== 'static') {
            this.state.baseSpeed = lvl.speed;
            this.state.speed = this.state.baseSpeed;
            this.state.spawnIntervalMs = lvl.spawnIntervalMs;
        }
        this.view.levelEl.innerText = this.state.levelIndex + 1;
    }

    getVocab() {
        const phaseDef = GameConfig.phases[this.state.currentPhase];
        const lvl = phaseDef.levels[this.state.levelIndex];
        const vocabKey = lvl.vocabKey;

        // Use VocabManager if available (merges built-in + custom)
        if (this.vocabManager) {
            const allSets = this.vocabManager.getAll();
            return allSets[vocabKey] || GameConfig.vocabularySets[vocabKey];
        }
        return GameConfig.vocabularySets[vocabKey];
    }

    getRoundsPerLevel() {
        const phaseDef = GameConfig.phases[this.state.currentPhase];
        return phaseDef.levels[this.state.levelIndex].roundsPerLevel;
    }

    scheduleNextRound(delayMs) {
        if (!this.state.isPlaying) return;
        const delay = delayMs || (this.state.currentMode === 'static' ? 600 : this.state.spawnIntervalMs);
        this.roundTimer = setTimeout(() => this.startRound(), delay);
    }

    startRound() {
        if (!this.state.isPlaying) return;

        const vocab = this.getVocab();
        const correctVocab = vocab[Math.floor(Math.random() * vocab.length)];
        const distractors = this.pickDistractors(vocab, correctVocab.id, 3);
        const roundWords = [correctVocab, ...distractors];
        this.shuffleArray(roundWords);

        // UI Reset for prompt
        this.view.setPrompt(correctVocab.image, 'What is this?');
        this.view.unfadePromptImage();

        this.state.currentRound = {
            correctWordObj: correctVocab, // store full obj
            answered: false
        };

        if (this.state.currentMode === 'static') {
            this.view.prepareStaticSlots(roundWords, correctVocab, this.state.language);
        } else {
            this.startMovingRound(roundWords, correctVocab);
        }

        this.state.roundActive = true;
    }

    startMovingRound(roundWords, correctVocab) {
        this.state.blocks = [];
        const phaseDef = GameConfig.phases[this.state.currentPhase];

        GameConfig.tracks.forEach((trackDef, i) => {
            const startY = this.view.board.clientHeight + 10;
            const el = this.view.spawnMovingBlock(trackDef, roundWords[i], false, startY, this.state.language);
            this.state.blocks.push({
                el, y: startY, trackId: trackDef.id, vocab: roundWords[i],
                isCorrect: roundWords[i].id === correctVocab.id, isDecoy: false, active: true
            });
        });

        if (phaseDef.useDecoys) {
            const decoyCount = Math.min(2, Math.floor(Math.random() * 2) + 1);
            const decoyList = GameConfig.decoyWords[this.state.language] || GameConfig.decoyWords['en'];
            
            for (let d = 0; d < decoyCount; d++) {
                const trackDef = GameConfig.tracks[Math.floor(Math.random() * GameConfig.tracks.length)];
                const decoyWord = decoyList[Math.floor(Math.random() * decoyList.length)];
                const startY = this.view.board.clientHeight + 10 + (Math.random() * 60);
                // Create a fake vocab object that mimics the structure enough for display/language switching
                const fakeVocab = { id: decoyWord };
                fakeVocab[this.state.language] = decoyWord;
                
                const el = this.view.spawnMovingBlock(trackDef, fakeVocab, true, startY, this.state.language);
                 this.state.blocks.push({
                    el, y: startY, trackId: trackDef.id, vocab: fakeVocab,
                    isCorrect: false, isDecoy: true, active: true
                });
            }
        }

        if (!this.gameLoopId) {
            this.gameLoopId = requestAnimationFrame(this.loop.bind(this));
        }
    }

    loop() {
        if (!this.state.isPlaying) { this.gameLoopId = null; return; }
        this.updateBlocks();
        this.gameLoopId = requestAnimationFrame(this.loop.bind(this));
    }

    updateBlocks() {
        let anyActive = false;
        const boardH = this.view.board.clientHeight;
        const ghostThreshold = boardH * (1 - (GameConfig.phases[this.state.currentPhase].ghostFadePercent || 100) / 100);

        for (let i = this.state.blocks.length - 1; i >= 0; i--) {
            const block = this.state.blocks[i];
            if (!block.active) continue;
            anyActive = true;

            block.y -= this.state.speed;
            block.el.style.top = `${block.y}px`;

            if (this.state.currentMode === 'moving' && GameConfig.phases[this.state.currentPhase].ghostFadePercent) {
                if (block.isCorrect && block.y < ghostThreshold) {
                    this.view.fadePromptImage();
                }
            }

            if (block.isCorrect && !block.spoken && block.y <= GameConfig.targetY + GameConfig.targetHeight) {
                block.spoken = true;
                this.view.speakWord(this.state.currentRound.correctWordObj, this.state.language);
            }

            if (block.y < -(GameConfig.targetHeight + 20)) {
                block.active = false;
                block.el.remove();
            }
        }

        if (!anyActive && this.state.roundActive) {
            this.state.roundActive = false;
            if (this.state.currentRound && !this.state.currentRound.answered) {
                this.onMiss(this.state.currentRound.correctWordObj.id);
            }
            this.scheduleNextRound();
        }
    }

    handleInput(trackId) {
        if (!this.state.isPlaying || !this.state.roundActive || !this.state.currentRound || this.state.currentRound.answered) return;

        if (this.state.currentMode === 'static') {
            this.handleStaticInput(trackId);
        } else {
            this.handleMovingInput(trackId);
        }
    }

    handleStaticInput(trackId) {
        const slot = document.querySelector(`.static-slot[data-track="${trackId}"]`);
        if (!slot) return;
        const block = slot.querySelector('.static-block');
        const isCorrect = block.dataset.isCorrect === 'true';
        const wordId = block.dataset.wordId;

        this.state.currentRound.answered = true;
        document.querySelectorAll('.static-block').forEach(b => b.classList.remove('pulse'));

        const displayWord = this.state.currentRound.correctWordObj[this.state.language] || this.state.currentRound.correctWordObj.id;

        if (isCorrect) {
            block.classList.add('correct-flash');
            this.onCorrectHit('Perfect!', 100, wordId);
            this.view.setPrompt(this.state.currentRound.correctWordObj.image, `✓ ${displayWord}`);
            this.view.speakWord(this.state.currentRound.correctWordObj, this.state.language);
        } else {
            block.classList.add('wrong-flash');
            this.onMiss(this.state.currentRound.correctWordObj.id);
            this.view.shakePromptImage();
            this.view.promptLabel.innerText = `✗ It was "${displayWord}"`;
        }

        this.advanceRound();
    }

    handleMovingInput(trackId) {
        const block = this.state.blocks.find(b => b.active && b.trackId === trackId);
        if (!block) return;

        this.view.flashTargetZone(trackId);
        const distance = Math.abs(block.y - GameConfig.targetY);

        if (distance > GameConfig.hitWindowGood + 30) return;

        const expectedWord = this.state.currentRound.correctWordObj[this.state.language] || this.state.currentRound.correctWordObj.id;

        if (block.isDecoy) {
            this.state.currentRound.answered = true;
            block.el.classList.add('wrong-hit');
            setTimeout(() => { block.active = false; block.el.remove(); }, 200);
            this.onMiss(this.state.currentRound.correctWordObj.id);
            this.view.shakePromptImage();
            this.view.promptLabel.innerText = `✗ Decoy! It was "${expectedWord}"`;
            setTimeout(() => this.clearAllBlocks(), 350);
            this.advanceRound();
            return;
        }

        this.state.currentRound.answered = true;

        if (block.isCorrect) {
            let rating, points;
            if (distance <= GameConfig.hitWindowPerfect) { rating = 'Perfect!'; points = 100; }
            else if (distance <= GameConfig.hitWindowGood) { rating = 'Good!'; points = 50; }
            else { rating = 'OK!'; points = 25; }

            block.el.classList.add('correct-hit');
            setTimeout(() => { block.active = false; block.el.remove(); }, 200);

            const displayWord = block.vocab[this.state.language] || block.vocab.id;
            this.onCorrectHit(rating, points, block.vocab.id);
            this.view.unfadePromptImage();
            this.view.promptLabel.innerText = `✓ ${displayWord}`;
            this.view.promptImg.className = 'img-pop';
        } else {
            block.el.classList.add('wrong-hit');
            setTimeout(() => { block.active = false; block.el.remove(); }, 200);
            this.onMiss(this.state.currentRound.correctWordObj.id);
            this.view.shakePromptImage();
            this.view.promptLabel.innerText = `✗ It was "${expectedWord}"`;
        }

        setTimeout(() => this.clearAllBlocks(), 350);
        this.advanceRound();
    }

    onCorrectHit(rating, basePoints, word) {
        const stats = this.state.addScore(basePoints, rating, word);
        
        const feedbackClass = rating === 'Perfect!' ? 'feedback-perfect' : 'feedback-good';
        this.view.showFeedback(rating, feedbackClass);

        if (stats.combo >= GameConfig.feverComboThreshold && !this.state.feverActive) {
            this.state.feverActive = true;
            this.view.setFeverUI(true);
        }

        if (stats.consecutivePerfects >= GameConfig.adaptivePerfectStreak) {
            this.state.consecutivePerfects = 0;
            this.state.adaptSpeedUp();
            this.view.showAdaptiveIndicator(1.1, '⚡ Speed Up!');
        }

        this.view.updateHUD(this.state.score, this.state.combo, this.state.levelIndex);
    }

    onMiss(word) {
        const stats = this.state.recordMiss(word);
        this.view.showFeedback('Miss!', 'feedback-miss');

        if (this.state.feverActive) {
            this.state.feverActive = false;
            this.view.setFeverUI(false);
        }

        if (stats.consecutiveMisses >= GameConfig.adaptiveMissStreak) {
            this.state.consecutiveMisses = 0;
            this.state.adaptSpeedDown();
            this.view.showAdaptiveIndicator(0.9, '🐢 Slowing down...');
        }

        this.view.updateHUD(this.state.score, this.state.combo, this.state.levelIndex);
    }

    advanceRound() {
        this.state.roundActive = false;
        this.state.roundsCompleted++;

        if (this.state.roundsCompleted >= this.getRoundsPerLevel()) {
            this.state.roundsCompleted = 0;
            const phaseDef = GameConfig.phases[this.state.currentPhase];
            if (this.state.levelIndex < phaseDef.levels.length - 1) {
                this.state.levelIndex++;
                this.applyLevelSettings();
                this.view.showLevelUpBanner(phaseDef.levels[this.state.levelIndex].name);
                this.scheduleNextRound(2200);
            } else {
                setTimeout(() => this.endGame(), 1500);
            }
        } else {
            this.scheduleNextRound();
        }
    }

    clearAllBlocks() {
        this.state.blocks.forEach(b => { if (b.active) { b.active = false; b.el.remove(); } });
        this.state.blocks = [];
    }

    pickDistractors(vocabList, correctId, count) {
        const others = vocabList.filter(v => v.id !== correctId);
        this.shuffleArray(others);
        const result = [];
        for (let i = 0; i < count; i++) result.push(others[i % others.length]);
        return result;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}
