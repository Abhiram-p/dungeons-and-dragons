export const CAMPAIGNS_STORAGE_KEY = 'realm.demo.campaigns.v1'
export const APPLICATIONS_STORAGE_KEY = 'realm.demo.applications.v1'

export const initialCampaigns = [
  {
    id: 'cargo-status-lost',
    title: 'Cargo Status Lost',
    system: 'D&D 5e · 2024 rules',
    levelRange: 'Level 3+',
    format: 'Online tabletop',
    schedule: 'Schedule to be confirmed',
    capacity: 6,
    status: 'open',
    description: 'An otherworldly fantasy adventure of dangerous bargains, guild politics, divine mysteries, and a missing cargo with consequences far beyond its manifest.',
    visibility: 'public',
  },
  {
    id: 'pokemon-grand-journey',
    title: 'Pokémon Grand Journey',
    system: 'Pokémon-inspired tabletop',
    levelRange: 'Levels 1–4',
    format: 'Online tabletop',
    schedule: 'Schedule to be confirmed',
    capacity: 6,
    status: 'open',
    description: 'Begin a journey through a region of towns, trials, research, contests, and discoveries. Build your team and make a name for yourself across the region.',
    visibility: 'public',
  },
]

export function readDemoStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`Could not read demo data for ${key}. Using defaults.`, error)
    return fallback
  }
}

export function saveDemoStorage(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Could not save demo data for ${key}.`, error)
  }
}

export function createId(prefix = 'entry') {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}-${random}`
}
