import { beforeEach, describe, expect, it } from 'vitest'
import { getInstallHint, isDismissed } from './useInstallPrompt'

const DAY = 24 * 60 * 60 * 1000

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
  iphoneFirefox:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15',
  ipadOS:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  androidFirefox:
    'Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  desktopFirefox:
    'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
}

describe('getInstallHint', () => {
  it('points iOS browsers at the share sheet', () => {
    expect(getInstallHint(UA.iphoneSafari)).toMatch(/Add to Home Screen/)
    expect(getInstallHint(UA.iphoneChrome)).toMatch(/Add to Home Screen/)
    expect(getInstallHint(UA.iphoneFirefox)).toMatch(/Add to Home Screen/)
  })

  it('treats a touch-capable Mac UA as iPadOS', () => {
    expect(getInstallHint(UA.ipadOS, 5)).toMatch(/Add to Home Screen/)
    // same UA without touch is a real Mac
    expect(getInstallHint(UA.macSafari, 0)).toMatch(/Add to Dock/)
  })

  it('covers Android Firefox, which has no install event', () => {
    expect(getInstallHint(UA.androidFirefox)).toMatch(/Add to Home screen/)
  })

  it('returns null where the card would be useless', () => {
    // Chromium fires beforeinstallprompt, so it gets a real button, not a hint
    expect(getInstallHint(UA.androidChrome)).toBeNull()
    // desktop Firefox cannot install PWAs at all
    expect(getInstallHint(UA.desktopFirefox)).toBeNull()
  })
})

describe('isDismissed', () => {
  const now = Date.parse('2026-07-24T12:00:00Z')

  beforeEach(() => localStorage.clear())

  it('is false when nothing was ever stored', () => {
    expect(isDismissed(now)).toBe(false)
  })

  it('holds for 14 days, then lapses', () => {
    localStorage.setItem('crm-install-dismissed', String(now - 13 * DAY))
    expect(isDismissed(now)).toBe(true)

    localStorage.setItem('crm-install-dismissed', String(now - 15 * DAY))
    expect(isDismissed(now)).toBe(false)
  })

  it('remembers an actual install forever', () => {
    localStorage.setItem('crm-install-dismissed', 'installed')
    expect(isDismissed(now + 3650 * DAY)).toBe(true)
  })

  it('ignores a corrupt value instead of hiding the card forever', () => {
    localStorage.setItem('crm-install-dismissed', 'yes')
    expect(isDismissed(now)).toBe(false)
  })
})
