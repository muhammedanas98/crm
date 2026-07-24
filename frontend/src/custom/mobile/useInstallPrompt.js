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
const DISMISS_DAYS = 14
const DELAY_MS = 5000
const INSTALLED_VALUE = 'installed' // never expires

export const installEvent = ref(null)
export const dismissed = ref(isDismissed())
/** False until the page has been open long enough to interrupt the user. */
export const waited = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Suppress Chrome's own mini-infobar; we render our own card instead.
    e.preventDefault()
    installEvent.value = e
  })
  window.addEventListener('appinstalled', () => {
    installEvent.value = null
    localStorage.setItem(DISMISS_KEY, INSTALLED_VALUE)
    dismissed.value = true
  })
  setTimeout(() => (waited.value = true), DELAY_MS)
}

/**
 * A dismissal lapses after DISMISS_DAYS so "Not now" isn't permanent, but an
 * actual install is remembered forever. Unparseable values are treated as not
 * dismissed rather than hiding the card indefinitely.
 */
export function isDismissed(now = Date.now()) {
  const stored = localStorage.getItem(DISMISS_KEY)
  if (!stored) return false
  if (stored === INSTALLED_VALUE) return true
  const at = Number(stored)
  if (!Number.isFinite(at)) return false
  return now - at < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export function dismiss() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
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
      waited.value &&
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
