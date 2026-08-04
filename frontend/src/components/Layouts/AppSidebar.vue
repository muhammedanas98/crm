<template>
  <div
    class="relative flex h-full w-[88px] flex-shrink-0 flex-col justify-between"
  >
    <div class="flex justify-center p-2">
      <UserDropdown :isCollapsed="true" />
    </div>
    <div
      class="flex-1 overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div class="flex flex-col px-2">
        <SidebarLink
          id="notifications-btn"
          :label="__('Notifications')"
          :icon="NotificationsIcon"
          rail
          dark
          class="my-[1.5px]"
          @click="() => toggleNotificationPanel()"
        >
          <template #badge>
            <Badge
              v-if="unreadNotificationsCount"
              :label="unreadNotificationsCount"
              theme="blue"
              variant="solid"
              size="sm"
              class="absolute -right-2 -top-1.5"
            />
          </template>
        </SidebarLink>
      </div>
      <div v-for="view in allViews" :key="view.label">
        <div class="mx-2 my-1.5" />
        <CollapsibleSection
          :label="view.name"
          :hideLabel="view.hideLabel"
          :opened="view.opened"
        >
          <template #header="{ opened, hide, toggle }">
            <div
              v-if="!hide"
              class="flex items-center cursor-pointer justify-center gap-1 px-2 pt-[11px] pb-2 text-[11px] text-white/50 transition-all duration-300 ease-in-out"
              @click="toggle()"
            >
              <span
                class="lucide-chevron-right h-3 text-white/70 transition-all duration-300 ease-in-out"
                :class="{ 'rotate-90': opened }"
                aria-hidden="true"
              />
              <span>{{ __(view.name) }}</span>
            </div>
          </template>
          <nav class="flex flex-col px-2">
            <SidebarLink
              v-for="link in view.views"
              :key="link.label"
              :icon="link.icon"
              :label="__(link.label)"
              :to="link.to"
              rail
              dark
              class="my-[1.5px]"
            />
          </nav>
        </CollapsibleSection>
      </div>
    </div>
    <div class="m-2 flex flex-col gap-1">
      <div class="flex flex-col gap-2 mb-1">
        <SalesHierarchyBanner
          v-if="showSalesHierarchyBanner"
          :isSidebarCollapsed="true"
        />
        <SignupBanner
          v-if="isDemoSite"
          :isSidebarCollapsed="true"
          :afterSignup="() => capture('signup_from_demo_site')"
        />
        <TrialBanner
          v-if="isFCSite"
          :isSidebarCollapsed="true"
          :afterUpgrade="() => capture('upgrade_plan_from_trial_banner')"
        />
        <GettingStartedBanner
          v-if="!isOnboardingStepsCompleted"
          :isSidebarCollapsed="true"
        />
      </div>
      <SidebarLink
        v-if="isOnboardingStepsCompleted"
        rail
        dark
        :label="__('Help')"
        @click="
          () => {
            showHelpModal = minimize ? true : !showHelpModal
            minimize = !showHelpModal
          }
        "
      >
        <template #icon>
          <HelpIcon class="h-5 w-5" />
        </template>
      </SidebarLink>
    </div>
    <Notifications />
    <Settings />
    <HelpModal
      v-if="showHelpModal"
      v-model="showHelpModal"
      v-model:articles="articles"
      :logo="CRMLogo"
      :title="__('arizone CRM')"
      :afterSkip="(step) => capture('onboarding_step_skipped_' + step)"
      :afterSkipAll="() => capture('onboarding_steps_skipped')"
      :afterReset="(step) => capture('onboarding_step_reset_' + step)"
      :afterResetAll="() => capture('onboarding_steps_reset')"
      docsLink="https://docs.frappe.io/crm"
    />
    <IntermediateStepModal
      v-model="showIntermediateModal"
      :currentStep="currentStep"
    />
  </div>
</template>

