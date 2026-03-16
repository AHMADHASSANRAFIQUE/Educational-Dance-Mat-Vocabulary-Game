/**
 * ====================================================================
 * GAME CONFIGURATION
 * ====================================================================
 * Edit this file to customize vocabulary, levels, and game settings.
 * To add new words: Add objects to the vocabulary arrays below.
 * To change music: Update the bgmUrl property.
 * ====================================================================
 */

const GameConfig = {

    // Admin authentication (SHA-256 hash of password)
    // Default password: admin123  — Change this in production!
    adminPasswordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',

    // ----------------------------------------------------------------
    // VOCABULARY SETS
    // Each set has a name and word list. Levels reference these by key.
    // Images can be URLs or local file paths (e.g. 'images/horse.png').
    // ----------------------------------------------------------------
    vocabularySets: {
        animals: [
            { id: 'horse', en: 'horse', he: 'סוס', image: 'assets/images/horse.png' },
            { id: 'dog',   en: 'dog',   he: 'כלב', image: 'assets/images/dog.png' },
            { id: 'cat',   en: 'cat',   he: 'חתול', image: 'assets/images/cat.png' },
            { id: 'ox',    en: 'ox',    he: 'שור', image: 'assets/images/ox.png' },
            { id: 'bird',  en: 'bird',  he: 'ציפור', image: 'assets/images/bird.png' },
            { id: 'fish',  en: 'fish',  he: 'דג',  image: 'assets/images/fish.png' },
        ],
        people: [
            { id: 'man',   en: 'man',   he: 'איש',  image: 'assets/images/man.png' },
            { id: 'boy',   en: 'boy',   he: 'ילד',  image: 'assets/images/boy.png' },
            { id: 'girl',  en: 'girl',  he: 'ילדה', image: 'assets/images/girl.png' },
            { id: 'baby',  en: 'baby',  he: 'תינוק', image: 'assets/images/baby.png' },
            { id: 'woman', en: 'woman', he: 'אישה', image: 'assets/images/woman.png' },
            { id: 'king',  en: 'king',  he: 'מלך',  image: 'assets/images/king.png' },
        ],
        mix: [
            { id: 'horse', en: 'horse', he: 'סוס', image: 'assets/images/horse.png' },
            { id: 'man',   en: 'man',   he: 'איש',  image: 'assets/images/man.png' },
            { id: 'boy',   en: 'boy',   he: 'ילד',  image: 'assets/images/boy.png' },
            { id: 'ox',    en: 'ox',    he: 'שור', image: 'assets/images/ox.png' },
            { id: 'dog',   en: 'dog',   he: 'כלב', image: 'assets/images/dog.png' },
            { id: 'cat',   en: 'cat',   he: 'חתול', image: 'assets/images/cat.png' },
            { id: 'girl',  en: 'girl',  he: 'ילדה', image: 'assets/images/girl.png' },
            { id: 'bird',  en: 'bird',  he: 'ציפור', image: 'assets/images/bird.png' },
        ]
    },

    // ----------------------------------------------------------------
    // DECOY WORDS (Advanced Mode)
    // Words that look/sound similar to real answers to confuse player
    // ----------------------------------------------------------------
    decoyWords: {
        en: ['hose', 'dose', 'bog', 'fog', 'bat', 'hat', 'box', 'fox', 'bard', 'fist', 'mane', 'bone', 'grill', 'bay', 'worm', 'kite'],
        he: ['כוס', 'לב', 'שתול', 'בור', 'סיפור', 'גג', 'קוף', 'שד', 'יללו', 'מקל', 'מכה', 'תיק', 'אישון', 'ירח']
    },

    // ----------------------------------------------------------------
    // PHASE DEFINITIONS
    // mode: 'static' | 'moving' | 'stream'
    // ----------------------------------------------------------------
    phases: {
        beginner: {
            name: 'Beginner',
            description: 'The Learning Phase',
            mode: 'static',
            levels: [
                { name: 'Animals',  vocabKey: 'animals', roundsPerLevel: 6 },
                { name: 'People',   vocabKey: 'people',  roundsPerLevel: 6 },
            ]
        },
        intermediate: {
            name: 'Intermediate',
            description: 'The Rhythm Phase',
            mode: 'moving',
            ghostFadePercent: 50,  // image fades at 50% of track
            levels: [
                { name: 'Animals',  vocabKey: 'animals', speed: 2.0, spawnIntervalMs: 2500, roundsPerLevel: 8 },
                { name: 'People',   vocabKey: 'people',  speed: 2.8, spawnIntervalMs: 2000, roundsPerLevel: 8 },
                { name: 'Mix',      vocabKey: 'mix',     speed: 3.2, spawnIntervalMs: 1800, roundsPerLevel: 10 },
            ]
        },
        advanced: {
            name: 'Advanced',
            description: 'The Mastery Phase',
            mode: 'stream',
            useDecoys: true,
            levels: [
                { name: 'Animals',  vocabKey: 'animals', speed: 3.5, spawnIntervalMs: 1500, roundsPerLevel: 10 },
                { name: 'People',   vocabKey: 'people',  speed: 4.0, spawnIntervalMs: 1200, roundsPerLevel: 10 },
                { name: 'Mix',      vocabKey: 'mix',     speed: 4.5, spawnIntervalMs: 1000, roundsPerLevel: 12 },
            ]
        }
    },

    // ----------------------------------------------------------------
    // BACKGROUND MUSIC
    // ----------------------------------------------------------------
    bgmUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Tetris_theme.ogg',

    // ----------------------------------------------------------------
    // GAMEPLAY TUNING
    // ----------------------------------------------------------------
    targetY: 20,
    targetHeight: 80,
    hitWindowPerfect: 35,
    hitWindowGood: 70,

    // ----------------------------------------------------------------
    // ADAPTIVE DIFFICULTY
    // ----------------------------------------------------------------
    adaptivePerfectStreak: 10,   // 10 perfects in a row → speed up
    adaptiveMissStreak: 3,       // 3 misses → slow down
    adaptiveSpeedChange: 0.05,   // 5% adjustment
    adaptiveMinSpeed: 1.0,       // floor speed

    // ----------------------------------------------------------------
    // FEVER MODE
    // ----------------------------------------------------------------
    feverComboThreshold: 20,     // 20-combo triggers fever
    feverPointMultiplier: 2,

    // ----------------------------------------------------------------
    // CONTROLS
    // ----------------------------------------------------------------
    tracks: [
        { id: 'left',  key: 'ArrowLeft',  colorClass: 'bg-pink',   arrow: '←' },
        { id: 'down',  key: 'ArrowDown',  colorClass: 'bg-purple', arrow: '↓' },
        { id: 'up',    key: 'ArrowUp',    colorClass: 'bg-green',  arrow: '↑' },
        { id: 'right', key: 'ArrowRight', colorClass: 'bg-orange', arrow: '→' },
    ],
};
