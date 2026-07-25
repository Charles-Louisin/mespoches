/** Domaines autorisés pour les redirections de paiement. */
const ALLOWED_PAYMENT_HOST_SUFFIXES = [
  'cinetpay.com',
  'cinetpay.net',
  'secure.cinetpay.com',
]

export function isAllowedPaymentUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    return ALLOWED_PAYMENT_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    )
  } catch {
    return false
  }
}