<script setup>
import LucideLayoutDashboard from '~icons/lucide/layout-dashboard'
import CRMLogo from '@/components/Icons/CRMLogo.vue'
import InviteIcon from '@/components/Icons/InviteIcon.vue'
import ConvertIcon from '@/components/Icons/ConvertIcon.vue'
import CommentIcon from '@/components/Icons/CommentIcon.vue'
import EmailIcon from '@/components/Icons/EmailIcon.vue'
import StepsIcon from '@/components/Icons/StepsIcon.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import PinIcon from '@/components/Icons/PinIcon.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import SquareAsterisk from '@/components/Icons/SquareAsterisk.vue'
import LeadsIcon from '@/components/Icons/LeadsIcon.vue'
import DealsIcon from '@/components/Icons/DealsIcon.vue'
import ContactsIcon from '@/components/Icons/ContactsIcon.vue'
import OrganizationsIcon from '@/components/Icons/OrganizationsIcon.vue'
import NoteIcon from '@/components/Icons/NoteIcon.vue'
import TaskIcon from '@/components/Icons/TaskIcon.vue'
import CalendarIcon from '@/components/Icons/CalendarIcon.vue'
import PhoneIcon from '@/components/Icons/PhoneIcon.vue'
import NotificationsIcon from '@/components/Icons/NotificationsIcon.vue'
import HelpIcon from '@/components/Icons/HelpIcon.vue'
import SidebarLink from '@/components/SidebarLink.vue'
import Notifications from '@/components/Notifications.vue'
import Settings from '@/components/Settings/Settings.vue'
import SalesHierarchyBanner from '@/components/SalesHierarchyBanner.vue'
import { viewsStore } from '@/stores/views'
import {
  unreadNotificationsCount,
  notificationsStore,
} from '@/stores/notifications'
import { usersStore } from '@/stores/users'
import { sessionStore } from '@/stores/session'
import { showSettings, activeSettingsPage } from '@/composables/settings'
import { showChangePasswordModal } from '@/composables/modals'
import { useBroadcast } from '@/composables/useBroadcast.js'
import { call } from 'frappe-ui'
import {
  SignupBanner,
  TrialBanner,
  HelpModal,
  GettingStartedBanner,
  useOnboarding,
  showHelpModal,
  minimize,
  IntermediateStepModal,
  useTelemetry,
} from 'frappe-ui/frappe'
import router from '@/router'
import { ref, reactive, computed, markRaw, onMounted } from 'vue'

const { getPinnedViews, getPublicViews } = viewsStore()
const { toggle: toggleNotificationPanel } = notificationsStore()
const { capture } = useTelemetry()
const { send } = useBroadcast()

const isFCSite = ref(window.is_fc_site)
const isDemoSite = ref(window.is_demo_site)
const showSalesHierarchyBanner = ref(!!window.show_sales_hierarchy_banner)

const links = [
  {
    label: 'Dashboard',
    icon: LucideLayoutDashboard,
    to: 'Dashboard',
  },
  {
    label: 'Leads',
    icon: LeadsIcon,
    to: 'Leads',
  },
  {
    label: 'Deals',
    icon: DealsIcon,
    to: 'Deals',
  },
  {
    label: 'Contacts',
    icon: ContactsIcon,
    to: 'Contacts',
  },
  {
    label: 'Organizations',
    icon: OrganizationsIcon,
    to: 'Organizations',
  },
  {
    label: 'Notes',
    icon: NoteIcon,
    to: 'Notes',
  },
  {
    label: 'Tasks',
    icon: TaskIcon,
    to: 'Tasks',
  },
  {
    label: 'Calendar',
    icon: CalendarIcon,
    to: 'Calendar',
  },
  {
    label: 'Call Logs',
    icon: PhoneIcon,
    to: 'Call Logs',
  },
]

const allViews = computed(() => {
  let _views = [
    {
      name: 'All Views',
      hideLabel: true,
      opened: true,
      views: links.filter((link) => {
        if (link.condition) {
          return link.condition()
        }
        return true
      }),
    },
  ]
  if (getPublicViews().length) {
    _views.push({
      name: 'Public Views',
      opened: true,
      views: parseView(getPublicViews()),
    })
  }

  if (getPinnedViews().length) {
    _views.push({
      name: 'Pinned Views',
      opened: true,
      views: parseView(getPinnedViews()),
    })
  }
  return _views
})

function parseView(views) {
  return views.map((view) => {
    return {
      label: view.label,
      icon: getIcon(view.route_name, view.icon),
      to: {
        name: view.route_name,
        params: { viewType: view.type || 'list' },
        query: { view: view.name },
      },
    }
  })
}

