<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="visible"
      ref="target"
      class="fixed bottom-3 left-[104px] z-20 w-[272px] rounded-xl bg-white p-3 origin-bottom-left dark:bg-surface-gray-9"
      :style="{ 'box-shadow': '0px 4px 16px rgba(0, 0, 0, 0.25)' }"
    >
      <div
        v-if="apps.loading"
        class="flex items-center justify-center py-6 text-sm text-ink-gray-5 dark:text-white/60"
      >
        {{ __('Loading...') }}
      </div>
      <div v-else class="grid grid-cols-3 gap-1">
        <a
          v-for="app in apps.data"
          :key="app.name"
          :href="app.route || '/' + app.name"
          class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 text-center hover:bg-surface-gray-2 dark:hover:bg-white/10"
        >
          <img
            v-if="app.logo"
            :src="app.logo"
            class="size-9 rounded-full object-cover"
          />
          <div
            v-else
            class="flex size-9 items-center justify-center rounded-full bg-surface-gray-3 text-sm font-medium text-ink-gray-8 dark:bg-white/10 dark:text-white"
          >
            {{ app.title?.[0] }}
          </div>
          <span
            class="w-full truncate text-[11px] text-ink-gray-8 dark:text-white"
            >{{ app.title }}</span
          >
        </a>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import { onClickOutside } from '@vueuse/core'
import { createResource } from 'frappe-ui'
import { ref } from 'vue'

const visible = defineModel()

const apps = createResource({
  url: 'frappe.apps.get_apps',
  auto: true,
})

const target = ref(null)
onClickOutside(
  target,
  () => {
    if (visible.value) visible.value = false
  },
  { ignore: ['#apps-btn'] },
)
</script>
