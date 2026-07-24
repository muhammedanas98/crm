<template>
  <div class="flex pr-3" style="background-color: #fff200">
    <div class="z-20 ml-2 flex items-center justify-center">
      <Button
        class="size-7"
        variant="ghosted"
        @click="sidebarOpened = !sidebarOpened"
      >
        <MenuIcon class="h-4 text-ink-gray-9" />
      </Button>
    </div>
    <!-- custom/mobile: company logo (served by upc_branding) -->
    <div class="flex items-center px-2">
      <img :src="logoUrl" alt="logo" class="h-6 w-auto" />
    </div>
    <div id="app-header" class="flex-1" />
  </div>
  <CallUI class="mr-3 mt-2" />
</template>

<script setup>
import MenuIcon from '@/components/Icons/MenuIcon.vue'
import CallUI from '@/components/Telephony/CallUI.vue'
import { mobileSidebarOpened as sidebarOpened } from '@/composables/settings'
// Served by the upc_branding app; resolved at runtime, not bundled.
const logoUrl = '/assets/upc_branding/images/logo-with-name.png'
</script>
