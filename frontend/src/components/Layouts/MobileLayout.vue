<template>
  <div class="flex h-screen w-screen">
    <MobileSidebar />
    <div class="flex h-full flex-1 flex-col bg-surface-base">
      <MobileAppHeader />
      <div class="flex-1 overflow-auto">
        <slot />
      </div>
      <MobileBottomBar />
    </div>
    <GlobalModals />
  </div>
</template>
<script setup>
import MobileSidebar from '@/components/Mobile/MobileSidebar.vue'
import MobileAppHeader from '@/components/Mobile/MobileAppHeader.vue'
import MobileBottomBar from '@/components/Mobile/MobileBottomBar.vue'
import GlobalModals from '@/components/Modals/GlobalModals.vue'
</script>
