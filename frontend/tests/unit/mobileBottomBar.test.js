import { describe, it, expect } from 'vitest'
import { shouldShowBottomBar } from '@/utils/mobileBottomBar'

describe('shouldShowBottomBar', () => {
  it('shows on list routes', () => {
    for (const name of ['Leads', 'Deals', 'Contacts', 'Tasks', 'Home']) {
      expect(shouldShowBottomBar(name)).toBe(true)
    }
  })

  it('hides on record detail routes', () => {
    for (const name of ['Lead', 'Deal', 'Contact', 'Organization']) {
      expect(shouldShowBottomBar(name)).toBe(false)
    }
  })

  it('hides when route name is missing', () => {
    expect(shouldShowBottomBar(undefined)).toBe(false)
    expect(shouldShowBottomBar(null)).toBe(false)
  })
})
