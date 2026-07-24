<!--
  Custom mobile override — isolated from upstream Frappe CRM.
  Avatar button in the mobile top bar; tap opens a dropdown with Profile / Log out.
-->
<template>
  <Dropdown :options="options" placement="right">
    <button
      class="flex items-center justify-center rounded-full"
      style="min-height: 44px; min-width: 44px"
      :aria-label="__('Account')"
    >
      <Avatar
        class="!size-10 ring-2 ring-white ring-offset-1 ring-offset-black/10"
        :image="user.user_image"
        :label="user.full_name || user.name"
        size="2xl"
      />
    </button>
  </Dropdown>

  <!-- custom/mobile: the desktop Settings shell is a 5xl dialog with a fixed
       224px sidebar — unusable on a phone. Render the profile page on its own. -->
  <Dialog v-model:open="showProfile" :size="'xl'">
    <template #body>
      <div class="h-[80vh] overflow-y-auto">
        <ProfilePage />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Avatar, Dialog, Dropdown } from 'frappe-ui'
import LucideLogOut from '~icons/lucide/log-out'
import LucideUser from '~icons/lucide/user'
import ProfilePage from '@/components/Settings/Profile/ProfilePage.vue'
import { usersStore } from '@/stores/users'
import { sessionStore } from '@/stores/session'

const { getUser } = usersStore()
const { logout } = sessionStore()

const showProfile = ref(false)

const user = computed(() => getUser() || {})

const options = computed(() => [
  {
    label: __('Profile'),
    icon: LucideUser,
    onClick: () => (showProfile.value = true),
  },
  {
    label: __('Log out'),
    icon: LucideLogOut,
    onClick: () => logout.submit(),
  },
])
</script>
