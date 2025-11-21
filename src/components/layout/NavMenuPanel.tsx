import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { url } from "@utils/url-utils";
import { IconChevronRight, IconExternalLink } from "@/components/icons";
import type { NavBarLink } from "@/types/config";

interface NavMenuPanelProps {
	links: NavBarLink[];
}

export default component$<NavMenuPanelProps>(({ links }) => {
	const isOpen = useSignal(false);

	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for DOM event listeners
	useVisibleTask$(() => {
		// Handle document click for toggle
		const handleDocumentClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const switchBtn = document.getElementById("nav-menu-switch");
			if (switchBtn?.contains(target)) {
				isOpen.value = !isOpen.value;
			}
		};

		// Handle clicks outside panel
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const panel = document.getElementById("nav-menu-panel");
			const switchBtn = document.getElementById("nav-menu-switch");

			if (
				isOpen.value &&
				panel &&
				!panel.contains(target) &&
				switchBtn &&
				!switchBtn.contains(target)
			) {
				isOpen.value = false;
			}
		};

		document.addEventListener("click", handleDocumentClick);
		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleDocumentClick);
			document.removeEventListener("click", handleClickOutside);
		};
	});

	return (
		<>
			{isOpen.value && (
				<div
					id="nav-menu-panel"
					class="float-panel absolute right-4 px-2 py-2"
					style={{
						animation: "slideIn 150ms ease-out",
					}}
				>
					{links.map((link) => (
						<a
							key={link.url}
							href={link.external ? link.url : url(link.url)}
							class="group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg gap-8
                                hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active) transition"
							target={link.external ? "_blank" : undefined}
							rel={link.external ? "noopener noreferrer" : undefined}
						>
							<div class="transition text-black/75 dark:text-white/75 font-bold group-hover:text-(--primary) group-active:text-(--primary)">
								{link.name}
							</div>

							{!link.external ? (
								<div class="w-5 h-5 flex items-center justify-center shrink-0">
									<IconChevronRight class="transition text-xl text-(--primary)" />
								</div>
							) : (
								<div class="w-3 h-3 flex items-center justify-center shrink-0 -translate-x-1">
									<IconExternalLink class="transition text-xs text-black/25 dark:text-white/25" />
								</div>
							)}
						</a>
					))}
				</div>
			)}
		</>
	);
});
