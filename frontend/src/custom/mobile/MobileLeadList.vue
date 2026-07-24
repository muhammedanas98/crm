<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Card-based Leads list rendered on screens < 768px.
  Keep changes minimal to simplify upstream merges.
  Reuses existing stores (statuses, users) and frappe-ui components only.
-->
<template>
  <div class="flex flex-col">
    <!-- Scrollable cards (Create button lives in the page header) -->
    <div class="space-y-2 p-3">
      <button
        v-for="lead in leads"
        :key="lead.name"
        class="flex w-full flex-col gap-2 rounded-lg border bg-surface-white p-3 text-left"
        style="min-height: 44px"
        @click="emit('open', lead.name)"
      >
        <!-- Name + status -->
        <div class="flex items-center justify-between gap-2">
          <div class="truncate text-base font-medium text-ink-gray-9">
            {{ lead.lead_name || lead.name }}
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <IndicatorIcon :class="getLeadStatus(lead.status)?.color" />
            <span class="text-sm text-ink-gray-7">{{ lead.status }}</span>
          </div>
        </div>

        <!-- Email -->
        <div class="truncate text-sm text-ink-gray-6">
          {{ lead.email || '—' }}
        </div>

        <!-- Assigned user -->
        <div class="flex items-center gap-2">
          <Avatar
            size="sm"
            :label="assignedUser(lead).full_name"
            :image="assignedUser(lead).user_image"
          />
          <span class="truncate text-sm text-ink-gray-7">
            {{ assignedUser(lead).full_name }}
          </span>
        </div>
      </button>

      <!-- Load more -->
      <Button
        v-if="leads.length && leads.length < totalCount"
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

// Raw lead docs from the existing ViewControls query. Reused as-is.
defineProps({
  leads: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['open', 'loadMore'])

const { getLeadStatus } = statusesStore()
const { getUser } = usersStore()

// ponytail: reads only fields ViewControls already fetched; blanks if a
// column isn't configured. Add fields to the list query if that happens.
function assignedUser(lead) {
  let email = lead.lead_owner
  // _assign is a JSON string array of assigned users.
  if (lead._assign) {
    try {
      email = JSON.parse(lead._assign)[0] || email
    } catch {
      // keep lead_owner fallback
    }
  }
  return getUser(email)
}
</script>
