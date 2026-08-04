import { createDocumentResource } from 'frappe-ui'
import { reactive, ref } from 'vue'

const settings = ref({})
const brand = reactive({})

const DEFAULT_SIDEBAR_COLOR = '#2B2154'

const _settings = createDocumentResource({
  doctype: 'FCRM Settings',
  name: 'FCRM Settings',
  onSuccess: (data) => {
    settings.value = data
    getSettings().setupBrand()
    return data
  },
})

// lighten a hex color in HSL space, used to derive the sidebar's active/hover shade from its base color
function lightenColor(hex, amount) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  l = Math.min(1, l + amount)

  function hueToRgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r2, g2, b2
  if (s === 0) {
    r2 = g2 = b2 = l
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q
    r2 = hueToRgb(p, q, h + 1 / 3)
    g2 = hueToRgb(p, q, h)
    b2 = hueToRgb(p, q, h - 1 / 3)
  }

  let toHex = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`
}

export function getSettings() {
  function setupBrand() {
    brand.name = settings.value?.brand_name
    brand.logo = settings.value?.brand_logo
    brand.favicon = settings.value?.favicon
    brand.sidebarColor = settings.value?.sidebar_color || DEFAULT_SIDEBAR_COLOR

    document.documentElement.style.setProperty(
      '--sidebar-color',
      brand.sidebarColor,
    )
    document.documentElement.style.setProperty(
      '--sidebar-active-color',
      lightenColor(brand.sidebarColor, 0.2),
    )
  }

  return {
    _settings,
    settings,
    brand,
    setupBrand,
  }
}
