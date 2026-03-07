type RankingCategory = string

interface RuntimeRanking {
  id: number
  playerId: number
  category: RankingCategory
  rank: number
  points: number
  badges: string[]
}

interface RuntimePlayer {
  id: number
  username: string
  displayName: string
  avatarUrl: string
}

interface RuntimeStore {
  players: RuntimePlayer[]
  rankings: RuntimeRanking[]
  nextPlayerId: number
  nextRankingId: number
}

const storeRef = globalThis as unknown as { __runtimeStore?: RuntimeStore }

function getStore(): RuntimeStore {
  if (!storeRef.__runtimeStore) {
    storeRef.__runtimeStore = {
      players: [],
      rankings: [],
      nextPlayerId: 1,
      nextRankingId: 1,
    }
  }
  return storeRef.__runtimeStore
}

function shiftDownCategoryRanks(category: string, startRank: number) {
  const store = getStore()
  for (const r of store.rankings) {
    if (r.category === category && r.rank >= startRank) r.rank += 1
  }
}

export function runtimeGetPlayersWithRankings() {
  const store = getStore()
  return store.players
    .map((p) => ({
      ...p,
      rankings: store.rankings
        .filter((r) => r.playerId === p.id)
        .sort((a, b) => a.category.localeCompare(b.category))
        .map((r) => ({ ...r, badges: [...r.badges] })),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function runtimeAddPlayerRanking(input: {
  username: string
  displayName: string
  avatarUrl?: string
  category: string
  rank: number
  points?: number
  badges?: string[]
}) {
  const store = getStore()
  const category = input.category.toUpperCase()
  const points = input.points || 0
  const badges = input.badges || []

  let player = store.players.find((p) => p.username === input.username)
  if (!player) {
    player = {
      id: store.nextPlayerId++,
      username: input.username,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl || '',
    }
    store.players.push(player)
  } else {
    player.displayName = input.displayName
    if (input.avatarUrl !== undefined) player.avatarUrl = input.avatarUrl
  }

  const duplicate = store.rankings.find((r) => r.playerId === player!.id && r.category === category)
  if (duplicate) return { error: 'Player already ranked in this category' as const }

  shiftDownCategoryRanks(category, input.rank)

  const ranking: RuntimeRanking = {
    id: store.nextRankingId++,
    playerId: player.id,
    category,
    rank: input.rank,
    points,
    badges,
  }
  store.rankings.push(ranking)
  return { ranking, player }
}

export function runtimeUpdateRanking(
  rankingId: number,
  patch: { rank?: number; points?: number; badges?: string[]; displayName?: string; avatarUrl?: string }
) {
  const store = getStore()
  const ranking = store.rankings.find((r) => r.id === rankingId)
  if (!ranking) return null

  const player = store.players.find((p) => p.id === ranking.playerId)
  if (player) {
    if (patch.displayName) player.displayName = patch.displayName
    if (patch.avatarUrl !== undefined) player.avatarUrl = patch.avatarUrl
  }

  if (patch.rank !== undefined) ranking.rank = patch.rank
  if (patch.points !== undefined) ranking.points = patch.points
  if (patch.badges !== undefined) ranking.badges = patch.badges

  return { ranking, player }
}

export function runtimeDeleteRanking(rankingId: number) {
  const store = getStore()
  const index = store.rankings.findIndex((r) => r.id === rankingId)
  if (index === -1) return false
  store.rankings.splice(index, 1)
  return true
}

export function runtimeGetCategoryRankings(category: string, page: number, limit: number) {
  const store = getStore()
  const skip = (page - 1) * limit
  const all = store.rankings
    .filter((r) => r.category === category.toUpperCase())
    .sort((a, b) => a.rank - b.rank)
  const pageRows = all.slice(skip, skip + limit)
  return {
    rankings: pageRows.map((r) => ({
      id: r.id,
      rank: r.rank,
      points: r.points,
      badges: [...r.badges],
      category: r.category,
      player: store.players.find((p) => p.id === r.playerId) || {
        id: 0,
        username: 'unknown',
        displayName: 'Unknown',
        avatarUrl: '',
      },
    })),
    total: all.length,
  }
}

export function runtimeSearchPlayers(query: string) {
  const store = getStore()
  const q = query.toLowerCase()
  return store.players
    .filter((p) => p.displayName.toLowerCase().includes(q) || p.username.toLowerCase().includes(q))
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      rankings: store.rankings
        .filter((r) => r.playerId === p.id)
        .sort((a, b) => a.rank - b.rank)
        .map((r) => ({ category: r.category, rank: r.rank, points: r.points, badges: [...r.badges] })),
    }))
}

export function runtimeCategoryCounts(categories: string[]) {
  const store = getStore()
  const counts: Record<string, number> = {}
  for (const c of categories) counts[c] = 0
  for (const r of store.rankings) {
    if (counts[r.category] !== undefined) counts[r.category] += 1
  }
  return {
    totalPlayers: store.players.length,
    categories: counts,
  }
}
