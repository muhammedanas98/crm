<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Card-based Call Logs list rendered on screens < 768px.
  Reuses the table view's parsing (getCallLogDetail) for status color,
  caller/receiver avatar, type icon and duration.
-->
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex-1 space-y-2 overflow-y-auto p-3">
      <button
        v-for="log in callLogs"
        :key="log.name"
        class="flex w-full items-center gap-3 rounded-lg border bg-surface-white p-3 text-left"
        style="min-height: 44px"
        @click="emit('open', log.name)"
      >
        <Avatar
          size="lg"
          :image="party(log).image"
          :label="party(log).label || log.from"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="truncate font-medium text-ink-gray-9">
              {{ party(log).label || log.from || __('Unknown') }}
            </span>
            <Badge
              variant="subtle"
              size="sm"
              :theme="statusOf(log).color"
              :label="statusOf(log).label"
            />
          </div>
          <div class="mt-1 flex items-center gap-1.5 text-sm text-ink-gray-6">
            <FeatherIcon :name="typeOf(log).icon" class="h-3.5 w-3.5 shrink-0" />
            <span>{{ typeOf(log).label }}</span>
            <span class="text-ink-gray-4">·</span>
            <span>{{ durationOf(log).label || '0:00' }}</span>
            <span class="text-ink-gray-4">·</span>
            <span class="truncate">{{ timeText(log) }}</span>
          </div>
        </div>
      </button>

      <Button
        v-if="callLogs.length && callLogs.length < totalCount"
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
import { getCallLogDetail } from '@/utils/callLog'
import { formatDate } from '@/utils'
import { Avatar, Badge, FeatherIcon } from 'frappe-ui'

// Raw call log docs from the existing ViewControls query. Reused as-is.
defineProps({
  callLogs: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['open', 'loadMore'])

const incoming = (l) => l.type === 'Incoming'
const party = (l) =>
  incoming(l) ? getCallLogDetail('caller', l) : getCallLogDetail('receiver', l)
const statusOf = (l) => getCallLogDetail('status', l)
const typeOf = (l) => getCallLogDetail('type', l)
const durationOf = (l) => getCallLogDetail('duration', l)
const timeText = (l) => (l.start_time ? formatDate(l.start_time) : '')
</script>
