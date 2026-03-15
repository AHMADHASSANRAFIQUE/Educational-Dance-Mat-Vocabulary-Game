/**
 * ====================================================================
 * Dance Mat Vocabulary — Game Engine (MVC Refactored Version)
 * ====================================================================
 * Initialization point.
 * We rely on classes defined in js/models/, js/views/, and js/controllers/
 * being loaded globally before this script.
 * ====================================================================
 */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize data/state
    const gameState = new GameState();
    
    // 2. Initialize UI
    const gameView = new GameView();
    
    // 3. Initialize Controller orchestrator
    const gameController = new GameController(gameState, gameView);

    // Provide a global reference for debugging if needed, though not strictly required.
    window.game = gameController;
});
