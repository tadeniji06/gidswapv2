// lib/swap-utils.ts
import axios from "axios"
import Cookies from "js-cookie"

export async function fetchQuoteApi(
  sellCurrency: any,
  receiveCurrency: any,
  amount: number
) {
  const api = process.env.NEXT_PUBLIC_PROD_API
  const token = Cookies.get("token")
  if (!api || !token) return null

  const response = await axios.post(
    `${api}/api/fixfloat/trade/rate`,
    {
      fromCcy: sellCurrency.code,
      toCcy: receiveCurrency.code,
      amount,
      direction: "from",
      type: "float",
    },
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (response.data.code === 0) {
    return response.data.data
  }
  return null
}

export function sanitizeNumericInput(value: string): string {
  // Remove all non-numeric except dot
  let sanitized = value.replace(/[^0-9.]/g, "")

  // Ensure only one dot
  const parts = sanitized.split(".")
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("")
  }

  return sanitized
}