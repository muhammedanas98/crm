// Custom override — isolated from upstream Frappe CRM.
//
// PWA install prompt state. `beforeinstallprompt` can fire before any component
// mounts, so this module registers its listeners on import and main.js imports
// it for the side effect.
//
// Only Chromium browsers fire the event. Everywhere else the OS install path is
// manual, so the best a page can do is say where the menu item is.

import { computed, ref } from 'vue'

const DISMISS_KEY = 'crm-install-dismissed'

export const installEvent = ref(null)
export const dismissed = ref(localStorage.getItem(DISMISS_KEY) === '1')

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Suppress Chrome's own mini-infobar; we render our own card instead.
    e.preventDefault()
    installEvent.value = e
  })
  window.addEventListener('appinstalled', () => {
    installEvent.value = null
    dismiss()
  })
}

export function dismiss() {
  localStorage.setItem(DISMISS_KEY, '1')
  dismissed.value = true
}

/** Already running as an installed app? */
export function isStandalone(win = window) {
  return (
    win.matchMedia?.('(display-mode: standalone)').matches ||
    win.matchMedia?.('(display-mode: fullscreen)').matches ||
    win.matchMedia?.('(display-mode: minimal-ui)').matches ||
    win.navigator.standalone === true // iOS Safari
  )
}

/**
 * Manual install instructions for browsers that have no install API.
 * Returns null when the browser cannot install at all (desktop Firefox) —
 * telling those users to install something they can't would just confuse.
 * Pure function of the UA string so it can be tested without a browser.
 */
export function getInstallHint(ua, maxTouchPoints = 0) {
  const is = (re) => re.test(ua)
  // iPadOS 13+ reports a desktop Mac UA; touch points give it away.
  const isIOS = is(/iphone|ipod|ipad/i) || (is(/macintosh/i) && maxTouchPoints > 1)

  if (isIOS) {
    if (is(/crios/i)) return 'Tap Share in the address bar, then Add to Home Screen.'
    if (is(/fxios/i)) return 'Tap the menu, then Share, then Add to Home Screen.'
    return 'Tap Share at the bottom, then Add to Home Screen.'
  }
  if (is(/android/i) && is(/firefox/i)) {
    return 'Open the menu, then tap Add to Home screen.'
  }
  if (is(/macintosh/i) && is(/safari/i) && !is(/chrome|chromium/i)) {
    return 'Open the File menu, then choose Add to Dock.'
  }
  return null // desktop Firefox and anything else without an install path
}

export function useInstallPrompt() {
  const hint = computed(() =>
    installEvent.value
      ? null
      : getInstallHint(navigator.userAgent, navigator.maxTouchPoints),
  )

  const show = computed(
    () =>
      !dismissed.value &&
      !isStandalone() &&
      Boolean(installEvent.value || hint.value),
  )

  async function install() {
    const e = installEvent.value
    if (!e) return
    installEvent.value = null // a prompt event can only be used once
    e.prompt()
    const { outcome } = await e.userChoice
    if (outcome === 'dismissed') dismiss()
  }

  return { show, hint, canInstall: computed(() => !!installEvent.value), install, dismiss }
}
