<template>
  <div class="flex border-b pr-5">
    <div id="app-header" class="flex-1"></div>
    <div class="flex items-center justify-center">
      <CallUI />
    </div>
  </div>
</template>

<script setup>
import CallUI from '@/components/Telephony/CallUI.vue'
// Served by the upc_branding app; resolved at runtime, not bundled.
</script>
