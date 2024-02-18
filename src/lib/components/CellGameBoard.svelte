<script lang="ts">
    
    import { Cell, cells } from "$lib/functions/Cell";
	import { onMount } from "svelte";
    type BOXMAP = { x: number[], y: number[] }
    const keys = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'] as const

    // assume here are the cell map
    let boxMap : BOXMAP = {
        x: [ 0, 1 ],
        y: [ 10, 11 ]
    }

    const amountXCell = 10
    const amountYCell = 10

    let shouldBreak = false // game over state

    let objectXDirection = 0   // assume the object is from left
    let currentXPosition = objectXDirection // hold the old x position
    let moveXDirection: "LEFT" | "RIGHT" | null = null

    onMount( async () => {
        for( let j = 1; j <= amountXCell; j++ ) {
            for( let i = 1; i <= amountYCell; i++ ) {
                const cell = new Cell(600, 600, amountXCell, j, i)
                cells.update((v) => [...v, cell])
            }
        }
        watchKey()
        return await start()
    })

    async function start(): Promise<void> {
        let step = 1;
        let shouldStartOver = false
        const play = async () => {
            if(shouldBreak) {
                clearInterval(MovementInterval)
                return
            }
            const oldBoxMap = {...boxMap}
            if(!shouldStartOver) await clear(oldBoxMap)
            const newBoxMap = step == 1 ? {...boxMap} : next(boxMap)
            if(newBoxMap == boxMap) shouldStartOver = true 
            boxMap = newBoxMap
            await move(newBoxMap, oldBoxMap)
            step++
            if( step == amountYCell || shouldStartOver == true ) {
                clearInterval(MovementInterval)
                await changeCellOccupied(boxMap)
                const resetBoxMap = {
                    x: [ 0, 1 ],
                    y: [ 10, 11 ]
                }
                boxMap = {...resetBoxMap}
                currentXPosition = 0
                moveXDirection = null

                requestAnimationFrame(start)
            }
        }
        // const MovementInterval = setInterval( play, 250)
        const MovementInterval = setInterval( () => {
            requestAnimationFrame(play)
        }, 250)
    }

    async function move(boxMap: BOXMAP, oldBoxMap?: BOXMAP ) : Promise<void> {
        if(shouldBreak == true) return
        // get he cell address
        ii: for( let i in boxMap ) {
            const currentAdd = boxMap[i as keyof BOXMAP]
            jj: for(let j = 0; j < currentAdd.length; j++) {
                const add:number = currentAdd[j]
                const cell = $cells[add]
                if ( cell && cell.element instanceof HTMLDivElement ) {
                    if(cell.isOccupied == true) {
                        shouldBreak = true
                        alert('game over')
                        return
                    }
                    const k = cell.key;
                    let el: HTMLDivElement|null = document.querySelector(`#${k}`)
                    if(!el) return
                    el.style.backgroundColor = "white"
                } else {
                    console.error("Invalid cell element or cell is null");
                    shouldBreak = true
                    return
                }
            }
        }
    }
    
    async function clear(boxMap: BOXMAP ) : Promise<void> {
        if(shouldBreak == true) return
        // get he cell address
        ii: for( let i in boxMap ) {
            const currentAdd = boxMap[i as keyof BOXMAP]
            jj: for(let j = 0; j < currentAdd.length; j++) {
                const add:number = currentAdd[j]
                const cell = $cells[add]
                if(cell.isOccupied == true) return
                if (cell && cell.element instanceof HTMLDivElement) {
                    const k = cell.key;
                    let el: HTMLDivElement|null = document.querySelector(`#${k}`)
                    if(el) {
                        el.style.backgroundColor = "#0A0A0A"
                    }
                } else {
                    console.error("Invalid cell element or cell is null");
                }
            }
        }
    }

    function next( boxMap : BOXMAP ) : BOXMAP {
        const newMap:BOXMAP = {
            x: [],
            y: []
        }
        if( moveXDirection != null ) {
            currentXPosition = moveXDirection == "LEFT" ? currentXPosition - 1 : currentXPosition + 1
        }
        for( let i in boxMap ) {
            const currentAdd = boxMap[i as keyof BOXMAP]
            for(let j = 0; j < currentAdd.length; j++) {
                let newIndex:number = currentAdd[j] + 1
                if(objectXDirection != 0 && moveXDirection != null) {
                    let n = moveXDirection == "LEFT" ? newIndex - 10 : newIndex + 10 
                    newIndex = n
                }
                if($cells[newIndex].isOccupied == true) return boxMap
                newMap[i as keyof BOXMAP].push(newIndex)
            }
        }
        objectXDirection = 0
        moveXDirection = null
        return newMap
    }

    async function watchKey() : Promise<void> {
        document.addEventListener("keydown", (event) => {
            let keyCode = event.code;
            let key = keys.filter((v) => { return v == keyCode })?.toString()
            if(!key) return
            if(key == 'ArrowLeft' && currentXPosition > 0) {
                objectXDirection -= 1
                moveXDirection = "LEFT"
            } else if (key == 'ArrowRight' && currentXPosition < amountXCell) {
                objectXDirection += 1
                moveXDirection = "RIGHT"
            }
        })
    }
    
    async function changeCellOccupied(boxMap : BOXMAP) : Promise<void> {
        for( let i in boxMap ) {
            const currentAdd = boxMap[i as keyof BOXMAP]
            for(let j = 0; j < currentAdd.length; j++) {
                const add:number = currentAdd[j]
                const cell = $cells[add]
                if (cell ) {
                    $cells[add].isOccupied = true
                }
            }
        }
    }

</script>

<div 
    id="tetris-game-section" 
    class="relative inline-flex shadow-md bg-gray-300 min-w-[600px] max-w-[600px] w-1/3 h-[600px] my-auto">
    {#if $cells}
        {#each $cells as cell}
            {@html cell.element.outerHTML}
        {/each}
    {/if}
</div>