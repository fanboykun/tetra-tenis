// constant
export type TetrominosList = {
    I: number[][];
    J: number[][];
    L: number[][];
    O: number[][];
    S: number[][];
    Z: number[][];
    T: number[][];
}

export type Colors = {
    [key: string] : string
}

export type Matrix = Array<number[]>

export type Tetromino = {
    name: string;
    matrix: Matrix;
    row: number;
    col: number;
}
export type Playfield = Array<string[]>
