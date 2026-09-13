/**
 * Supprime les erreurs réseau non critiques (sourcemaps, etc.) en mode offline
 * pour éviter d'afficher des pages d'erreur 404 à l'utilisateur
 */

if (typeof window !== 'undefined') {
  // Intercepter les erreurs de chargement de ressources
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement
    
    // Vérifier si c'est une erreur de chargement de ressource
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href
      
      // Ignorer les erreurs sur les sourcemaps et autres fichiers non critiques
      if (
        src?.includes('.map') ||
        src?.includes('LayoutGroupContext') ||
        src?.includes('_buildManifest') ||
        src?.includes('_ssgManifest')
      ) {
        event.preventDefault()
        event.stopPropagation()
        console.debug('Erreur de chargement ignorée (non critique):', src)
        return false
      }
    }
  }, true)

  // Intercepter les erreurs de fetch non capturées
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch((error) => {
      const url = args[0]?.toString() || ''
      
      // Ignorer silencieusement les erreurs sur les sourcemaps
      if (url.includes('.map') || url.includes('LayoutGroupContext')) {
        console.debug('Fetch échoué (non critique):', url)
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }
      
      // Propager les autres erreurs
      throw error
    })
  }

  // Supprimer les logs d'erreur Next.js non critiques
  const originalConsoleError = console.error
  console.error = function(...args) {
    const message = args[0]?.toString() || ''
    
    // Ignorer les erreurs de sourcemap Next.js
    if (
      message.includes('.map') ||
      message.includes('LayoutGroupContext') ||
      message.includes('404') && message.includes('_next/static')
    ) {
      return
    }
    
    originalConsoleError.apply(console, args)
  }
}

export {}
