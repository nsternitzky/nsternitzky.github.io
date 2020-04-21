class Board {
    constructor() {
        this.rows = 8;
        this.columns = 8;
        this.spaces = this.createSpaces();
    }

    /**
     * Generates 2D array of spaces
     * @return  {array}     spaces - array of Space objects
     */
    createSpaces() {
        const spaces = [];
        
		for (let x = 0; x < this.columns; x++) {
			const col = [];
			
			for (let y = 0; y < this.rows; y++) {
				const space = new Space(x, y);
				col.push(space);
			}
			
			spaces.push(col);
		}
        
        return spaces;
    }

    /** 
     * Draws associated HTML spaces for all game spaces
     */
	drawHTMLBoard() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                this.spaces[x][y].drawHTMLSpace();
            }
        }
	} 
}