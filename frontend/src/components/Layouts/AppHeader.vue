<template>
  <div class="flex border-b pr-5">
    <!-- custom: company logo (served by upc_branding) -->
    <div class="flex items-center px-3">
      <img :src="logoUrl" alt="logo" class="h-9 w-auto" />
    </div>
    <div id="app-header" class="flex-1"></div>
    <div class="flex items-center justify-center">
      <CallUI />
    </div>
  </div>
</template>

<script setup>
import CallUI from '@/components/Telephony/CallUI.vue'
// Served by the upc_branding app; resolved at runtime, not bundled.
const logoUrl = '/assets/upc_branding/images/logo-with-name.png'
</script>
