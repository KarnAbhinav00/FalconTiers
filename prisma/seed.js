const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const badges = {
  // High Tier
  HT1: 'HT1', HT2: 'HT2', HT3: 'HT3', HT4: 'HT4', HT5: 'HT5',
  // Low Tier
  LT1: 'LT1', LT2: 'LT2', LT3: 'LT3', LT4: 'LT4', LT5: 'LT5',
}

const cpvpPlayers = [
  { name: 'PhantomX', displayName: 'PhantomX', badges: [badges.HT1], points: 9800 },
  { name: 'NightFall', displayName: 'NightFall', badges: [badges.HT1], points: 9650 },
  { name: 'VoidSlayer', displayName: 'VoidSlayer', badges: [badges.HT2], points: 9400 },
  { name: 'StormBreaker', displayName: 'StormBreaker', badges: [badges.HT2], points: 9200 },
  { name: 'ShadowPVP', displayName: 'ShadowPVP', badges: [badges.HT2], points: 9000 },
  { name: 'CrimsonAce', displayName: 'CrimsonAce', badges: [badges.HT3], points: 8750 },
  { name: 'ArcticWolf', displayName: 'ArcticWolf', badges: [badges.HT3], points: 8500 },
  { name: 'BlazeRunner', displayName: 'BlazeRunner', badges: [badges.HT3], points: 8300 },
  { name: 'IronFist', displayName: 'IronFist', badges: [badges.HT4], points: 8100 },
  { name: 'ThunderStrike', displayName: 'ThunderStrike', badges: [badges.HT4], points: 7900 },
  { name: 'DarkMatter', displayName: 'DarkMatter', badges: [badges.HT4], points: 7700 },
  { name: 'SilverEdge', displayName: 'SilverEdge', badges: [badges.HT5], points: 7500 },
  { name: 'FrostByte', displayName: 'FrostByte', badges: [badges.HT5], points: 7300 },
  { name: 'HyperKnight', displayName: 'HyperKnight', badges: [badges.HT5], points: 7100 },
  { name: 'NeonBlade', displayName: 'NeonBlade', badges: [], points: 6900 },
  { name: 'OmegaForce', displayName: 'OmegaForce', badges: [], points: 6700 },
  { name: 'TitanSlayer', displayName: 'TitanSlayer', badges: [], points: 6500 },
  { name: 'GhostRider', displayName: 'GhostRider', badges: [], points: 6300 },
  { name: 'CobaltKing', displayName: 'CobaltKing', badges: [badges.LT1], points: 5000 },
  { name: 'PixelWarrior', displayName: 'PixelWarrior', badges: [badges.LT1], points: 4800 },
]

const nethpotPlayers = [
  { name: 'PotionMaster', displayName: 'PotionMaster', badges: [badges.HT1], points: 9900 },
  { name: 'BrewKing', displayName: 'BrewKing', badges: [badges.HT1], points: 9700 },
  { name: 'AlchemistX', displayName: 'AlchemistX', badges: [badges.HT2], points: 9350 },
  { name: 'NetherLord', displayName: 'NetherLord', badges: [badges.HT2], points: 9100 },
  { name: 'InfernalAce', displayName: 'InfernalAce', badges: [badges.HT3], points: 8800 },
  { name: 'BlazePotion', displayName: 'BlazePotion', badges: [badges.HT3], points: 8600 },
  { name: 'MagmaFist', displayName: 'MagmaFist', badges: [badges.HT3], points: 8400 },
  { name: 'QuartzBlade', displayName: 'QuartzBlade', badges: [badges.HT4], points: 8000 },
  { name: 'EmberStrike', displayName: 'EmberStrike', badges: [badges.HT4], points: 7800 },
  { name: 'CinderPvP', displayName: 'CinderPvP', badges: [badges.HT5], points: 7200 },
  { name: 'PyroClaw', displayName: 'PyroClaw', badges: [badges.HT5], points: 7000 },
  { name: 'HotSword', displayName: 'HotSword', badges: [], points: 6800 },
  { name: 'FlameDancer', displayName: 'FlameDancer', badges: [], points: 6600 },
  { name: 'LavaBender', displayName: 'LavaBender', badges: [], points: 6400 },
  { name: 'NetherFang', displayName: 'NetherFang', badges: [badges.LT1], points: 4900 },
  { name: 'SoulBreaker', displayName: 'SoulBreaker', badges: [badges.LT2], points: 4200 },
]

