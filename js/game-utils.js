// Game Utils - Shared utility library for Game Hub
// Provides: sound effects (Howler.js), confetti (canvas-confetti), themed dialogs (SweetAlert2)
// Self-bootstraps CDN dependencies. Gracefully degrades if CDN unavailable.

const GameUtils = {
    _initialized: false,
    _cdnLoaded: { howler: false, confetti: false, swal: false },
    soundEnabled: true,

    // --- Bootstrap: dynamically load CDN libraries ---
    init() {
        if (this._initialized) return Promise.resolve();
        this._initialized = true;

        // Restore sound preference
        const savedPref = localStorage.getItem('gameHubSoundEnabled');
        if (savedPref !== null) this.soundEnabled = savedPref !== 'false';

        return Promise.all([
            this._loadScript('https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js')
                .then(() => { this._cdnLoaded.howler = true; })
                .catch(() => {}),
            this._loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js')
                .then(() => { this._cdnLoaded.confetti = true; })
                .catch(() => {}),
            this._loadCSS('https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css')
                .catch(() => {}),
            this._loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js')
                .then(() => { this._cdnLoaded.swal = true; })
                .catch(() => {})
        ]).then(() => {
            this._hookGameOverOverlays();
            this._patchNativeAlert();
        });
    },

    _loadScript(url) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${url}"]`);
            if (existing) { resolve(); return; }
            const s = document.createElement('script');
            s.src = url;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    },

    _loadCSS(url) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`link[href="${url}"]`);
            if (existing) { resolve(); return; }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    },

    // --- Sound Effects (synthesized via AudioContext, no external files needed) ---
    _audioCtx: null,

    _getAudioContext() {
        if (!this._audioCtx) {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        return this._audioCtx;
    },

    _playTone(freq, duration, type, volume) {
        try {
            const ctx = this._getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(volume || 0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* silent fail */ }
    },

    _playSequence(notes, interval) {
        notes.forEach((note, i) => {
            setTimeout(() => {
                this._playTone(note.freq, note.dur || 0.15, note.type || 'sine', note.vol || 0.15);
            }, i * (interval || 120));
        });
    },

    playSound(type) {
        if (!this.soundEnabled) return;

        const sounds = {
            click: () => this._playTone(800, 0.05, 'sine', 0.1),
            move: () => this._playTone(600, 0.04, 'sine', 0.08),
            win: () => this._playSequence([
                { freq: 523, dur: 0.15 },
                { freq: 659, dur: 0.15 },
                { freq: 784, dur: 0.15 },
                { freq: 1047, dur: 0.3 }
            ], 130),
            lose: () => this._playSequence([
                { freq: 400, dur: 0.2, type: 'sawtooth', vol: 0.1 },
                { freq: 300, dur: 0.2, type: 'sawtooth', vol: 0.1 },
                { freq: 200, dur: 0.4, type: 'sawtooth', vol: 0.1 }
            ], 200),
            error: () => this._playSequence([
                { freq: 300, dur: 0.1, type: 'square', vol: 0.08 },
                { freq: 250, dur: 0.15, type: 'square', vol: 0.08 }
            ], 100),
            levelup: () => this._playSequence([
                { freq: 660, dur: 0.1 },
                { freq: 880, dur: 0.1 },
                { freq: 1100, dur: 0.2 }
            ], 100),
            achievement: () => this._playSequence([
                { freq: 523, dur: 0.1 },
                { freq: 659, dur: 0.1 },
                { freq: 784, dur: 0.1 },
                { freq: 1047, dur: 0.1 },
                { freq: 1319, dur: 0.3 }
            ], 100)
        };

        if (sounds[type]) sounds[type]();
    },

    // --- Confetti celebration ---
    celebrateWin(options) {
        if (!this._cdnLoaded.confetti || typeof confetti !== 'function') return;

        const defaults = {
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00d9ff', '#00ff88', '#ffffff', '#ffc107']
        };
        const opts = Object.assign({}, defaults, options);

        confetti(opts);
        setTimeout(() => {
            confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: opts.colors });
        }, 250);
        setTimeout(() => {
            confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: opts.colors });
        }, 400);
    },

    // --- SweetAlert2 themed dialogs ---
    _getSwalTheme() {
        return {
            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
            color: '#fff',
            confirmButtonColor: '#00d9ff',
            cancelButtonColor: '#ff6b6b',
            customClass: {
                popup: 'game-hub-swal'
            }
        };
    },

    showGameOver({ title, text, score, isWin, onRestart } = {}) {
        if (isWin) {
            this.celebrateWin();
            this.playSound('win');
        } else {
            this.playSound('lose');
        }

        if (!this._cdnLoaded.swal || typeof Swal === 'undefined') return;

        const theme = this._getSwalTheme();
        const scoreHtml = score !== undefined
            ? `<div style="font-size:2rem;color:${isWin ? '#00ff88' : '#ff6b6b'};margin:10px 0;">${typeof score === 'number' ? score.toLocaleString() : score}</div>`
            : '';

        Swal.fire(Object.assign({}, theme, {
            title: title || (isWin ? 'You Win!' : 'Game Over!'),
            html: (text ? `<p>${text}</p>` : '') + scoreHtml,
            icon: isWin ? 'success' : 'error',
            confirmButtonText: onRestart ? 'Play Again' : 'OK',
            showCancelButton: false
        })).then(result => {
            if (result.isConfirmed && onRestart) onRestart();
        });
    },

    showNewHighScore({ score, game } = {}) {
        this.celebrateWin();
        this.playSound('achievement');

        if (!this._cdnLoaded.swal || typeof Swal === 'undefined') return;

        const theme = this._getSwalTheme();
        Swal.fire(Object.assign({}, theme, {
            title: 'New High Score!',
            html: `<div style="font-size:2.5rem;color:#00ff88;margin:10px 0;">${typeof score === 'number' ? score.toLocaleString() : score}</div>` +
                  (game ? `<p style="color:#a0a0a0;">${game}</p>` : ''),
            icon: 'success',
            confirmButtonText: 'Awesome!',
            confirmButtonColor: '#00ff88'
        }));
    },

    showAlert({ title, text, icon } = {}) {
        if (!this._cdnLoaded.swal || typeof Swal === 'undefined') {
            window._originalAlert(text || title || '');
            return;
        }

        const theme = this._getSwalTheme();
        Swal.fire(Object.assign({}, theme, {
            title: title || '',
            text: text || '',
            icon: icon || 'info',
            confirmButtonText: 'OK'
        }));
    },

    // --- Auto-hook game-over overlays with MutationObserver ---
    _hookGameOverOverlays() {
        const overlays = document.querySelectorAll('.game-over-overlay');
        overlays.forEach(overlay => {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!overlay.classList.contains('hidden')) {
                            const titleEl = overlay.querySelector('h2');
                            const titleText = titleEl ? titleEl.textContent : '';
                            const isWin = /win|congrat|victory|solved|complete|cleared/i.test(titleText);
                            if (isWin) {
                                this.celebrateWin();
                                this.playSound('win');
                            } else {
                                this.playSound('lose');
                            }
                        }
                    }
                });
            });
            observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
        });
    },

    // --- Patch native alert() to use SweetAlert2 ---
    _patchNativeAlert() {
        if (!this._cdnLoaded.swal || typeof Swal === 'undefined') return;

        window._originalAlert = window.alert;
        window.alert = (message) => {
            Swal.fire({
                text: String(message),
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                color: '#fff',
                confirmButtonColor: '#00d9ff',
                confirmButtonText: 'OK'
            });
        };
    },

    // --- Sound toggle UI ---
    createSoundToggle() {
        if (document.getElementById('soundToggleBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'soundToggleBtn';
        btn.innerHTML = this.soundEnabled ? '&#x1F50A;' : '&#x1F507;';
        btn.title = 'Toggle Sound';
        btn.onclick = () => {
            this.soundEnabled = !this.soundEnabled;
            btn.innerHTML = this.soundEnabled ? '&#x1F50A;' : '&#x1F507;';
            localStorage.setItem('gameHubSoundEnabled', this.soundEnabled);
            this.playSound('click');
        };
        document.body.appendChild(btn);
    }
};

// Auto-initialize
(function() {
    function start() {
        GameUtils.init().then(() => {
            GameUtils.createSoundToggle();
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
