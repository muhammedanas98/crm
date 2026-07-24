<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Card-based Tasks list rendered on screens < 768px.
  Keep changes minimal to simplify upstream merges.
-->
<template>
  <div class="flex flex-col">
    <div class="space-y-2 p-3">
      <button
        v-for="task in tasks"
        :key="task.name"
        class="flex w-full flex-col gap-2 rounded-lg border bg-surface-white p-3 text-left"
        style="min-height: 44px"
        @click="emit('open', task.name)"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="truncate text-base font-medium text-ink-gray-9">
            {{ task.title || task.name }}
          </span>
          <span class="shrink-0 text-sm text-ink-gray-7">{{ task.status }}</span>
        </div>
        <div class="flex items-center justify-between gap-2 text-sm text-ink-gray-6">
          <span>{{ task.priority || '—' }}</span>
          <span>{{ task.due_date ? formatDate(task.due_date) : '' }}</span>
        </div>
        <div v-if="task.assigned_to" class="flex items-center gap-2">
          <Avatar
            size="sm"
            :label="getUser(task.assigned_to).full_name"
            :image="getUser(task.assigned_to).user_image"
          />
          <span class="truncate text-sm text-ink-gray-7">
            {{ getUser(task.assigned_to).full_name }}
          </span>
        </div>
      </button>

      <Button
        v-if="tasks.length && tasks.length < totalCount"
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
import { usersStore } from '@/stores/users'
import { formatDate } from '@/utils'
import { Avatar, Button } from 'frappe-ui'

// Raw task docs from the existing ViewControls query. Reused as-is.
defineProps({
  tasks: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['open', 'loadMore'])

const { getUser } = usersStore()
</script>
