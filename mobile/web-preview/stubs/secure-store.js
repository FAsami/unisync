// Web preview only: the browser has no keychain; keep the session in localStorage.
export const getItemAsync = async (key) => globalThis.localStorage?.getItem(key) ?? null
export const setItemAsync = async (key, value) => globalThis.localStorage?.setItem(key, value)
export const deleteItemAsync = async (key) => globalThis.localStorage?.removeItem(key)
