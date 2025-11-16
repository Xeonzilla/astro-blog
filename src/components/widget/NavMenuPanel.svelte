<script lang="ts">
	import Icon, { loadIcons } from "@iconify/svelte";
	import offClick from "@utils/svelte/offClick";
	import { url } from "@utils/url-utils";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import type { NavBarLink } from "@/types/config";

	let { links }: { links: NavBarLink[] } = $props();
	let isOpen = $state(false);

	// Preload icons on mobile
	onMount(() => {
		if (window.matchMedia("(max-width: 1023px)").matches) {
			loadIcons([
				"material-symbols:chevron-right-rounded",
				"fa6-solid:arrow-up-right-from-square",
			]);
		}
	});

	function toggleMenu() {
		isOpen = !isOpen;
	}
</script>

<svelte:document
	onclick={(e) => {
		const target = e.target as HTMLElement;
		const switchBtn = document.getElementById("nav-menu-switch");
		if (switchBtn?.contains(target)) {
			toggleMenu();
		}
	}}
/>

{#if isOpen}
	<div
		id="nav-menu-panel"
		class="float-panel absolute right-4 px-2 py-2"
		{@attach offClick(() => (isOpen = false), ["nav-menu-switch"])}
		transition:fly={{ y: -4, duration: 150 }}
	>
		{#each links as link (link.url)}
			<a
				href={link.external ? link.url : url(link.url)}
				class="group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg gap-8
	           hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active) transition
	       "
				target={link.external ? "_blank" : undefined}
				rel={link.external ? "noopener noreferrer" : undefined}
			>
				<div
					class="transition text-black/75 dark:text-white/75 font-bold group-hover:text-(--primary) group-active:text-(--primary)"
				>
					{link.name}
				</div>

				{#if !link.external}
					<div
						class="w-5 h-5 flex items-center justify-center shrink-0"
					>
						<Icon
							icon="material-symbols:chevron-right-rounded"
							class="transition text-xl text-(--primary)"
						/>
					</div>
				{:else}
					<div
						class="w-3 h-3 flex items-center justify-center shrink-0 -translate-x-1"
					>
						<Icon
							icon="fa6-solid:arrow-up-right-from-square"
							class="transition text-xs text-black/25 dark:text-white/25"
						/>
					</div>
				{/if}
			</a>
		{/each}
	</div>
{/if}
