<script lang="ts">
	import Menu from '$lib/components/Menu.svelte';
	import GameInfo from '$lib/components/GameInfo.svelte';
	import CellGameBoard from '$lib/components/CellGameBoard.svelte';


</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div id="page-wrapper" class="flex flex-row h-[100svh] w-screen ">
		<Menu />
		<CellGameBoard />
		<GameInfo />
	</div>
</section>

