// Web preview only: no push on web. Permission is "denied" and there is no token,
// so the app's push registration simply doesn't run.
const AuthorizationStatus = { NOT_DETERMINED: -1, DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 }
function messaging() {
  return {
    requestPermission: async () => AuthorizationStatus.DENIED,
    getToken: async () => null,
    onTokenRefresh: () => () => {},
    onMessage: () => () => {},
    onNotificationOpenedApp: () => () => {},
    getInitialNotification: async () => null,
  }
}
messaging.AuthorizationStatus = AuthorizationStatus
export default messaging
