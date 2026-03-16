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
    const vocabManager = new VocabManager();
    const gameState = new GameState();
    
    // 2. Initialize UI
    const gameView = new GameView();
    const adminView = new AdminView();
    
    // 3. Initialize Controllers
    const adminController = new AdminController(vocabManager, adminView);
    const gameController = new GameController(gameState, gameView, vocabManager);

    // 4. Admin access button
    document.getElementById('admin-access-btn').addEventListener('click', () => {
        adminController.requestAccess();
    });

    // Provide global references for debugging
    window.game = gameController;
    window.admin = adminController;
});