const smpkitPlayers = [
  { name: 'KitGod', displayName: 'KitGod', badges: [badges.HT1], points: 9950 },
  { name: 'SetMaster', displayName: 'SetMaster', badges: [badges.HT1], points: 9800 },
  { name: 'ArmorKing', displayName: 'ArmorKing', badges: [badges.HT2], points: 9500 },
  { name: 'EnchantLord', displayName: 'EnchantLord', badges: [badges.HT2], points: 9300 },
  { name: 'KitSlayer', displayName: 'KitSlayer', badges: [badges.HT2], points: 9100 },
  { name: 'DiamondEdge', displayName: 'DiamondEdge', badges: [badges.HT3], points: 8700 },
  { name: 'GodSetPro', displayName: 'GodSetPro', badges: [badges.HT3], points: 8500 },
  { name: 'SwordMaster', displayName: 'SwordMaster', badges: [badges.HT4], points: 7600 },
  { name: 'AxeGrinder', displayName: 'AxeGrinder', badges: [badges.HT4], points: 7400 },
  { name: 'ShieldBreak', displayName: 'ShieldBreak', badges: [badges.HT5], points: 7000 },
  { name: 'PvPPro', displayName: 'PvPPro', badges: [badges.HT5], points: 6800 },
  { name: 'FightClub', displayName: 'FightClub', badges: [], points: 6500 },
  { name: 'KitRaider', displayName: 'KitRaider', badges: [], points: 6200 },
  { name: 'CombatAce', displayName: 'CombatAce', badges: [badges.LT1], points: 4700 },
  { name: 'GearGoblin', displayName: 'GearGoblin', badges: [badges.LT2], points: 4000 },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.playerRanking.deleteMany()
  await prisma.player.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPass = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@falcontiers.gg',
      password: adminPass,
      role: 'ADMIN',
    }
  })

  // Create demo player user
  const playerPass = await bcrypt.hash('player123', 10)
  const demoUser = await prisma.user.create({
    data: {
      username: 'PhantomX',
      email: 'phantomx@falcontiers.gg',
      password: playerPass,
      role: 'PLAYER',
    }
  })

  // Seed CPVP players
  for (let i = 0; i < cpvpPlayers.length; i++) {
    const p = cpvpPlayers[i]
    const existing = await prisma.player.findUnique({ where: { username: p.name } })
    let player
    if (!existing) {
      player = await prisma.player.create({
        data: {
          username: p.name,
          displayName: p.displayName,
          ...(p.name === 'PhantomX' ? { userId: demoUser.id } : {}),
        }
      })
    } else {
      player = existing
    }
    await prisma.playerRanking.create({
      data: {
        playerId: player.id,
        category: 'CPVP',
        rank: i + 1,
        points: p.points,
        badges: JSON.stringify(p.badges),
      }
    })
  }

  // Seed NethPot players
  for (let i = 0; i < nethpotPlayers.length; i++) {
    const p = nethpotPlayers[i]
    const existing = await prisma.player.findUnique({ where: { username: p.name } })
    let player
    if (!existing) {
      player = await prisma.player.create({
        data: { username: p.name, displayName: p.displayName }
      })
    } else {
      player = existing
    }
    await prisma.playerRanking.create({
      data: {
        playerId: player.id,
        category: 'NETHPOT',
        rank: i + 1,
        points: p.points,
        badges: JSON.stringify(p.badges),
      }
    })
  }

  // Seed SMP Kit players
  for (let i = 0; i < smpkitPlayers.length; i++) {
    const p = smpkitPlayers[i]
    const existing = await prisma.player.findUnique({ where: { username: p.name } })
    let player
    if (!existing) {
      player = await prisma.player.create({
        data: { username: p.name, displayName: p.displayName }
      })
    } else {
      player = existing
    }
    await prisma.playerRanking.create({
      data: {
        playerId: player.id,
        category: 'SMPKIT',
        rank: i + 1,
        points: p.points,
        badges: JSON.stringify(p.badges),
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('   Admin: admin / admin123')
  console.log('   Demo Player: PhantomX / player123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
