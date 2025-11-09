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
			if (!(event.target instanceof Node)) return;

			const target = event.target;

			// Ignore clicks inside the element
			if (element.contains(target)) return;

			// Ignore clicks on specified elements
			if (ignores) {
				const shouldIgnore = ignores.some((id) =>
					document.getElementById(id)?.contains(target),
				);

				if (shouldIgnore) return;
			}

			// Notify component to update state
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
