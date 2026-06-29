const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim()

export function initClarity() {
  if (typeof window === 'undefined' || !import.meta.env.PROD || !projectId) {
    return
  }

  const startClarity = () => {
    void import('@microsoft/clarity').then(({ default: Clarity }) => {
      Clarity.init(projectId)
    })
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startClarity, { timeout: 3000 })
    return
  }

  globalThis.setTimeout(startClarity, 1500)
}
