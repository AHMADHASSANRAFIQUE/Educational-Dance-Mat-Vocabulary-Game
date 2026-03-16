/**
 * ====================================================================
 * THEME PRESETS
 * ====================================================================
 * Each theme defines CSS custom property values that get applied
 * to :root when the theme is activated. The key names map directly
 * to CSS variable names (without the -- prefix).
 * ====================================================================
 */
const GameThemes = {

    midnight: {
        name: 'Midnight',
        icon: '🌙',
        vars: {
            'color-bg':        '#0f0c29',
            'color-bg-end':    '#1a1a3e',
            'color-pink':      '#ff66aa',
            'color-purple':    '#8c52ff',
            'color-green':     '#38d9a9',
            'color-orange':    '#ff914d',
            'color-text':      '#ffffff',
            'color-accent':    '#5ce1e6',
            'color-gold':      '#ffd700',
            'hud-bg':          'rgba(0,0,0,0.4)',
            'overlay-bg':      'rgba(10,8,30,0.97)',
            'card-bg':         'rgba(255,255,255,0.06)',
            'card-border':     'rgba(255,255,255,0.15)',
            'prompt-bg':       'rgba(255,255,255,0.95)',
            'prompt-shadow':   'rgba(140,82,255,0.3)',
            'board-top':       'rgba(0,0,0,0.6)',
            'board-bottom':    'rgba(0,0,0,0.1)',
            'track-line':      'rgba(255,255,255,0.05)',
        }
    },

    ocean: {
        name: 'Ocean',
        icon: '🌊',
        vars: {
            'color-bg':        '#1a3a5c',
            'color-bg-end':    '#2d6a9f',
            'color-pink':      '#ff7eb3',
            'color-purple':    '#64b5f6',
            'color-green':     '#4dd0e1',
            'color-orange':    '#ffab40',
            'color-text':      '#e8f4ff',
            'color-accent':    '#00e5ff',
            'color-gold':      '#ffe082',
            'hud-bg':          'rgba(20,50,80,0.6)',
            'overlay-bg':      'rgba(20,50,80,0.95)',
            'card-bg':         'rgba(100,181,246,0.15)',
            'card-border':     'rgba(100,181,246,0.35)',
            'prompt-bg':       'rgba(240,248,255,0.97)',
            'prompt-shadow':   'rgba(0,229,255,0.4)',
            'board-top':       'rgba(20,50,80,0.5)',
            'board-bottom':    'rgba(20,50,80,0.1)',
            'track-line':      'rgba(100,181,246,0.12)',
        }
    },

    sunset: {
        name: 'Sunset',
        icon: '🌅',
        vars: {
            'color-bg':        '#4a1942',
            'color-bg-end':    '#803060',
            'color-pink':      '#ff6b9d',
            'color-purple':    '#c471ed',
            'color-green':     '#f7d94c',
            'color-orange':    '#ff8a5c',
            'color-text':      '#fff0f5',
            'color-accent':    '#ffc371',
            'color-gold':      '#ffd700',
            'hud-bg':          'rgba(74,25,66,0.6)',
            'overlay-bg':      'rgba(74,25,66,0.95)',
            'card-bg':         'rgba(255,107,157,0.12)',
            'card-border':     'rgba(255,107,157,0.3)',
            'prompt-bg':       'rgba(255,245,250,0.97)',
            'prompt-shadow':   'rgba(255,107,157,0.4)',
            'board-top':       'rgba(74,25,66,0.5)',
            'board-bottom':    'rgba(74,25,66,0.1)',
            'track-line':      'rgba(255,107,157,0.1)',
        }
    },

    forest: {
        name: 'Forest',
        icon: '🌿',
        vars: {
            'color-bg':        '#1b3a2d',
            'color-bg-end':    '#2d6b4a',
            'color-pink':      '#f48fb1',
            'color-purple':    '#80cbc4',
            'color-green':     '#69f0ae',
            'color-orange':    '#ffcc02',
            'color-text':      '#e8f5e9',
            'color-accent':    '#76ff03',
            'color-gold':      '#ffd740',
            'hud-bg':          'rgba(27,58,45,0.6)',
            'overlay-bg':      'rgba(27,58,45,0.95)',
            'card-bg':         'rgba(105,240,174,0.12)',
            'card-border':     'rgba(105,240,174,0.3)',
            'prompt-bg':       'rgba(245,255,248,0.97)',
            'prompt-shadow':   'rgba(105,240,174,0.4)',
            'board-top':       'rgba(27,58,45,0.5)',
            'board-bottom':    'rgba(27,58,45,0.1)',
            'track-line':      'rgba(105,240,174,0.1)',
        }
    },

    light: {
        name: 'Light',
        icon: '☀️',
        vars: {
            'color-bg':        '#f0f4f8',
            'color-bg-end':    '#ffffff',
            'color-pink':      '#e91e63',
            'color-purple':    '#7c4dff',
            'color-green':     '#00bfa5',
            'color-orange':    '#ff6d00',
            'color-text':      '#2d3748',
            'color-accent':    '#0288d1',
            'color-gold':      '#f57f17',
            'hud-bg':          'rgba(255,255,255,0.85)',
            'overlay-bg':      'rgba(245,248,252,0.98)',
            'card-bg':         'rgba(0,0,0,0.05)',
            'card-border':     'rgba(0,0,0,0.12)',
            'prompt-bg':       '#ffffff',
            'prompt-shadow':   'rgba(124,77,255,0.15)',
            'board-top':       'rgba(0,0,0,0.04)',
            'board-bottom':    'rgba(0,0,0,0.01)',
            'track-line':      'rgba(0,0,0,0.08)',
        }
    }
};
