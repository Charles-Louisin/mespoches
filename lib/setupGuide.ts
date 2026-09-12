const SETUP_KEY = 'mp_setup_guide'
const SETUP_EVENT = 'mp-setup-guide-change'

export type SetupStep =
  | 'nav-wallets'
  | 'wallets-add'
  | 'wallet-form'
  | 'nav-categories'
  | 'categories-add'
  | 'category-form'
  | 'done'
  | null

/** Anciennes valeurs → nouvelles (migration douce). */
function normalizeStep(raw: string | null): SetupStep {
  if (!raw) return null
  if (raw === 'wallet') return 'nav-wallets'
  if (raw === 'category') return 'nav-categories'
  if (
    raw === 'nav-wallets' ||
    raw === 'wallets-add' ||
    raw === 'wallet-form' ||
    raw === 'nav-categories' ||
    raw === 'categories-add' ||
    raw === 'category-form' ||
    raw === 'done'
  ) {
    return raw
  }
  return null
}

export function getSetupStep(): SetupStep {
  if (typeof window === 'undefined') return null
  return normalizeStep(localStorage.getItem(SETUP_KEY))
}

export function setSetupStep(step: SetupStep) {
  if (typeof window === 'undefined') return
  if (!step || step === 'done') {
    localStorage.setItem(SETUP_KEY, 'done')
  } else {
    localStorage.setItem(SETUP_KEY, step)
  }
  window.dispatchEvent(new CustomEvent(SETUP_EVENT, { detail: step || 'done' }))
}

export function clearSetupStep() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SETUP_KEY)
  window.dispatchEvent(new CustomEvent(SETUP_EVENT, { detail: null }))
}

/** Démarre le guide après inscription / OAuth (compte sans poches). */
export function startSetupGuide() {
  if (typeof window === 'undefined') return
  if (getSetupStep() === 'done') return
  setSetupStep('nav-wallets')
}

export function isSetupActive(): boolean {
  const step = getSetupStep()
  return !!step && step !== 'done'
}

export function subscribeSetupStep(listener: (step: SetupStep) => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETUP_KEY) listener(normalizeStep(e.newValue))
  }
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent).detail as SetupStep
    listener(detail ?? getSetupStep())
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(SETUP_EVENT, onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(SETUP_EVENT, onCustom)
  }
}

export type CoachTargetId =
  | 'nav-wallets'
  | 'wallets-add'
  | 'wallet-form'
  | 'nav-categories'
  | 'categories-add'
  | 'category-form'

export const COACH_STEPS: Record<
  Exclude<SetupStep, 'done' | null>,
  {
    target: CoachTargetId
    title: string
    body: string
    /** Routes où cette étape a du sens ; sinon on oriente. */
    paths?: string[]
  }
> = {
  'nav-wallets': {
    target: 'nav-wallets',
    title: 'Vos poches',
    body: 'Appuyez ici pour ouvrir vos poches — c’est là que vivent vos comptes.',
  },
  'wallets-add': {
    target: 'wallets-add',
    title: 'Nouvelle poche',
    body: 'Appuyez sur + pour créer votre première poche.',
    paths: ['/wallets'],
  },
  'wallet-form': {
    target: 'wallet-form',
    title: 'Configurez la poche',
    body: 'Donnez-lui un nom, un solde, une image si besoin, puis créez-la.',
    paths: ['/wallets/new'],
  },
  'nav-categories': {
    target: 'nav-categories',
    title: 'Les catégories',
    body: 'Ensuite, ouvrez les catégories pour classer vos dépenses et revenus.',
  },
  'categories-add': {
    target: 'categories-add',
    title: 'Ajouter',
    body: 'Appuyez sur + pour créer votre première catégorie.',
    paths: ['/categories'],
  },
  'category-form': {
    target: 'category-form',
    title: 'Créez votre 1ʳᵉ catégorie',
    body: 'Choisissez un nom et un type, puis validez — le guide se termine.',
    paths: ['/categories'],
  },
}
