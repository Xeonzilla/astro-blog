import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils";
import { IconAutoMode, IconDarkMode, IconSunny } from "@/components/icons";
import type { LIGHT_DARK_MODE } from "@/types/config";

export default component$(() => {
	const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
	const mode = useSignal<LIGHT_DARK_MODE>(AUTO_MODE);
	const isPanelVisible = useSignal(false);

	const switchScheme = $((newMode: LIGHT_DARK_MODE) => {
		mode.value = newMode;
		setTheme(newMode);
	});

	const toggleScheme = $(() => {
		let i = 0;
		for (; i < seq.length; i++) {
			if (seq[i] === mode.value) {
				break;
			}
		}
		switchScheme(seq[(i + 1) % seq.length]);
	});

	const showPanel = $(() => {
		isPanelVisible.value = true;
	});

	const hidePanel = $(() => {
		isPanelVisible.value = false;
	});

	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for browser API access and system theme detection
	useVisibleTask$(() => {
		// Initialize mode from storage
		mode.value = getStoredTheme();

		// Listen for system theme changes
		const darkModePreference = window.matchMedia(
			"(prefers-color-scheme: dark)",
		);
		const changeThemeWhenSchemeChanged = () => {
			applyThemeToDocument(mode.value);
		};
		darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);

		return () => {
			darkModePreference.removeEventListener(
				"change",
				changeThemeWhenSchemeChanged,
			);
		};
	});

	return (
		<div
			class="relative z-50"
			role="menu"
			tabIndex={-1}
			onMouseLeave$={hidePanel}
		>
			<button
				type="button"
				aria-label="Light/Dark Mode"
				role="menuitem"
				class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
				id="scheme-switch"
				onClick$={toggleScheme}
				onMouseEnter$={showPanel}
			>
				<div
					class="absolute"
					style={{ opacity: mode.value !== LIGHT_MODE ? 0 : 1 }}
				>
					<IconSunny class="text-[1.25rem]" />
				</div>
				<div
					class="absolute"
					style={{ opacity: mode.value !== DARK_MODE ? 0 : 1 }}
				>
					<IconDarkMode class="text-[1.25rem]" />
				</div>
				<div
					class="absolute"
					style={{ opacity: mode.value !== AUTO_MODE ? 0 : 1 }}
				>
					<IconAutoMode class="text-[1.25rem]" />
				</div>
			</button>

			{isPanelVisible.value && (
				<div
					id="light-dark-panel"
					class="hidden lg:block absolute top-11 -right-2 pt-5"
					style={{
						animation: "slideIn 150ms ease-out",
					}}
				>
					<div class="card-base float-panel p-2">
						<button
							type="button"
							class={{
								"flex transition whitespace-nowrap items-center justify-start! w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5": true,
								"current-theme-btn": mode.value === LIGHT_MODE,
							}}
							onClick$={() => switchScheme(LIGHT_MODE)}
						>
							<IconSunny class="text-[1.25rem] mr-3" />
							{i18n(I18nKey.lightMode)}
						</button>
						<button
							type="button"
							class={{
								"flex transition whitespace-nowrap items-center justify-start! w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5": true,
								"current-theme-btn": mode.value === DARK_MODE,
							}}
							onClick$={() => switchScheme(DARK_MODE)}
						>
							<IconDarkMode class="text-[1.25rem] mr-3" />
							{i18n(I18nKey.darkMode)}
						</button>
						<button
							type="button"
							class={{
								"flex transition whitespace-nowrap items-center justify-start! w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95": true,
								"current-theme-btn": mode.value === AUTO_MODE,
							}}
							onClick$={() => switchScheme(AUTO_MODE)}
						>
							<IconAutoMode class="text-[1.25rem] mr-3" />
							{i18n(I18nKey.systemMode)}
						</button>
					</div>
				</div>
			)}
		</div>
	);
});
