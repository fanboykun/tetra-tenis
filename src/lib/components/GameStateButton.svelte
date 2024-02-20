<script lang="ts">
    export let click: Function

    function onClick() {
        return click()
    }

</script>

<button
    type="button" 
    class="flex px-8 py-1.5 items-center justify-center min-w-[155px] border-2 border-gray-200 h-fit text-center rounded-tl-md rounded-br-md text-md font-semibold
    hover:rounded-lg hover:-translate-y-0.5 bg-[#202127] hover:shadow-lg hover:shadow-emerald-200 text-emerald-500 trasition-all duration-200"
    on:click={onClick}>
        <slot />
</button>