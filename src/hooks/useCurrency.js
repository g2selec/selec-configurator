/**
 * useCurrency — auto-detects region via browser timezone/locale,
 * fetches live INR→USD rate, and exposes a formatter + raw rate.
 *
 * Detection logic:
 *   India (IST / Asia/Calcutta or Asia/Kolkata) → INR (₹)
 *   Everything else                              → USD ($)
 *
 * Exchange rate: fetched from Open Exchange Rates (free, no key needed)
 * via exchangerate.host — fallback to 0.012 if fetch fails.
 */

import { useState, useEffect } from 'react'

const INDIA_TIMEZONES = ['Asia/Calcutta', 'Asia/Kolkata']
const FALLBACK_USD_RATE = 0.012 // ~83 INR per USD

function detectIsIndia() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (INDIA_TIMEZONES.includes(tz)) return true
    // Also check locale
    const locale = navigator.language || navigator.languages?.[0] || ''
    if (locale.toLowerCase().includes('en-in') || locale.toLowerCase() === 'hi') return true
  } catch (_) {}
  return false
}

export function useCurrency() {
  const [currency, setCurrency] = useState('INR')   // 'INR' | 'USD'
  const [rate, setRate]         = useState(1)        // INR→target multiplier
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const isIndia = detectIsIndia()
    if (isIndia) {
      setCurrency('INR')
      setRate(1)
      setLoading(false)
      return
    }

    // International — fetch live INR→USD rate
    setCurrency('USD')
    fetch('https://api.exchangerate.host/latest?base=INR&symbols=USD')
      .then(r => r.json())
      .then(data => {
        const usdRate = data?.rates?.USD
        setRate(usdRate && usdRate > 0 ? usdRate : FALLBACK_USD_RATE)
      })
      .catch(() => setRate(FALLBACK_USD_RATE))
      .finally(() => setLoading(false))
  }, [])

  /**
   * fmt(inrAmount) → formatted string in detected currency
   * e.g. fmt(12590) → "₹12,590" (India) or "$151" (international)
   */
  function fmt(inrAmount) {
    if (inrAmount == null || isNaN(inrAmount)) return ''
    const converted = inrAmount * rate
    if (currency === 'INR') {
      return '₹' + Math.round(converted).toLocaleString('en-IN')
    }
    // USD — show 2 decimal places for smaller amounts, whole for larger
    return '$' + converted.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: converted < 10 ? 2 : 0,
    })
  }

  /** Raw converted value (number) */
  function convert(inrAmount) {
    if (inrAmount == null || isNaN(inrAmount)) return 0
    return +(inrAmount * rate).toFixed(2)
  }

  return { currency, rate, loading, fmt, convert, isIndia: currency === 'INR' }
}
