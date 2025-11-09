import type { Attachment } from "svelte/attachments";

/**
 * Svelte 5 attachment to detect clicks outside an element.
 * Automatically adds "float-panel-closed" class when clicking outside.
 *
 * @param ignores - Optional array of element IDs to ignore
 * @returns Svelte attachment
 */
export default function offClick(ignores?: string[]): Attachment<HTMLElement> {
	return (element: HTMLElement) => {
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

			// Add close class to trigger closing animation
			element.classList.add("float-panel-closed");
		};

		document.addEventListener("click", handleClick, true);

		return () => {
			document.removeEventListener("click", handleClick, true);
		};
	};
}
