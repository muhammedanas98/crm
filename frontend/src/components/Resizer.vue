<template>
  <div
    class="relative"
    :style="{ width: props.unit === 'percent' ? `${sidebarWidth}%` : `${sidebarWidth}px` }"
  >
    <slot v-bind="{ sidebarResizing, sidebarWidth }" />
    <div
      class="absolute z-10 h-full w-1 cursor-col-resize bg-surface-gray-4 opacity-0 transition-opacity hover:opacity-100"
      :class="{
        'opacity-100': sidebarResizing,
        'left-0': side == 'right',
        'right-0': side == 'left',
      }"
      @mousedown="startResize"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  defaultWidth: { type: Number, default: 352 },
  minWidth: { type: Number, default: 16 * 16 },
  maxWidth: { type: Number, default: 30 * 16 },
  side: { type: String, default: 'left' },
  parent: { type: Object, default: null },
  // 'px' (default, absolute) or 'percent' — when 'percent', defaultWidth/minWidth/maxWidth
  // are read as 0-100 values and the panel tracks the parent's width proportionally.
  unit: { type: String, default: 'px' },
})

const sidebarResizing = ref(false)
const sidebarWidth = ref(props.defaultWidth)

function startResize() {
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', () => {
    document.body.classList.remove('select-none')
    document.body.classList.remove('cursor-col-resize')
    document.querySelectorAll('.select-text1').forEach((el) => {
      el.classList.remove('select-text1')
      el.classList.add('select-text')
    })
    localStorage.setItem('sidebarWidth', sidebarWidth.value)
    sidebarResizing.value = false
    document.removeEventListener('mousemove', resize)
  })
}
function resize(e) {
  sidebarResizing.value = true
  document.body.classList.add('select-none')
  document.body.classList.add('cursor-col-resize')
  document.querySelectorAll('.select-text').forEach((el) => {
    el.classList.remove('select-text')
    el.classList.add('select-text1')
  })

  if (props.unit === 'percent') {
    const rect = props.parent
      ? props.parent.getBoundingClientRect()
      : { left: 0, width: window.innerWidth }
    const pxWidth =
      props.side == 'left'
        ? e.clientX - rect.left
        : rect.left + rect.width - e.clientX
    sidebarWidth.value = (pxWidth / rect.width) * 100
  } else {
    sidebarWidth.value =
      props.side == 'left' ? e.clientX : window.innerWidth - e.clientX

    let gap = props.parent ? distance() : 0
    sidebarWidth.value = sidebarWidth.value - gap
  }

  // snap to props.defaultWidth
  const snapMargin = props.unit === 'percent' ? 1 : 10
  let range = [
    props.defaultWidth - snapMargin,
    props.defaultWidth + snapMargin,
  ]
  if (sidebarWidth.value > range[0] && sidebarWidth.value < range[1]) {
    sidebarWidth.value = props.defaultWidth
  }

  if (sidebarWidth.value < props.minWidth) {
    sidebarWidth.value = props.minWidth
  }
  if (sidebarWidth.value > props.maxWidth) {
    sidebarWidth.value = props.maxWidth
  }
}
function distance() {
  if (!props.parent) return 0
  const rect = props.parent.getBoundingClientRect()
  return rect[props.side]
}
</script>
