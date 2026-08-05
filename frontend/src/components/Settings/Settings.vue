<template>
  <div class="flex h-full flex-col overflow-hidden">
    <LayoutHeader>
      <template #left-header>
        <Button
          variant="ghost"
          icon-left="lucide-chevron-left"
          :label="__('Settings')"
          size="md"
          class="-ml-2 text-2xl-semibold hover:bg-transparent hover:opacity-70"
          @click="close"
        />
      </template>
    </LayoutHeader>
    <div class="flex flex-1 overflow-hidden mx-2">
      <div
        ref="tabListEl"
        class="flex flex-col w-60 shrink-0 bg-surface-gray-1 m-2 px-2 rounded-lg shadow-md overflow-y-auto [scrollbar-width:none] hover:[scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgb(0_0_0_/_0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-black/15"
      >
        <template v-for="(tab, i) in tabs" :key="tab.label">
          <div v-if="!tab.hideLabel && i != 0" class="mx-1 mb-0.5 mt-[5px]" />
          <div
            v-if="!tab.hideLabel"
            class="h-7.5 px-2 py-[7px] my-[3px] flex cursor-pointer gap-1.5 text-sm-semibold uppercase tracking-wide text-ink-gray-6 transition-all duration-300 ease-in-out sticky top-0 z-10 bg-surface-gray-1"
          >
            <span>{{ __(tab.label) }}</span>
          </div>
          <nav class="space-y-[3px] px-1">
            <SidebarLink
              v-for="item in tab.items"
              :key="item.label"
              :icon="item.icon"
              :label="__(item.label)"
              class="w-full"
              :class="
                activeTab?.label == item.label
                  ? 'bg-[var(--active-nav-bg)] text-[var(--active-nav-text)] shadow-sm hover:bg-[var(--active-nav-bg)]'
                  : 'hover:bg-surface-gray-2'
              "
              @click="goToTab(item.label)"
            />
          </nav>
        </template>
      </div>
      <div class="flex flex-col flex-1 overflow-y-auto bg-surface-elevation-2">
        <component :is="activeTab.component" v-if="activeTab" />
      </div>
    </div>
  </div>
