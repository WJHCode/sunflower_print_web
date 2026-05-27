import Clarity from '@microsoft/clarity'

const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim()

export function initClarity() {
  if (typeof window === 'undefined' || !import.meta.env.PROD || !projectId) {
    return
  }

  Clarity.init(projectId)
}
