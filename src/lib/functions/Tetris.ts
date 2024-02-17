// Tetris.ts
enum Piece {
    None,
    I,
    J,
    L,
    O,
    S,
    T,
    Z
  }
  
  type Grid = number[][];
  
  class Tetris {
    grid: Grid = [];
    currentPiece: Piece = Piece.None;
  
    constructor() {
      for (let y = 0; y < 20; y++) {
        this.grid[y] = [];
        for (let x = 0; x < 10; x++) {
          this.grid[y][x] = 0;
        }
      }
    }
  
    start() {
        console.log('running')
      // Start the game
    }
  
    handleKeyDown(event: KeyboardEvent) {
        console.log(event)
      // Handle key down events for controls
    }
  }
  
  export { Tetris };
  