</template>
<script setup>
import LucideLayoutDashboard from '~icons/lucide/layout-dashboard'
import LucideNetwork from '~icons/lucide/network'
import MonitorCogIcon from '~icons/lucide/monitor-cog'
import LucideTextCursorInput from '~icons/lucide/text-cursor-input'
import SlidersIcon from '@/components/Icons/SlidersIcon.vue'
import SparkleIcon from '@/components/Icons/SparkleIcon.vue'
import CalendarIcon from '@/components/Icons/CalendarIcon.vue'
import WhatsAppIcon from '@/components/Icons/WhatsAppIcon.vue'
import ERPNextIcon from '@/components/Icons/ERPNextIcon.vue'
import PhoneIcon from '@/components/Icons/PhoneIcon.vue'
import Email2Icon from '@/components/Icons/Email2Icon.vue'
import EmailTemplateIcon from '@/components/Icons/EmailTemplateIcon.vue'
import SettingsIcon from '@/components/Icons/SettingsIcon.vue'
import SettingsIcon2 from '@/components/Icons/SettingsIcon2.vue'
import Users from '@/components/Settings/Users.vue'
import Hierarchy from '@/components/Settings/Hierarchy/Hierarchy.vue'
import InviteUserPage from '@/components/Settings/InviteUserPage.vue'
import ProfilePage from '@/components/Settings/Profile/ProfilePage.vue'
import PreferencesSettings from '@/components/Settings/PreferencesSettings.vue'
import WhatsAppSettings from '@/components/Settings/WhatsAppSettings.vue'
import ERPNextSettings from '@/components/Settings/ERPNextSettings.vue'
import LeadSyncSourcePage from '@/components/Settings/LeadSyncing/LeadSyncSourcePage.vue'
import DefaultsSettings from '@/components/Settings/DefaultsSettings.vue'
import BrandSettings from '@/components/Settings/BrandSettings.vue'
import CalendarSettings from '@/components/Settings/CalendarSettings.vue'
import HomeActions from '@/components/Settings/HomeActions.vue'
import FormsSettings from '@/components/Settings/Forms/FormsSettings.vue'
import GeneralSettings from '@/components/Settings/GeneralSettings.vue'
import DashboardSettings from '@/components/Settings/DashboardSettings.vue'
import EmailTemplatePage from '@/components/Settings/EmailTemplate/EmailTemplatePage.vue'
import TelephonyPage from '@/components/Settings/Telephony/TelephonyPage.vue'
import EmailConfig from '@/components/Settings/EmailConfig.vue'
import SidebarLink from '@/components/SidebarLink.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import { usersStore } from '@/stores/users'
import {
  showSettings,
  activeSettingsPage,
  settingsTabSlug,
} from '@/composables/settings'
import { isWhatsappInstalled } from '@/composables/whatsapp'
import { Avatar } from 'frappe-ui'
import { markRaw, computed, h, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import router from '@/router'
import AssignmentRulePage from './AssignmentRules/AssignmentRulePage.vue'
import ShieldCheck from '~icons/lucide/shield-check'
import SlaConfig from './Sla/SlaConfig.vue'

const props = defineProps({
  tab: { type: String, default: '' },
})

const { isManager, getUser } = usersStore()

const user = computed(() => getUser() || {})

const tabs = computed(() => {
  let _tabs = [
    {
      label: __('User Configuration'),
      items: [
        {
          label: __('Profile'),
          icon: () =>
            h(Avatar, {
              size: 'xs',
              label: user.value.full_name,
              image: user.value.user_image,
            }),
          component: markRaw(ProfilePage),
        },
        {
          label: __('Preferences'),
          icon: SlidersIcon,
          component: markRaw(PreferencesSettings),
        },
      ],
    },
    {
      label: __('System Configuration'),
      items: [
        {
          label: __('General'),
          component: markRaw(GeneralSettings),
          icon: SettingsIcon,
        },
        {
          label: __('Dashboard'),
          component: markRaw(DashboardSettings),
          icon: LucideLayoutDashboard,
        },
        {
          label: __('Defaults'),
          component: markRaw(DefaultsSettings),
          icon: MonitorCogIcon,
        },
        {
          label: __('Brand'),
          icon: SparkleIcon,
          component: markRaw(BrandSettings),
        },
        {
          label: __('Calendar'),
          icon: CalendarIcon,
          component: markRaw(CalendarSettings),
        },
      ],
      condition: () => isManager(),
    },
    {
      label: __('User Management'),
      items: [
        {
          label: __('Users'),
          icon: 'user',
          component: markRaw(Users),
          condition: () => isManager(),
        },
        {
          label: __('Invite User'),
          icon: 'user-plus',
          component: markRaw(InviteUserPage),
          condition: () => isManager(),
        },
        {
          label: __('Sales Hierarchy'),
          icon: LucideNetwork,
          component: markRaw(Hierarchy),
          condition: () => isManager(),
        },
      ],
      condition: () => isManager(),
    },
    {
      label: __('Email'),
      items: [
        {
          label: __('Accounts'),
          icon: Email2Icon,
          component: markRaw(EmailConfig),
          condition: () => isManager(),
        },
        {
          label: __('Templates'),
          icon: EmailTemplateIcon,
          component: markRaw(EmailTemplatePage),
        },
      ],
    },
    {
      label: __('Automation & Rules'),
      items: [
        {
          label: __('Assignment Rules'),
          icon: markRaw(h(SettingsIcon2, { class: 'rotate-90' })),
          component: markRaw(AssignmentRulePage),
        },
        {
          label: __('SLA Policies'),
          icon: markRaw(h(ShieldCheck)),
          component: markRaw(SlaConfig),
        },
        {
          label: __('Forms'),
          component: markRaw(FormsSettings),
          icon: markRaw(LucideTextCursorInput),
        },
      ],
      condition: () => isManager(),
    },
    {
      label: __('Customization'),
      items: [
        {
          label: __('Home Actions'),
          component: markRaw(HomeActions),
          icon: 'home',
        },
      ],
      condition: () => isManager(),
    },
    {
      label: __('Integrations', null, 'FCRM'),
      items: [
        {
          label: __('Telephony'),
          icon: PhoneIcon,
          component: markRaw(TelephonyPage),
        },
        {
          label: __('WhatsApp'),
          icon: WhatsAppIcon,
          component: markRaw(WhatsAppSettings),
          condition: () => isWhatsappInstalled.value && isManager(),
        },
        {
          label: __('ERPNext'),
          icon: ERPNextIcon,
          component: markRaw(ERPNextSettings),
          condition: () => isManager(),
        },
        {
          label: __('Lead Syncing'),
          icon: 'refresh-cw',
          component: markRaw(LeadSyncSourcePage),
          condition: () => isManager(),
        },
      ],
    },
  ]

  return _tabs.filter((tab) => {
    if (tab.condition && !tab.condition()) return false
    if (tab.items) {
      tab.items = tab.items.filter((item) => {
        if (item.condition && !item.condition()) return false
        return true
      })
    }
    return true
  })
})

const flatItems = computed(() => tabs.value.map((tab) => tab.items).flat())

const activeTab = computed(
  () =>
    flatItems.value.find((item) => settingsTabSlug(item.label) === props.tab) ||
    flatItems.value[0],
)

function goToTab(label) {
  router.replace({ name: 'Settings', params: { tab: settingsTabSlug(label) } })
}

// App.vue keys <router-view> on the full path, so switching tabs (a route
// change) remounts this whole component and resets the tab list's scroll —
// persist it in module scope across that remount.
let savedTabListScroll = 0
const tabListEl = ref(null)

onMounted(() => {
  if (tabListEl.value) tabListEl.value.scrollTop = savedTabListScroll
})

onBeforeUnmount(() => {
  if (tabListEl.value) savedTabListScroll = tabListEl.value.scrollTop
})

function close() {
  activeSettingsPage.value = ''
  const prev = router.previousRoute
  if (prev?.name && prev.name !== 'Settings') {
    router.push({ name: prev.name, params: prev.params, query: prev.query })
  } else {
    router.push({ name: 'Home' })
  }
}

// consume the open-trigger refs once the URL has taken over as the source
// of truth, so a later trigger from elsewhere in the app starts clean
onMounted(() => {
  showSettings.value = false
  activeSettingsPage.value = ''
})

// some call sites switch tabs while already on the settings page by just
// setting `activeSettingsPage.value = 'Some Tab'` (no open-trigger involved)
watch(activeSettingsPage, (label) => {
  if (!label) return
  goToTab(label)
  activeSettingsPage.value = ''
})
</script>
