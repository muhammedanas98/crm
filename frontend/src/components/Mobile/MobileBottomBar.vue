<template>
  <div class="shrink-0 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
    <nav
      class="flex items-stretch gap-1 rounded-2xl border border-outline-gray-1 bg-surface-white/90 p-1.5 shadow-[0_6px_24px_-6px_rgba(17,17,17,0.16)] backdrop-blur-md"
    >
      <button
        v-for="tab in [...tabs, moreTab]"
        :key="tab.route"
        class="group flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7878]/40"
        :class="isActive(tab) ? 'text-[#FF7878]' : 'text-ink-gray-5'"
        @click="tab.action ? tab.action() : go(tab.route)"
      >
        <span
          class="flex items-center justify-center rounded-full px-4 py-1 transition-all duration-200"
          :class="
            isActive(tab)
              ? 'bg-[#FF7878]/12 scale-105'
              : 'group-active:bg-ink-gray-2/60'
          "
        >
          <component :is="tab.icon" class="size-[18px]" />
        </span>
        <span
          class="text-[10px] leading-none transition-all"
          :class="isActive(tab) ? 'font-semibold' : 'font-medium'"
        >
          {{ __(tab.label) }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import LucideLayoutDashboard from '~icons/lucide/layout-dashboard'
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
  { label: 'Home', icon: LucideLayoutDashboard, route: 'Dashboard' },
  { label: 'Leads', icon: LeadsIcon, route: 'Leads' },
  { label: 'Deals', icon: DealsIcon, route: 'Deals' },
  { label: 'Contacts', icon: ContactsIcon, route: 'Contacts' },
  { label: 'Tasks', icon: TaskIcon, route: 'Tasks' },
]

const moreTab = { label: 'More', icon: MenuIcon, action: openDrawer }

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
