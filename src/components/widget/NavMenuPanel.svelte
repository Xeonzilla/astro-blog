<script lang="ts">
	import Icon from "@iconify/svelte";
	import clickOutside from "@utils/svelte/clickOutside";
	import { url } from "@utils/url-utils";
	import type { NavBarLink } from "@/types/config";

	let { links }: { links: NavBarLink[] } = $props();
</script>

<div
	id="nav-menu-panel"
	class="float-panel float-panel-closed absolute transition-all right-4 px-2 py-2"
	{@attach clickOutside(["nav-menu-switch"])}
>
	{#each links as link}
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
				<Icon
					icon="material-symbols:chevron-right-rounded"
					class="transition text-[1.25rem] text-(--primary)"
				/>
			{:else}
				<Icon
					icon="fa6-solid:arrow-up-right-from-square"
					class="transition text-[0.75rem] text-black/25 dark:text-white/25 -translate-x-1"
				/>
			{/if}
		</a>
	{/each}
</div>
