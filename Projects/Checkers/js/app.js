const game = new Game();

/** 
 * Listens for click on `#begin-game` and calls startGame() on game object
 */
document.getElementById('begin-game').addEventListener('click', function(){
    game.startGame();
    this.style.display = 'none';
});

/**
 * Listens for click to move checker
 */
document.getElementById('game-board').addEventListener('click', function(event) {
    game.handleClick(event);
});