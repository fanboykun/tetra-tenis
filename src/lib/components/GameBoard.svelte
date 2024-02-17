<script lang="ts">
	import { onMount } from "svelte";
	import type { TemplateNode } from "svelte/types/compiler/interfaces";

    let d : HTMLDivElement
    let box:HTMLDivElement

    let yPos = 0
    let xPos = 0

    let dH : number|undefined
    let bH : number
    let dW : number|undefined
    let bW : number

    const keys = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'] as const
    
    onMount(() => {
        let i : HTMLDivElement|null = document.querySelector('#box')
        if(i instanceof HTMLDivElement) {
            box = i
            box.classList.remove('hidden')
            begin()
            watchKey()
        }
	});

    function begin() : void {
        dH = d?.clientHeight
        bH = box?.clientHeight
        dW = d.clientWidth
        bW = box.clientWidth
        moveY()
    }

    function watchKey() : void {
        document.addEventListener('keydown', (event) : void => {
            let keyCode = event.code;
            let key = keys.filter((v) => { return v == keyCode })?.toString()
            if(!key) return
            console.log(key)

            if(key == 'ArrowLeft') {
                moveX("left")
            } else if (key == 'ArrowRight') {
                moveX("right")
            }

        })
    }

    function moveY() : void {
        const boxInterval = setInterval(() => {
            yPos += 10
            box.style.top = `${yPos}px`
            if( typeof dH != 'undefined' && (dH - yPos) < bH + 5 ) {
                clearInterval(boxInterval)
                spawn()
            }
        }, 50)
    }

    function moveX( direction: direcrtion ) : void {
        if(direction == "left") {
            if(box.style.left == '' || box.style.left == '0' || box.style.left == '0px' ) return
            xPos -= 50
        }else if(direction == "right") {
            if( typeof dW != 'undefined' && dW - xPos < 150 ) return
            xPos += 50
        }

        box.style.left = `${xPos}px`
    }

    function spawn() : void {
        let i : HTMLDivElement|null = document.querySelector('#box')
        if(i instanceof HTMLDivElement) {
            box = i
            box.classList.remove('hidden')
        }
    }

    type direcrtion = "left" | "right"

</script>

<div 
    id="tetris-game-section" 
    bind:this={d} 
    class="relative flex shadow-md bg-gray-300 min-w-[600px] max-w-[600px] w-1/3 h-full">
    <div 
        class="absolute w-24 h-24 bg-black hidden" 
        style="top: 0;"
        id="box">
    </div>
</div>
