<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Card-based Deals list rendered on screens < 768px.
  Keep changes minimal to simplify upstream merges.
  Reuses existing stores (statuses, users) and frappe-ui components only.
-->
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Scrollable cards (Create button lives in the page header) -->
    <div class="flex-1 space-y-2 overflow-y-auto p-3">
      <button
        v-for="deal in deals"
        :key="deal.name"
        class="flex w-full flex-col gap-2 rounded-lg border bg-surface-white p-3 text-left"
        style="min-height: 44px"
        @click="emit('open', deal.name)"
      >
        <!-- Name + status -->
        <div class="flex items-center justify-between gap-2">
          <div class="truncate text-base font-medium text-ink-gray-9">
            {{ deal.organization || deal.lead_name || deal.name }}
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <IndicatorIcon :class="getDealStatus(deal.status)?.color" />
            <span class="text-sm text-ink-gray-7">{{ deal.status }}</span>
          </div>
        </div>

        <!-- Email -->
        <div class="truncate text-sm text-ink-gray-6">
          {{ deal.email || '—' }}
        </div>

        <!-- Assigned user -->
        <div class="flex items-center gap-2">
          <Avatar
            size="sm"
            :label="assignedUser(deal).full_name"
            :image="assignedUser(deal).user_image"
          />
          <span class="truncate text-sm text-ink-gray-7">
            {{ assignedUser(deal).full_name }}
          </span>
        </div>
      </button>

      <!-- Load more -->
      <Button
        v-if="deals.length && deals.length < totalCount"
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
import IndicatorIcon from '@/components/Icons/IndicatorIcon.vue'
import { statusesStore } from '@/stores/statuses'
import { usersStore } from '@/stores/users'
import { Avatar, Button } from 'frappe-ui'

// Raw deal docs from the existing ViewControls query. Reused as-is.
defineProps({
  deals: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['open', 'loadMore'])

const { getDealStatus } = statusesStore()
const { getUser } = usersStore()

// ponytail: reads only fields ViewControls already fetched; blanks if a
// column isn't configured. Add fields to the list query if that happens.
function assignedUser(deal) {
  let email = deal.deal_owner
  // _assign is a JSON string array of assigned users.
  if (deal._assign) {
    try {
      email = JSON.parse(deal._assign)[0] || email
    } catch {
      // keep deal_owner fallback
    }
  }
  return getUser(email)
}
</script>
