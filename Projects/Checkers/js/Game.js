class Game {
    constructor() {
        this.board = new Board();
        this.players = this.createPlayers();
    }

    /** 
     * Creates two player objects
     * @return  {array}    players - array of two Player objects
     */
    createPlayers() {
        const players = [new Player('Player 1', 1, 'red', true),
                         new Player('Player 2', 2, 'black')];
        return players;
    }

    /** 
     * Returns active player
     * @return  {Object}    player - The active player
     */
	get activePlayer() {
        return this.players.find(player => player.active);
    }
    
    /**
     * Returns opposing (inactive) player
     * @returns {Object}    player - the opposing player
     */
    get opposingPlayer() {
        return this.players.find(player => !player.active);
    }

    /** 
     * Initializes game
     */
    startGame(){
        this.board.drawHTMLBoard();

        document.getElementById('turn-indicator').style.display = 'block';
        this.updateTurnIndicator();

        //draw player one's checkers
        const playerOneSpaces = [];
        for (let y=0; y < 3; y++) {
            for (let x=0; x < this.board.columns; x++) {
                if ((x % 2 === 1 && y % 2 === 0) ||
                    (x % 2 === 0 && y % 2 === 1)) {
                    playerOneSpaces.push(this.board.spaces[x][y]);
                }
            }
        }
        this.players[0].drawHTMLCheckers(playerOneSpaces);

        //draw player two's checkers
        const playerTwoSpaces = [];
        for (let y=this.board.rows - 1; y > this.board.rows - 4; y--) {
            for (let x=0; x < this.board.columns; x++) {
                if ((x % 2 === 1 && y % 2 === 0) ||
                    (x % 2 === 0 && y % 2 === 1)) {
                    playerTwoSpaces.push(this.board.spaces[x][y]);
                }
            }
        }
        this.players[1].drawHTMLCheckers(playerTwoSpaces);
    }

    /**
     * Updates turn indicator to current active player 
     */
    updateTurnIndicator() {
        const turnIndicator = document.getElementById('turn-indicator');
        turnIndicator.textContent = `${this.activePlayer.name}'s turn`;
        turnIndicator.style.color = this.activePlayer.color;
    }

    /**
     * Branches code depending on space clicked by player
     * @param   {Object}    event - click event object
     */
    handleClick(event) {
        //check for active checker and get HTML element clicked by player
        const activeChecker = this.activePlayer.activeChecker;
        const clickedDiv = this.getClickedDiv(event);

        if (!activeChecker) {//no active checker - first click

            //check that player clicked on a checker
            if (clickedDiv.classList.contains('checker')) {
                const checker = this.activePlayer.checkers.find(checker => checker.id === clickedDiv.id);
                if (checker) {//player clicked their own checker - make it active
                    checker.active = true;
                    clickedDiv.parentElement.classList.toggle('active');
                }
            }

        } else if (clickedDiv.id === activeChecker.id && !activeChecker.alreadyJumpedThisTurn) {//player clicked active checker - make it inactive (unless in middle of multi-jump)
            
            activeChecker.active = false;
            clickedDiv.parentElement.classList.toggle('active');

        } else if (clickedDiv.classList.contains('space') &&
                    !clickedDiv.children[0]) {//player clicked empty space - move (if valid move)
            
            this.attemptMove(clickedDiv);

        }
    }

    /**
     * Returns div for item clicked - empty space or checker (including if player clicked space containing checker)
     * @param   {Object}    event - click event object
     * @returns {Object}    clickedDiv - HTML element that player clicked on (or checker in space that player clicked on)
     */
    getClickedDiv(event) {
        let clickedDiv = null;
        if (event.target.classList.contains('space') && event.target.children[0]) {
            clickedDiv = event.target.children[0];
        } else {
            clickedDiv = event.target;
        }
        return clickedDiv;
    }

    /**
     * Checks validity of checker move
     * @param   {Object}    clickedSpaceDiv - HTML space clicked by player
     */
    attemptMove(clickedSpaceDiv) {
        const col = clickedSpaceDiv.id.charAt(6);
        const row = clickedSpaceDiv.id.charAt(8);
        const clickedSpace = this.board.spaces[col][row];
        const activeChecker = this.activePlayer.activeChecker;
        const activeCheckerSpace = activeChecker.space;
        let opponentChecker = null;
        let checkerWasMoved = false;
        let checkerWasJumped = false;

        if (this.activePlayer.id === 1 || this.activePlayer.activeChecker.isKing) {//player one or king checker - move down the board

            if (!activeChecker.alreadyJumpedThisTurn &&
                clickedSpace.y === activeCheckerSpace.y + 1 &&
                (clickedSpace.x === activeCheckerSpace.x - 1 ||
                clickedSpace.x === activeCheckerSpace.x + 1)) {//basic move forward

                activeChecker.moveChecker(clickedSpace);
                checkerWasMoved = true;

            } else if (clickedSpace.y === activeCheckerSpace.y + 2 &&
                    (
                        (clickedSpace.x === activeCheckerSpace.x - 2 &&
                            (opponentChecker = this.checkForOpponentChecker(activeCheckerSpace.x - 1, activeCheckerSpace.y + 1, this.activePlayer))
                        )
                        ||
                        (clickedSpace.x === activeCheckerSpace.x + 2 && 
                            (opponentChecker = this.checkForOpponentChecker(activeCheckerSpace.x + 1, activeCheckerSpace.y + 1, this.activePlayer))
                        )
                    )
                ) {//jump opponent's checker

                activeChecker.jumpChecker(clickedSpace, opponentChecker);
                checkerWasMoved = true;
                checkerWasJumped = true;
            }

        } 
        if (this.activePlayer.id === 2 || this.activePlayer.activeChecker.isKing) {//player two or king checker - move up the board

            if (!activeChecker.alreadyJumpedThisTurn &&
                clickedSpace.y === activeCheckerSpace.y - 1 &&
                (clickedSpace.x === activeCheckerSpace.x - 1 ||
                clickedSpace.x === activeCheckerSpace.x + 1)) {//basic move forward
                    
                activeChecker.moveChecker(clickedSpace);
                checkerWasMoved = true;

            } else if (clickedSpace.y === activeCheckerSpace.y - 2 &&
                    (
                        (clickedSpace.x === activeCheckerSpace.x - 2 && 
                            (opponentChecker = this.checkForOpponentChecker(activeCheckerSpace.x - 1, activeCheckerSpace.y - 1, this.activePlayer))
                        )
                        ||
                        (clickedSpace.x === activeCheckerSpace.x + 2 && 
                            (opponentChecker = this.checkForOpponentChecker(activeCheckerSpace.x + 1, activeCheckerSpace.y - 1, this.activePlayer))
                        )
                    )
                ) {//jump opponent's checker

                activeChecker.jumpChecker(clickedSpace, opponentChecker);
                checkerWasMoved = true;
                checkerWasJumped = true;

            }
        }
        if (checkerWasMoved) {
            this.updateGameState(checkerWasJumped);
        }
    }

    /**
     * Checks space located at (x,y) for opponent's checker
     * @param   {integer}       x - x coordinate of space to be checked
     * @param   {integer}       y - y coordinate of space to be checked
     * @param   {Object}        player - player who's checking this space for their opponent's checker
     * @returns {Object | null} checker - opponent's checker in indicated space (if there is one)
     */
    checkForOpponentChecker(x, y, player) {
        let checker = null;
        const space = this.board.spaces[x][y];
        if (space.checker && space.checker.owner !== player) {
            checker = space.checker;
        }
        return checker;
    }

    /**
     * Updates game state after checker is moved
     * @param   {boolean}    checkerWasJumped - represents whether last move was a jump
     */
    updateGameState(checkerWasJumped) {
        if (!this.checkForWin()) {//no win - keep playing

            this.checkForKing(this.activePlayer.activeChecker);
            
            if (!checkerWasJumped || //last move was not jump
                !this.checkForJump(this.activePlayer.activeChecker)) {//active player cannot make another jump with active checker

                this.activePlayer.activeChecker.alreadyJumpedThisTurn = false;
                this.activePlayer.activeChecker.active = false;
                this.switchPlayers();

            } else if (checkerWasJumped && //last move was jump
                this.checkForJump(this.activePlayer.activeChecker)) {//active player can jump again with active checker

                document.getElementById(this.activePlayer.activeChecker.space.id).classList.toggle('active');
                }

        } else {//win achieved
            document.getElementById('game-over').textContent = `${this.activePlayer.name} wins!`;
            document.getElementById('game-over').style.color = this.activePlayer.color;
        }
    }

    /**
     * Checks whether a win condition has been met
     * @returns {boolean}   win - expresses whether any win condition has been met
     */
    checkForWin() {
        let win = false;

        if (this.opposingPlayer.remainingCheckers.length === 0) {//opponent has no checkers left
            win = true;
        }

        if (!(this.opposingPlayer.remainingCheckers.find(checker => this.checkForMove(checker)) !== undefined ||
            this.opposingPlayer.remainingCheckers.find(checker => this.checkForJump(checker)) !== undefined)) {//opponent has no moves left
                win = true;
            }

        return win;
    }

    /**
     * Checks whether active checker becomes king after being moved
     * @param   {Object}    checker - checker to be checked for becoming king
     */
    checkForKing(checker) {
        const checkerSpace = checker.space;
        if ((checker.owner.id === 1 && checkerSpace.y === this.board.rows - 1) ||
            (checker.owner.id === 2 && checkerSpace.y === 0)) {
            checker.makeKing();
        }
    }

    /**
     * Checks whether player can do basic move with a certain checker
     * @param   {Object}    checker - checker being checked to see if it can move
     * @returns {boolean}   canMove - represents whether checker can move
     */
    checkForMove(checker) {
        let canMove = false;
        const checkerSpace = checker.space;

        if (checker.owner.id === 1 || checker.isKing) {//player one or king checker - jump down the board
            
            if (    (this.board.spaces[checkerSpace.x + 1] &&
                    this.board.spaces[checkerSpace.x + 1][checkerSpace.y + 1] && //check that space exists on board
                    this.board.spaces[checkerSpace.x + 1][checkerSpace.y + 1].checker === null) //check that space is empty)
                ||
                    (this.board.spaces[checkerSpace.x - 1] &&
                    this.board.spaces[checkerSpace.x - 1][checkerSpace.y + 1] && //check that space exists on board
                    this.board.spaces[checkerSpace.x - 1][checkerSpace.y + 1].checker === null) //check that space is empty
                ) {

                    canMove = true;

            }
        }

        if (checker.owner.id === 2 || checker.isKing) {//player two or king checker - jump up the board

            if (    (this.board.spaces[checkerSpace.x + 1] &&
                    this.board.spaces[checkerSpace.x + 1][checkerSpace.y - 1] && //check that space exists on board
                    this.board.spaces[checkerSpace.x + 1][checkerSpace.y - 1].checker === null) //check that space is empty
                ||
                    (this.board.spaces[checkerSpace.x - 1] &&
                    this.board.spaces[checkerSpace.x - 1][checkerSpace.y - 1] && //check that space exists on board
                    this.board.spaces[checkerSpace.x - 1][checkerSpace.y - 1].checker === null) //check that space is empty
                ) {

                    canMove = true;

            }
        }

        return canMove;
    }

    /**
     * Checks whether player can perform a jump with a certain checker
     * @param   {Object}    checker - checker being checked to see if it can perform jump
     * @returns {boolean}   canJump - boolean value representing whether checker can perform jump
     */
    checkForJump(checker) {
        let canJump = false;
        const checkerSpace = checker.space;

        if (checker.owner.id === 1 || checker.isKing) {//player one or king checker - jump down the board
            
            if ((this.board.spaces[checkerSpace.x + 2] &&
                this.board.spaces[checkerSpace.x + 2][checkerSpace.y + 2] && //check that space exists on board
                this.board.spaces[checkerSpace.x + 2][checkerSpace.y + 2].checker === null && //check that space is empty
                this.checkForOpponentChecker(checkerSpace.x + 1, checkerSpace.y + 1, checker.owner))
                ||
                (this.board.spaces[checkerSpace.x - 2] &&
                this.board.spaces[checkerSpace.x - 2][checkerSpace.y + 2] && //check that space exists on board
                this.board.spaces[checkerSpace.x - 2][checkerSpace.y + 2].checker === null && //check that space is empty
                this.checkForOpponentChecker(checkerSpace.x - 1, checkerSpace.y + 1, checker.owner))) {

                    canJump = true;

            }
        }

        if (checker.owner.id === 2 || checker.isKing) {//player two or king checker - jump up the board

            if ((this.board.spaces[checkerSpace.x + 2] &&
                this.board.spaces[checkerSpace.x + 2][checkerSpace.y - 2] && //check that space exists on board
                this.board.spaces[checkerSpace.x + 2][checkerSpace.y - 2].checker === null && //check that space is empty
                this.checkForOpponentChecker(checkerSpace.x + 1, checkerSpace.y - 1, checker.owner))
                ||
                (this.board.spaces[checkerSpace.x - 2] &&
                this.board.spaces[checkerSpace.x - 2][checkerSpace.y - 2] && //check that space exists on board
                this.board.spaces[checkerSpace.x - 2][checkerSpace.y - 2].checker === null && //check that space is empty
                this.checkForOpponentChecker(checkerSpace.x - 1, checkerSpace.y - 1, checker.owner))) {

                    canJump = true;

            }
        }

        return canJump;
    }

    /** 
     * Switches active player
     */
	switchPlayers() {
		for (let player of this.players) {
			player.active = player.active === true ? false : true;
        }
        this.updateTurnIndicator();
    }
}