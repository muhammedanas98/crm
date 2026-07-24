<!--
  Custom override — isolated from upstream Frappe CRM.
  Install-this-app card. Chromium gets a real Install button; every other
  browser gets its own manual instructions. Hidden once installed or dismissed.
-->
<template>
  <div
    v-if="show"
    class="fixed inset-x-3 z-50 mx-auto max-w-md rounded-2xl border border-outline-gray-1 p-4 shadow-[0_8px_32px_-8px_rgba(17,17,17,0.28)]"
    :style="{
      bottom: 'calc(env(safe-area-inset-bottom) + 5.25rem)',
      // opaque white, not the theme token — the card floats over page content
      backgroundColor: '#ffffff',
    }"
    role="dialog"
    :aria-label="__('Install arizone CRM')"
  >
    <div class="flex items-start gap-3">
      <img :src="iconUrl" alt="" class="size-10 shrink-0 rounded-lg" />
      <div class="min-w-0 flex-1">
        <div class="text-base font-medium text-ink-gray-9">
          {{ __('Install arizone CRM') }}
        </div>
        <p class="mt-0.5 text-sm text-ink-gray-6">
          {{ hint || __('Add it to your home screen for faster access.') }}
        </p>
      </div>
    </div>

    <div class="mt-3 flex justify-end gap-2">
      <Button
        :label="__('Not now')"
        variant="ghost"
        style="min-height: 44px"
        @click="dismiss"
      />
      <Button
        v-if="canInstall"
        :label="__('Install')"
        variant="solid"
        style="min-height: 44px"
        @click="install"
      />
      <Button
        v-else
        :label="__('Got it')"
        variant="subtle"
        style="min-height: 44px"
        @click="dismiss"
      />
    </div>
  </div>
</template>

<script setup>
import { Button } from 'frappe-ui'
import { useInstallPrompt } from '@/custom/mobile/useInstallPrompt'

const { show, hint, canInstall, install, dismiss } = useInstallPrompt()

// Resolved at runtime, not bundled — the manifest icons are served by the app.
const iconUrl = '/assets/crm/manifest/arizone-icon-180.png'
</script>
