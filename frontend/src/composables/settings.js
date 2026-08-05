import { computed, ref, watch } from 'vue'
import router from '@/router'

export const mobileSidebarOpened = ref(false)

export const isMobileView = computed(() => window.innerWidth < 768)

// Settings now lives at the /settings page instead of a modal. These refs
// stay around so existing call sites can keep doing
// `showSettings.value = true; activeSettingsPage.value = 'X'` to deep-link
// into a settings tab from anywhere in the app.
export const showSettings = ref(false)

export const disableSettingModalOutsideClick = ref(false)

export const activeSettingsPage = ref('')

export function settingsTabSlug(label) {
  return label
    ? label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
    : ''
}

watch(showSettings, (open) => {
  if (!open) return
  router.push({
    name: 'Settings',
    params: { tab: settingsTabSlug(activeSettingsPage.value) || undefined },
  })
})
