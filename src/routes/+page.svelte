<script lang="ts">
	import { onMount } from 'svelte';
	import { Tetris } from '$lib/functions/Tetris';
	import Menu from '$lib/components/Menu.svelte';
	import GameInfo from '$lib/components/GameInfo.svelte';
	import GameBoard from '$lib/components/GameBoard.svelte';
	import CellGameBoard from '$lib/components/CellGameBoard.svelte';

	let tetris: Tetris | null = null;
	onMount(() => {
		// tetris = new Tetris();
		// tetris.start();
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (tetris) {
			tetris.handleKeyDown(event);
		}
  	}

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div id="page-wrapper" class="flex flex-row h-[100svh] w-screen ">
		<Menu />
		<CellGameBoard />
		<!-- <GameBoard /> -->
		<GameInfo />
	</div>
</section>
