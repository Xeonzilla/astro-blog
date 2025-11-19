import type { Attachment } from "svelte/attachments";

/**
 * Svelte 5 attachment to detect clicks outside an element.
 * Invokes callback when clicking outside, allowing component to control state.
 *
 * @param callback - Function to call when clicking outside
 * @param ignores - Optional array of element IDs to ignore
 * @returns Svelte attachment
 *
 * @example
 * ```svelte
 * <script>
 *   import { fly } from 'svelte/transition';
 *   import offClick from './utils/svelte/offClick';
 *
 *   let isOpen = $state(true);
 * </script>
 *
 * {#if isOpen}
 *   <div
 *     {@attach offClick(() => isOpen = false, ['menu-btn'])}
 *     transition:fly={{ y: -4, duration: 200 }}
 *     class="float-panel"
 *   >
 *     <!-- Panel content -->
 *   </div>
 * {/if}
 * ```
 */
export default function offClick(
	callback: () => void,
	ignores?: string[],
): Attachment<HTMLElement> {
	return (element: HTMLElement) => {
		let registered = false;

		const handleClick = (event: MouseEvent) => {
			const target = event.target;

			if (!(target instanceof Node)) return;

			// Ignore clicks inside the element
			if (element.contains(target)) return;

			// Ignore clicks on specified elements (cache getElementById results)
			if (ignores?.length) {
				for (const id of ignores) {
					const ignoredEl = document.getElementById(id);
					if (ignoredEl?.contains(target)) return;
				}
			}

			// Invoke callback
			callback();
		};

		// Defer listener registration to avoid capturing the triggering click
		const timeoutId = setTimeout(() => {
			registered = true;
			document.addEventListener("click", handleClick, true);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			if (registered) {
				document.removeEventListener("click", handleClick, true);
			}
		};
	};
}