function getIcon(routeName, icon) {
  if (icon) return icon

  switch (routeName) {
    case 'Leads':
      return LeadsIcon
    case 'Deals':
      return DealsIcon
    case 'Contacts':
      return ContactsIcon
    case 'Organizations':
      return OrganizationsIcon
    case 'Notes':
      return NoteIcon
    case 'Call Logs':
      return PhoneIcon
    default:
      return PinIcon
  }
}

// onboarding
const { user } = sessionStore()
const { users, isManager } = usersStore()
const { isOnboardingStepsCompleted, setUp } = useOnboarding('frappecrm')

async function getFirstLead() {
  let firstLead = localStorage.getItem('firstLead' + user)
  if (firstLead) return firstLead
  return await call('crm.api.onboarding.get_first_lead')
}

async function getFirstDeal() {
  let firstDeal = localStorage.getItem('firstDeal' + user)
  if (firstDeal) return firstDeal
  return await call('crm.api.onboarding.get_first_deal')
}

const showIntermediateModal = ref(false)
const currentStep = ref({})

const steps = reactive([
  {
    name: 'setup_your_password',
    title: __('Setup your password'),
    icon: markRaw(SquareAsterisk),
    completed: false,
    onClick: () => {
      minimize.value = true
      showChangePasswordModal.value = true
      capture('onboarding_step_clicked_setup_password')
    },
  },
  {
    name: 'create_first_lead',
    title: __('Create your first lead'),
    icon: markRaw(LeadsIcon),
    completed: false,
    onClick: () => {
      minimize.value = true
      router.push({ name: 'Leads' })
      send('trigger_lead_create', true)
      capture('onboarding_step_clicked_create_first_lead')
    },
  },
  {
    name: 'invite_your_team',
    title: __('Invite your team'),
    icon: markRaw(InviteIcon),
    completed: false,
    onClick: () => {
      minimize.value = true
      showSettings.value = true
      activeSettingsPage.value = 'Invite User'
      capture('onboarding_step_clicked_invite_your_team')
    },
    condition: () => isManager(),
  },
  {
    name: 'convert_lead_to_deal',
    title: __('Convert lead to deal'),
    icon: markRaw(ConvertIcon),
    completed: false,
    dependsOn: 'create_first_lead',
    onClick: async () => {
      minimize.value = true
      capture('onboarding_step_clicked_convert_lead_to_deal')
      currentStep.value = {
        title: __('Convert lead to deal'),
        buttonLabel: __('Convert'),
        videoURL: '/assets/crm/videos/convertToDeal.mov',
        onClick: async () => {
          showIntermediateModal.value = false
          currentStep.value = {}

          let lead = await getFirstLead()
          if (lead) {
            router.push({ name: 'Lead', params: { leadId: lead } })
          } else {
            router.push({ name: 'Leads' })
          }
        },
      }
      showIntermediateModal.value = true
    },
  },
  {
    name: 'create_first_task',
    title: __('Create your first task'),
    icon: markRaw(TaskIcon),
    completed: false,
    onClick: async () => {
      minimize.value = true
      let deal = await getFirstDeal()
      capture('onboarding_step_clicked_create_first_task')

      if (deal) {
        router.push({
          name: 'Deal',
          params: { dealId: deal },
          hash: '#tasks',
        })
      } else {
        router.push({ name: 'Tasks' })
      }
    },
  },
  {
    name: 'create_first_note',
    title: __('Create your first note'),
    icon: markRaw(NoteIcon),
    completed: false,
    onClick: async () => {
      minimize.value = true
      let deal = await getFirstDeal()
      capture('onboarding_step_clicked_create_first_note')

      if (deal) {
        router.push({
          name: 'Deal',
          params: { dealId: deal },
          hash: '#notes',
        })
      } else {
        router.push({ name: 'Notes' })
      }
    },
  },
  {
    name: 'add_first_comment',
    title: __('Add your first comment'),
    icon: markRaw(CommentIcon),
    completed: false,
    dependsOn: 'create_first_lead',
    onClick: async () => {
      minimize.value = true
      let deal = await getFirstDeal()
      capture('onboarding_step_clicked_add_first_comment')

      if (deal) {
        router.push({
          name: 'Deal',
          params: { dealId: deal },
          hash: '#comments',
        })
      } else {
        router.push({ name: 'Leads' })
      }
    },
  },
  {
    name: 'send_first_email',
    title: __('Send email'),
    icon: markRaw(EmailIcon),
    completed: false,
    dependsOn: 'create_first_lead',
    onClick: async () => {
      minimize.value = true
      let deal = await getFirstDeal()
      capture('onboarding_step_clicked_send_first_email')

      if (deal) {
        router.push({
          name: 'Deal',
          params: { dealId: deal },
          hash: '#emails',
        })
      } else {
        router.push({ name: 'Leads' })
      }
    },
  },
  {
    name: 'change_deal_status',
    title: __('Change deal status'),
    icon: markRaw(StepsIcon),
    completed: false,
    dependsOn: 'convert_lead_to_deal',
    onClick: async () => {
      minimize.value = true
      capture('onboarding_step_clicked_change_deal_status')

      currentStep.value = {
        title: __('Change deal status'),
        buttonLabel: __('Change'),
        videoURL: '/assets/crm/videos/changeDealStatus.mov',
        onClick: async () => {
          showIntermediateModal.value = false
          currentStep.value = {}

          let deal = await getFirstDeal()
          if (deal) {
            router.push({
              name: 'Deal',
              params: { dealId: deal },
              hash: '#activity',
            })
          } else {
            router.push({ name: 'Leads' })
          }
        },
      }
      showIntermediateModal.value = true
    },
  },
])

