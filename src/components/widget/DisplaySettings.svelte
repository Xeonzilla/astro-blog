<script lang="ts">
    import I18nKey from "@i18n/i18nKey";
    import { i18n } from "@i18n/translation";
    import Icon from "@iconify/svelte";
    import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";
    import offClick from "@utils/svelte/offClick";
    import { fly } from "svelte/transition";

    let hue = $state(getHue());
    const defaultHue = getDefaultHue();
    let isOpen = $state(false);

    function resetHue() {
        hue = getDefaultHue();
    }

    $effect(() => {
        if (hue || hue === 0) {
            setHue(hue);
        }
    });

    // Listen for toggle button clicks
    $effect(() => {
        const switchBtn = document.getElementById("display-settings-switch");
        if (!switchBtn) return;

        const handleToggle = () => {
            isOpen = !isOpen;
        };

        switchBtn.addEventListener("click", handleToggle);
        return () => switchBtn.removeEventListener("click", handleToggle);
    });
</script>

{#if isOpen}
    <div
        id="display-setting"
        class="float-panel absolute w-80 right-4 px-4 py-4"
        {@attach offClick(() => isOpen = false, ["display-settings-switch"])}
        transition:fly={{ y: -4, duration: 150 }}
    >
        <div class="flex flex-row gap-2 mb-3 items-center justify-between">
            <div
                class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
            before:absolute before:-left-3 before:top-[0.33rem]"
            >
                {i18n(I18nKey.themeColor)}
                <button
                    aria-label="Reset to Default"
                    class="btn-regular w-7 h-7 rounded-md active:scale-90 will-change-transform"
                    class:opacity-0={hue === defaultHue}
                    class:pointer-events-none={hue === defaultHue}
                    onclick={resetHue}
                >
                    <div class="text-(--btn-content)">
                        <Icon
                            icon="fa6-solid:arrow-rotate-left"
                            class="text-[0.875rem]"
                        ></Icon>
                    </div>
                </button>
            </div>
            <div class="flex gap-1">
                <div
                    id="hueValue"
                    class="transition bg-(--btn-regular-bg) w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-(--btn-content)"
                >
                    {hue}
                </div>
            </div>
        </div>
        <div
            class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded-sm select-none"
        >
            <input
                aria-label={i18n(I18nKey.themeColor)}
                type="range"
                min="0"
                max="360"
                bind:value={hue}
                class="slider"
                id="colorSlider"
                step="5"
                style="width: 100%"
            />
        </div>
    </div>
{/if}

<style>
    #display-setting {
        input[type="range"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            height: 1.5rem;
            background-image: var(--color-selection-bar);
            transition: background-image 0.15s ease-in-out;

            /* Input Thumb */
            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 1rem;
                width: 0.5rem;
                border-radius: 0.125rem;
                background: rgba(255, 255, 255, 0.7);
                box-shadow: none;

                &:hover {
                    background: rgba(255, 255, 255, 0.8);
                }
                &:active {
                    background: rgba(255, 255, 255, 0.6);
                }
            }

            &::-moz-range-thumb {
                -moz-appearance: none;
                appearance: none;
                height: 1rem;
                width: 0.5rem;
                border-radius: 0.125rem;
                border-width: 0;
                background: rgba(255, 255, 255, 0.7);
                box-shadow: none;

                &:hover {
                    background: rgba(255, 255, 255, 0.8);
                }
                &:active {
                    background: rgba(255, 255, 255, 0.6);
                }
            }
        }
    }
</style>
