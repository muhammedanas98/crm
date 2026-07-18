// Route names where the mobile bottom tab bar is shown. Whitelist (not
// blacklist) so new upstream detail routes default to "no bar".
export const BOTTOM_BAR_ROUTES = [
  'Home',
  'Dashboard',
  'Leads',
  'Deals',
  'Contacts',
  'Tasks',
  'Notes',
  'Organizations',
  'Call Logs',
]

export function shouldShowBottomBar(routeName) {
  return BOTTOM_BAR_ROUTES.includes(routeName)
}