onMounted(async () => {
  await users.promise

  const filteredSteps = steps.filter((step) => {
    if (step.condition) {
      return step.condition()
    }
    return true
  })

  setUp(filteredSteps)
  // custom: don't auto-open the Getting Started modal; default closed
  showHelpModal.value = false
})

// help center
const articles = ref([
  {
    title: __('Introduction'),
    opened: false,
    subArticles: [
      { name: 'introduction', title: __('Introduction') },
      { name: 'setting-up', title: __('Setting Up') },
    ],
  },
  {
    title: __('Settings'),
    opened: false,
    subArticles: [
      { name: 'profile', title: __('Profile') },
      { name: 'custom-branding', title: __('Custom Branding') },
      { name: 'home-actions', title: __('Home Actions') },
      { name: 'invite-users', title: __('Invite Users') },
    ],
  },
  {
    title: __('Masters'),
    opened: false,
    subArticles: [
      { name: 'lead', title: __('Lead') },
      { name: 'deal', title: __('Deal') },
      { name: 'contact', title: __('Contact') },
      { name: 'organization', title: __('Organization') },
      { name: 'note', title: __('Note') },
      { name: 'task', title: __('Task') },
      { name: 'call-log', title: __('Call Log') },
      { name: 'email-template', title: __('Email Template') },
    ],
  },
  {
    title: __('Capturing Leads'),
    opened: false,
    subArticles: [{ name: 'web-form', title: __('Web Form') }],
  },
  {
    title: __('Views'),
    opened: false,
    subArticles: [
      { name: 'view', title: __('Saved View') },
      { name: 'public-view', title: __('Public View') },
      { name: 'pinned-view', title: __('Pinned View') },
    ],
  },
  {
    title: __('Other Features'),
    opened: false,
    subArticles: [
      { name: 'email-communication', title: __('Email Communication') },
      { name: 'comment', title: __('Comment') },
      { name: 'data', title: __('Data') },
      { name: 'service-level-agreement', title: __('Service Level Agreement') },
      { name: 'assignment-rule', title: __('Assignment Rule') },
      { name: 'notification', title: __('Notification') },
    ],
  },
  {
    title: __('Customization'),
    opened: false,
    subArticles: [
      { name: 'custom-fields', title: __('Custom Fields') },
      { name: 'custom-actions', title: __('Custom Actions') },
      { name: 'custom-statuses', title: __('Custom Statuses') },
      { name: 'custom-list-actions', title: __('Custom List Actions') },
      { name: 'quick-entry-layout', title: __('Quick Entry Layout') },
    ],
  },
  {
    title: __('Integration'),
    opened: false,
    subArticles: [
      { name: 'twilio', title: __('Twilio') },
      { name: 'exotel', title: __('Exotel') },
      { name: 'whatsapp', title: __('WhatsApp') },
      { name: 'erpnext', title: __('ERPNext') },
    ],
  },
  {
    title: __('arizone CRM mobile'),
    opened: false,
    subArticles: [
      { name: 'mobile-app-installation', title: __('Mobile App Installation') },
    ],
  },
])
</script>
