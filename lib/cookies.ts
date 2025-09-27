import Cookies from "js-cookie"

// Set a cookie
export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => {
  Cookies.set(name, value, options)
}

// Get a cookie
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name)
}

// Remove a cookie
export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
  Cookies.remove(name, options)
}
