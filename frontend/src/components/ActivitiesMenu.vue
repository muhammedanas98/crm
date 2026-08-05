<template>
  <Transition
    enter-active-class="transition-opacity duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      ref="target"
      class="absolute z-20 h-screen bg-surface-base transform-gpu will-change-[opacity]"
      :style="{
        'box-shadow': '8px 0px 8px rgba(0, 0, 0, 0.1)',
        'max-width': '200px',
        'min-width': '200px',
        left: 'calc(100% + 1px)',
      }"
    >
      <div class="flex h-screen flex-col text-ink-gray-9">
        <div class="text-lg-medium text-ink-gray-8 px-4 pt-[15px] pb-3">
          {{ __('Activities') }}
        </div>
        <nav class="flex flex-col px-2 gap-0.5">
          <button
            v-for="item in items"
            :key="item.label"
            type="button"
            class="flex w-full items-center gap-2.5 rounded border-0 bg-transparent px-2.5 py-2 text-left text-base text-ink-gray-8 hover:bg-surface-gray-2 focus:outline-none"
            @click="onItemClick(item)"
          >
            <component :is="item.icon" class="h-4.5 w-4.5" />
            {{ __(item.label) }}
          </button>
        </nav>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import NoteIcon from '@/components/Icons/NoteIcon.vue'
import TaskIcon from '@/components/Icons/TaskIcon.vue'
import PhoneIcon from '@/components/Icons/PhoneIcon.vue'
import CalendarIcon from '@/components/Icons/CalendarIcon.vue'
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const visible = defineModel()

const items = [
  { label: 'Calendar', icon: CalendarIcon, to: 'Calendar' },
  { label: 'Notes', icon: NoteIcon, to: 'Notes' },
  { label: 'Tasks', icon: TaskIcon, to: 'Tasks' },
  { label: 'Call Logs', icon: PhoneIcon, to: 'Call Logs' },
]

function onItemClick(item) {
  visible.value = false
  if (item.to) {
    router.push({ name: item.to })
  } else {
    item.onClick?.()
  }
}

const target = ref(null)
onClickOutside(
  target,
  () => {
    if (visible.value) visible.value = false
  },
  { ignore: ['#activities-btn'] },
)
</script>
