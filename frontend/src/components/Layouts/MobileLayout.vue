<template>
  <!-- custom/mobile: h-dvh (not h-screen/100vh) so the shell matches the real
       visible viewport on mobile browsers with a collapsing URL bar. Keeps the
       top bar and bottom bar pinned; only the middle region scrolls. -->
  <div class="flex h-dvh w-full overflow-hidden">
    <MobileSidebar />
    <div class="flex h-full min-w-0 flex-1 flex-col bg-surface-base">
      <div class="shrink-0">
        <MobileAppHeader />
      </div>
      <div class="min-w-0 flex-1 overflow-y-auto overscroll-contain">
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
