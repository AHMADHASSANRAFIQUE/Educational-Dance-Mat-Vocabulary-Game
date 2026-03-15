// ====================================================================
//  INPUT CONTROLLER
// ====================================================================
class InputController {
    constructor(onInput) {
        this.onInput = onInput;
        this.gamepadPollId = null;
        this.prevGamepadButtons = {};

        this.bindKeyboard();
    }

    bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            const trackDef = GameConfig.tracks.find(t => t.key === e.key);
            if (trackDef) {
                e.preventDefault();
                if (this.onInput) {
                    this.onInput(trackDef.id);
                }
            }
        });
    }

    startGamepadPolling() {
        this.gamepadPollId = setInterval(() => this.pollGamepad(), 16);
    }

    stopGamepadPolling() {
        if (this.gamepadPollId) {
            clearInterval(this.gamepadPollId);
            this.gamepadPollId = null;
        }
    }

    pollGamepad() {
        if (!this.onInput) return;
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gp of gamepads) {
            if (!gp) continue;
            const buttonMap = { 12: 'up', 13: 'down', 14: 'left', 15: 'right' };

            for (const [btnIdx, trackId] of Object.entries(buttonMap)) {
                const btn = gp.buttons[parseInt(btnIdx)];
                if (!btn) continue;
                const key = `${gp.index}_${btnIdx}`;
                const wasPressed = this.prevGamepadButtons[key] || false;
                if (btn.pressed && !wasPressed) {
                    this.onInput(trackId);
                }
                this.prevGamepadButtons[key] = btn.pressed;
            }

            if (gp.axes.length >= 2) {
                const axes = [
                    { axis: 0, neg: 'left', pos: 'right' },
                    { axis: 1, neg: 'up',   pos: 'down'  }
                ];
                for (const am of axes) {
                    const val = gp.axes[am.axis];
                    const nk = `${gp.index}_ax${am.axis}_n`, pk = `${gp.index}_ax${am.axis}_p`;
                    const neg = val < -0.5, pos = val > 0.5;
                    if (neg && !this.prevGamepadButtons[nk]) this.onInput(am.neg);
                    if (pos && !this.prevGamepadButtons[pk]) this.onInput(am.pos);
                    this.prevGamepadButtons[nk] = neg;
                    this.prevGamepadButtons[pk] = pos;
                }
            }
        }
    }
}
