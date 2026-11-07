// Web preview only: over-the-air updates don't exist on web, so codePush(App) is just App.
export default function codePush(arg) {
  return typeof arg === 'function' ? arg : (Component) => Component
}
