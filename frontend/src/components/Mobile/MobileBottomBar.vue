<template>
  <nav
    class="flex shrink-0 items-stretch border-t border-outline-gray-1 bg-surface-white"
  >
    <button
      v-for="tab in tabs"
      :key="tab.route"
      class="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 focus:outline-none"
      :class="isActive(tab) ? 'text-ink-gray-9' : 'text-ink-gray-5'"
      @click="go(tab.route)"
    >
      <component :is="tab.icon" class="size-5" />
      <span class="text-xs">{{ __(tab.label) }}</span>
    </button>
    <button
      class="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-ink-gray-5 focus:outline-none"
      @click="openDrawer"
    >
      <MenuIcon class="size-5" />
      <span class="text-xs">{{ __('More') }}</span>
    </button>
  </nav>
</template>

<script setup>
import LeadsIcon from '@/components/Icons/LeadsIcon.vue'
import DealsIcon from '@/components/Icons/DealsIcon.vue'
import ContactsIcon from '@/components/Icons/ContactsIcon.vue'
import TaskIcon from '@/components/Icons/TaskIcon.vue'
import MenuIcon from '@/components/Icons/MenuIcon.vue'
import { mobileSidebarOpened } from '@/composables/settings'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { label: 'Leads', icon: LeadsIcon, route: 'Leads' },
  { label: 'Deals', icon: DealsIcon, route: 'Deals' },
  { label: 'Contacts', icon: ContactsIcon, route: 'Contacts' },
  { label: 'Tasks', icon: TaskIcon, route: 'Tasks' },
]

function isActive(tab) {
  return route.name === tab.route
}

function go(name) {
  if (route.name !== name) router.push({ name })
}

function openDrawer() {
  mobileSidebarOpened.value = true
}
</script>
