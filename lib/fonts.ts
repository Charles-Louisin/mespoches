import { Outfit } from 'next/font/google'

/** Police de l'application mobile (tokens : Outfit 400/500/600/700), partagée par le site public. */
export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})
