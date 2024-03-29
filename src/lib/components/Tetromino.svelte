<script lang="ts">
	import { onMount } from "svelte";
	import type { Colors, Matrix, Playfield, Tetromino, TetrominosList } from "$lib/types/TetrominoTypes";
	import GameStateButton from "./GameStateButton.svelte";

    let canvas : HTMLCanvasElement
    let context : CanvasRenderingContext2D|null
    const grid = 32;    // game board cells number
    const tetrominoSequence : string[] = [];

    // keep track of what is in every cell of the game using a 2d array
    // tetris playfield is 10x20, with a few rows offscreen
    let playfield: Playfield = populatePlayfield()

    // how to draw each tetromino
    // @see https://tetris.fandom.com/wiki/SRS
    const tetrominos : TetrominosList = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
    } as const

    // color of each tetromino
    const colors : Colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
    } as const

    let count = 0;  // ticking function
    let tetromino: Tetromino = getNextTetromino();
    let rAF : number = 0;  // keep track of the animation frame so we can cancel it
    
    let gameOver = false; 
    let score: number = 0

    let controls : "PLAY" | "PAUSE" | "START OVER" = "PLAY"
    let hasPlayed = false
    let shouldPlay = false
    let keyboardListened = false

    let bca : HTMLSpanElement|null

    onMount( async() => {
        if(canvas) context = canvas.getContext('2d');
    })

    // populate the empty state of the playfield
    function populatePlayfield() : Playfield {
        let toBePopulated : Playfield = []
        // populate the empty state of the playfield
        for (let row = -2; row < 20; row++) {
            toBePopulated[row] = [];
            for (let col = 0; col < 10; col++) {
                toBePopulated[row][col] = '';
            }
        }
        return toBePopulated
    }

    // get the next tetromino in the sequence
    function getNextTetromino() : Tetromino {
        if (tetrominoSequence.length === 0) {
            generateSequence();
        }
        let  name : string = ''
        if(tetrominoSequence.length != 0) {
            let n = tetrominoSequence.pop();
            if(typeof n != 'undefined') {
                name = n
            }
        }
        let matrix: Matrix = []
        if( typeof name == 'string' ) {
            matrix = tetrominos[name as keyof TetrominosList];
        }
        // I and O start centered, all others start in left-middle
        const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

        // I starts on row 21 (-1), all others start on row 22 (-2)
        const row = name === 'I' ? -1 : -2;

        return {
            name: name,      // name of the piece (L, O, etc.)
            matrix: matrix,  // the current rotation matrix
            row: row,        // current row (starts offscreen)
            col: col         // current col
        };
    }

    // generate a new tetromino sequence
    // @see https://tetris.fandom.com/wiki/Random_Generator
    function generateSequence() : void {
        const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

        while (sequence.length) {
            const rand = getRandomInt(0, sequence.length - 1);
            const name = sequence.splice(rand, 1)[0];
            tetrominoSequence.push(name);
        }
    }

    // get a random integer between the range of [min,max]
    // @see https://stackoverflow.com/a/1527820/2124254
    function getRandomInt(min:number, max:number) : number {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // rotate an NxN matrix 90deg
    // @see https://codereview.stackexchange.com/a/186834
    function rotate(matrix: Matrix) : Matrix {
        const N = matrix.length - 1;
        const result = matrix.map((row, i) =>
            row.map((_, j) => matrix[N - j][i])
        );
        return result;
    }

    // check to see if the new matrix/row/col is valid
    function isValidMove(matrix : Matrix, cellRow : number, cellCol : number) : boolean {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && (
                    // outside the game bounds
                    cellCol + col < 0 ||
                    cellCol + col >= playfield[0].length ||
                    cellRow + row >= playfield.length ||
                    // collides with another piece
                    playfield[cellRow + row][cellCol + col])
                    ) {
                    return false;
                }
            }
        }
        return true;
    }

    // place the tetromino on the playfieldplaceTetromino
    function placeTetromino() : void {
        let combo : number = 0
        // check for the game over
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    // game over if piece has any part offscreen
                    if (tetromino.row + row < 0) return showGameOver();
                    playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
                }
            }
        }

        // check for line clears starting from the bottom and working our way up
        for (let row = playfield.length - 1; row >= 0; ) {
            // check if every cell of the row is occupied (not emprty string like: '')
            if (playfield[row].every(cell => !!cell)) {
                // if so, drop every row above this one
                for (let r = row; r >= 0; r--) {
                    for (let c = 0; c < playfield[r].length; c++) {
                        playfield[r][c] = playfield[r-1][c];
                        combo++
                    }
                }
            } else {
                row--;
            }
        }
        let point = 1 * combo
        let newScore = score + point
        score = newScore
        tetromino = getNextTetromino();
    }

    // show the game over screen
    function showGameOver(shouldShowGameOver : boolean = true) : void {
        cancelAnimationFrame(rAF);
        gameOver = true;
        if(!shouldShowGameOver) return
        if(context != null) {
            context.fillStyle = 'black';
            context.globalAlpha = 0.75;
            context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        
            context.globalAlpha = 1;
            context.fillStyle = 'white';
            context.font = '36px monospace';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
        }
    }

    // game loop
    function loop() : void {
        if(!shouldPlay) return
        rAF = requestAnimationFrame(loop);
        context?.clearRect(0,0,canvas.width,canvas.height);

        // draw the playfield
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (playfield[row][col]) {
                    const name = playfield[row][col];
                    if(context != null) {
                        context.fillStyle = colors[name];
                        // drawing 1 px smaller than the grid creates a grid effect
                        context.fillRect(col * grid, row * grid, grid-1, grid-1);
                    }
                }
            }
        }

        // draw the active tetromino
        if (tetromino) {
            // tetromino falls every 35 frames
            if (++count > 35) {
                tetromino.row++;
                count = 0;

                // place piece if it runs into anything
                if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                    tetromino.row--;
                    placeTetromino();
                }
            }

            if(context != null) {
                context.fillStyle = colors[tetromino.name as string];
            }

            for (let row = 0; row < tetromino.matrix.length; row++) {
                for (let col = 0; col < tetromino.matrix[row].length; col++) {
                    if (tetromino.matrix[row][col]) {
                        // console.log((tetromino.col + col), (tetromino.row + row))
                        // drawing 1 px smaller than the grid creates a grid effect
                        context?.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
                    }
                }
            }
        }
    }

    // listens to keyboard event
    function listens() : void {
        if(keyboardListened) return
        // listen to keyboard events to move the active tetromino
        document.addEventListener('keydown', function(e) {
            if (gameOver) return;
            const keyCode = e.code
            // left and right arrow keys (move)
            if (keyCode === "ArrowLeft" || keyCode === "ArrowRight") {
                const col = keyCode == "ArrowLeft"
                ? tetromino.col - 1
                : tetromino.col + 1;
                if (isValidMove(tetromino.matrix, tetromino.row, col)) { 
                    tetromino.col = col;
                }
            }

            // up arrow key (rotate)
            if (keyCode === "ArrowUp") {
                const matrix = rotate(tetromino.matrix);
                if (isValidMove(matrix, tetromino.row, tetromino.col)) tetromino.matrix = matrix;
            }

            // down arrow key (drop)
            if(keyCode === "ArrowDown") {
                const row = tetromino.row + 1;
                if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
                    tetromino.row = row - 1;
                    placeTetromino();
                    return;
                }
                
                tetromino.row = row;
            }
            keyboardListened = true
        });

    }

    /**  Game State( Start, Pause, Start Over) changer*/
    function changeGameState(ctrl:string|null = null) : void {
        if(ctrl != null && ctrl != "START OVER") return
        if(ctrl === "START OVER") {
            cancelAnimationFrame(rAF)
            if(context != null) context.clearRect(0,0,canvas.width,canvas.height);
            rAF = 0
            
            playfield = populatePlayfield()
            tetromino = getNextTetromino();

            count = 0;  // ticking function
            score = 0

            hasPlayed = false
            shouldPlay = false
            controls = "PLAY"
        }

        if(controls === "PLAY") {
            controls = "PAUSE"   // if the btn clicked again, then the action is pause
            shouldPlay = true
            if(hasPlayed) return loop()
            play()
        } else if(controls === "PAUSE") {
            shouldPlay = false
            controls = "PLAY"  // if the btn clicked again, then the action is play
        }
    }

    const play = () => {
        if(hasPlayed) return    // prevent from registering requestAnimationFrame over and over again
        hasPlayed = true
        listens()
        // start the game
        rAF = requestAnimationFrame(loop);
    }

    $: {
        if(score != 0) {
            setTimeout(() => {
                bca?.classList.add("animate-bounce")
                setTimeout(() => {
                    bca?.classList.remove("animate-bounce")
                }, 1500)
            }, 50)
        }
    }

</script>
<div class="flex flex-row mt-[-13px] w-full scale-90 items-start justify-around">
    <div class="flex w-1/3 h-fit">
        <div class="flex flex-col gap-y-8">
            <GameStateButton click={changeGameState}>
                {controls == "PLAY" ? "Play" : "Pause"}
            </GameStateButton>
            {#if hasPlayed}
                <GameStateButton click={() => {changeGameState("START OVER")}}>
                    Start Over
                </GameStateButton>
            {/if}
        </div>
    </div>
    <canvas 
        width="320" 
        height="640" 
        class="border-2 border-white"
        bind:this={canvas}>
    </canvas>
    <div class="flex w-1/3 h-fit items-start justify-end">
        <h3 class="font-semibold text-lg px-8 py-1.5 text-center text-emerald-600 flex gap-x-2 underline decoration-wavy">
                {#if hasPlayed}
                    Score : 
                    <h3 
                        bind:this={bca}
                        class="no-underline decoration-none"> 
                        {score} 
                    </h3>
                {/if}
        </h3>
    </div>  
</div>