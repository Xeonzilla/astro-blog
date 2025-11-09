/**
 * Svelte 5 action to close an element when clicking outside of it.
 * @param ignores - Array of element IDs that should not trigger the close action.
 * @returns A Svelte action function.
 */
export default function offClick(ignores: string[]) {
	return (element: HTMLElement) => {
		const handleClick = (event: MouseEvent) => {
			if (!(event.target instanceof Node)) return;

			const target = event.target;

			// Ignore clicks inside the element
			if (element.contains(target)) return;

			// Ignore clicks on specified elements
			const shouldIgnore = ignores.some((id) =>
				document.getElementById(id)?.contains(target),
			);

			if (!shouldIgnore) {
				element.classList.add("float-panel-closed");
			}
		};

		document.addEventListener("click", handleClick, true);

		// Cleanup function called when component is destroyed
		return () => {
			document.removeEventListener("click", handleClick, true);
		};
	};
}
