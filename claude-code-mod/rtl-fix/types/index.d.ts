/** True while the person has turned the fix off with /rtl. */
export type IsOff = boolean

declare module 'claude-code' {
  interface PluginState {
    'rtl-fix': { isOff: IsOff }
  }
}
