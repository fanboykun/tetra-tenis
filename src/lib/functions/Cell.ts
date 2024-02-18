import { writable, type Writable } from "svelte/store"

export class Cell
{
    private size:number = 60
    public element : HTMLDivElement = document.createElement("div")
    public key:string = ''
    public isOccupied:boolean = false

    constructor(private boardWidth:number, private BoardHeight:number, private amountCell:number = 10, private xPosition:number = 1, private yPosition:number = 1) {
        const w = ( Math.round(boardWidth / 100) * 100 ) / amountCell
        const h = ( Math.round(BoardHeight / 100) * 100 ) / amountCell
        if(w != h) return
        
        this.size = w
        this.scratch()
    }

    scratch() : void {
        this.key = `cell-${this.xPosition}-${this.yPosition}`
        this.element.id = this.key

        this.element.style.backgroundColor = "#0A0A0A"
        this.element.style.width = `${this.size}px`
        this.element.style.height = `${this.size}px`
        this.element.style.position = "absolute"

        this.element.style.top = `${ (this.yPosition - 1)  * this.size}px`
        if(this.xPosition != 1) {
            this.element.style.left = `${ (this.xPosition - 1)  * this.size}px`
        } 
    }

    render() {
        if(this.element != null) return this.element.outerHTML
    }
}

export const cells: Writable<Cell[]> = writable([])