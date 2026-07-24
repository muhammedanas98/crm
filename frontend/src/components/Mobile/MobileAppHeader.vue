<template>
  <div class="flex pr-3 py-2" style="background-color: #fff200">
    <!-- custom/mobile: company logo (served by upc_branding) -->
    <div class="flex items-center justify-between pl-2">
      <img :src="logoUrl" alt="logo" class="h-10 w-auto" />
    </div>
    <div class="ml-auto flex items-center">
      <MobileUserMenu />
    </div>
  </div>
  <div class="pr-2">
    <div id="app-header" class="flex-1" />
  </div>
  <CallUI class="mr-3 mt-2" />
</template>

<script setup>
import CallUI from '@/components/Telephony/CallUI.vue'
import MobileUserMenu from '@/custom/mobile/MobileUserMenu.vue'
// Served by the upc_branding app; resolved at runtime, not bundled.
const logoUrl = '/assets/upc_branding/images/logo-with-name.png'
</script>
