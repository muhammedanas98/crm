<!--
  custom: company logo replaces the stock CRM mark. Lives in frontend/public,
  which the build copies to /assets/crm/frontend/. `!w-auto object-contain` keeps
  the wordmark's aspect ratio when call sites pass square sizing (size-8, size-12).
-->
<template>
  <img :src="logoUrl" alt="logo" class="!w-auto max-w-full object-contain" />
</template>

<script setup>
const logoUrl = '/assets/crm/frontend/logo-with-name.png'
</script>
