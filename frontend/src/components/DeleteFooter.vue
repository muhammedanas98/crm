<template>
  <div class="flex justify-end gap-3 border-t px-4 py-2.5 sm:px-10">
    <Button
      variant="solid"
      theme="red"
      :label="__('Delete')"
      iconLeft="lucide-trash-2"
      @click="$emit('delete')"
    />
  </div>
</template>

<script setup>
import { Button } from 'frappe-ui'

defineEmits(['delete'])
</script>
