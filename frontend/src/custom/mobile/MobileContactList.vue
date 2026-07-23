<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Card-based Contacts list rendered on screens < 768px.
  Keep changes minimal to simplify upstream merges.
-->
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex-1 space-y-2 overflow-y-auto p-3">
      <button
        v-for="contact in contacts"
        :key="contact.name"
        class="flex w-full flex-col gap-2 rounded-lg border bg-surface-white p-3 text-left"
        style="min-height: 44px"
        @click="emit('open', contact.name)"
      >
        <div class="flex items-center gap-2">
          <Avatar
            size="sm"
            :label="fullName(contact)"
            :image="contact.image"
          />
          <span class="truncate text-base font-medium text-ink-gray-9">
            {{ fullName(contact) }}
          </span>
        </div>
        <div class="truncate text-sm text-ink-gray-6">
          {{ contact.email_id || '—' }}
        </div>
        <div class="truncate text-sm text-ink-gray-7">
          {{ contact.mobile_no || '—' }}
        </div>
      </button>

      <Button
        v-if="contacts.length && contacts.length < totalCount"
        class="w-full"
        style="min-height: 44px"
        variant="subtle"
        :label="__('Load More')"
        @click="emit('loadMore')"
      />
    </div>
  </div>
</template>

<script setup>
import { Avatar, Button } from 'frappe-ui'

// Raw contact docs from the existing ViewControls query. Reused as-is.
defineProps({
  contacts: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['open', 'loadMore'])

function fullName(c) {
  return `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.name
}
</script>
