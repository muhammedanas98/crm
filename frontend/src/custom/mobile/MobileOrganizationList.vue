<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Card-based Organizations list rendered on screens < 768px.
  Keep changes minimal to simplify upstream merges.
-->
<template>
  <div class="flex flex-col">
    <div class="space-y-2 p-3">
      <button
        v-for="org in organizations"
        :key="org.name"
        class="flex w-full flex-col gap-2 rounded-lg border bg-surface-white p-3 text-left"
        style="min-height: 44px"
        @click="emit('open', org.name)"
      >
        <div class="flex items-center gap-2">
          <Avatar
            size="sm"
            :label="org.organization_name || org.name"
            :image="org.organization_logo"
          />
          <span class="truncate text-base font-medium text-ink-gray-9">
            {{ org.organization_name || org.name }}
          </span>
        </div>
        <div class="truncate text-sm text-ink-gray-6">
          {{ org.website || '—' }}
        </div>
        <div class="truncate text-sm text-ink-gray-7">
          {{ org.industry || '—' }}
        </div>
      </button>

      <Button
        v-if="organizations.length && organizations.length < totalCount"
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

// Raw organization docs from the existing ViewControls query. Reused as-is.
defineProps({
  organizations: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['open', 'loadMore'])
</script>
