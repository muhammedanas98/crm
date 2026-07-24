<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Mobile page title (view-switch dropdown disabled). The company logo lives in
  the global mobile top bar (MobileAppHeader.vue), so it's just the title here.
-->
<template>
  <div class="flex items-center">
    <span class="px-0.5 py-1 text-lg-medium text-ink-gray-7">
      {{ __(title) }}
    </span>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, required: true } })
</script>
