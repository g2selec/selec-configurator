import { BASES, DISPLAYS, IOCARDS, FIXED_PLCS, ACC } from '../data/products'
import { getProductImage } from '../data/productImages'

// ─── DISPLAY SELECTION ────────────────────────────────────────────────────────
function pickDisplay(baseCode) {
  const { size, mnt } = BASES[baseCode]
  if (size === '2M')    return DISPLAYS['2M-LCD'] ?? DISPLAYS['2M-7Seg']
  if (size === '4M')    return DISPLAYS['4M-LCD']
  if (size === '6M')    return DISPLAYS['6M-LCD']
  if (size === '48x96') return DISPLAYS['48x96-7Seg']
  if (size === '72x72') return DISPLAYS['72x72-LCD']
  if (size === '96x96') return DISPLAYS['96x96-LCD16x4']
  return DISPLAYS['4M-LCD']
}

// ─── SLOT COUNT ESTIMATOR ─────────────────────────────────────────────────────
export function slotsNeeded(baseCode, req) {
  const b = BASES[baseCode]
  const extra = (need, have, ch) => need > have ? Math.ceil((need - have) / ch) : 0
  let s = 0
  s += extra(req.di,   b.di,  6)
  s += extra(req.ro,   b.ro,  4)
  s += extra(req.to,   b.to || 0, 4)
  s += extra(req.fi,   b.fi,  2)
  s += extra(req.aiV,  b.aiV, 2)
  s += extra(req.aiI,  b.aiI, 2)
  s += Math.ceil((req.aiTC  || 0) / 2)
  s += Math.ceil((req.aiPTC || 0) / 2)
  s += Math.ceil((req.aiNTC || 0) / 2)
  s += Math.ceil((req.aiRTD || 0) / 2)
  s += Math.ceil((req.aiLC  || 0) / 2)
  s += Math.ceil((req.aoV   || 0) / 2)
  s += Math.ceil((req.aoI   || 0) / 2)
  if (req.dl   && !b.rtc)  s++
  if (req.wifi && !b.wifi) s++
  return s
}

// ─── BUILD ONE MiBRX CONFIG ───────────────────────────────────────────────────
function buildMiBRX(baseCode, req, useIsolated = false) {
  const b     = BASES[baseCode]
  const items = []
  const warnings = []
  let usedSlots = 0

  const add = (code, desc, hsn, mrp, qty, group, note = '') =>
    items.push({ code, desc, hsn, mrp: +mrp.toFixed(2), qty, total: +(mrp * qty).toFixed(2), group, note, imageUrl: getProductImage(code) || '' })

  // Base + display
  add(baseCode, `MiBRX ${b.size} Base Module`, b.hsn, b.mrp, 1, 'CPU & Base')
  const dsp = pickDisplay(baseCode)
  add(dsp.code, dsp.desc, dsp.hsn, dsp.mrp, 1, 'Display')

  // IO card assignment — subtract on-board first
  const assignCards = (needed, onboard, cardDefs, group, label) => {
    const extra = Math.max(0, needed - onboard)
    if (extra <= 0) return
    const card = (useIsolated && cardDefs.length > 1) ? cardDefs[1] : cardDefs[0]
    const qty  = Math.ceil(extra / card.ch)
    usedSlots += qty
    const note = onboard > 0 ? `${onboard} ch on-board · ${extra} ch via cards` : ''
    add(card.code, card.desc, card.hsn, card.mrp, qty, group, note)
  }

  assignCards(req.di,   b.di,     IOCARDS.di,   'Digital I/O',   'Digital Inputs')
  assignCards(req.ro,   b.ro,     IOCARDS.ro,   'Digital I/O',   'Relay Outputs')
  assignCards(req.to,   b.to||0,  IOCARDS.to,   'Digital I/O',   'Transistor Outputs')
  assignCards(req.fi,   b.fi,     IOCARDS.fi,   'Digital I/O',   'Fast Inputs')
  assignCards(req.aiV,  b.aiV,    IOCARDS.aiV,  'Analog Inputs', 'AI Voltage')
  assignCards(req.aiI,  b.aiI,    IOCARDS.aiI,  'Analog Inputs', 'AI Current')
  assignCards(req.aiTC, 0,        IOCARDS.aiTC, 'Analog Inputs', 'AI Thermocouple')
  assignCards(req.aiPTC,0,        IOCARDS.aiPTC,'Analog Inputs', 'AI PTC')
  assignCards(req.aiNTC,0,        IOCARDS.aiNTC,'Analog Inputs', 'AI NTC')
  assignCards(req.aiRTD,0,        IOCARDS.aiRTD,'Analog Inputs', 'AI RTD')
  assignCards(req.aiLC, 0,        IOCARDS.aiLC, 'Analog Inputs', 'AI Load Cell')
  assignCards(req.aoV,  0,        IOCARDS.aoV,  'Analog Outputs','AO Voltage')
  assignCards(req.aoI,  0,        IOCARDS.aoI,  'Analog Outputs','AO Current')

  // Special cards
  if (req.dl && !b.rtc) {
    usedSlots++
    add('MIBRX-SC-DL', 'Datalogging (2MB) & RTC', '85389000', 2392.5, 1, 'Special')
  }
  if (req.wifi) {
    usedSlots++
    add('MIBRX-SC-WIFI', 'WiFi Slot Card', '85389000', 3621.2, 1, 'Special')
  }

  // Accessories
  add(ACC.dlCable.code, ACC.dlCable.desc, ACC.dlCable.hsn, ACC.dlCable.mrp, 1, 'Accessories')
  if (usedSlots > 1)
    add(ACC.expCable.code, ACC.expCable.desc, ACC.expCable.hsn, ACC.expCable.mrp, 1, 'Accessories')
  if (req.hmi)
    add(ACC.hmiCable.code, ACC.hmiCable.desc, ACC.hmiCable.hsn, ACC.hmiCable.mrp, 1, 'Accessories', 'For HMI connection')

  if (usedSlots > b.slots)
    warnings.push(`Needs ${usedSlots} expansion slots — base has ${b.slots}. Consider a larger base or expansion rack.`)

  const total = items.reduce((s, i) => s + i.total, 0)
  return { items, total: +total.toFixed(2), usedSlots, totalSlots: b.slots, warnings, series: 'MiBRX', baseCode, mnt: b.mnt, ps: b.ps }
}

// ─── FIXED PLC ELIGIBILITY ────────────────────────────────────────────────────
function fixedFits(plc, req) {
  if (req.di    > plc.di)    return false
  if (req.ro    > plc.ro)    return false
  if (req.to    > plc.to)    return false
  if (req.fi    > plc.fi)    return false
  if (req.aiV   > plc.aiV)  return false
  if (req.aiI   > plc.aiI)  return false
  if (req.aiTC  > plc.aiTC) return false
  if (req.aiRTD > plc.aiRTD)return false
  if (req.aiPTC > 0 || req.aiNTC > 0 || req.aiLC > 0) return false
  if (req.aoV   > plc.aoV)  return false
  if (req.aoI   > plc.aoI)  return false
  if (req.eth   && !plc.eth) return false
  if (req.wifi)              return false
  return true
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────────────
export function generateBuckets(req) {
  const buckets  = []
  const warnings = []

  // Valid MiBRX bases: eth OK + enough slots
  const validBases = Object.keys(BASES).filter(code => {
    const b = BASES[code]
    if (req.eth && !b.eth) return false
    return slotsNeeded(code, req) <= b.slots
  })

  // ── BUCKET 1: Budget — cheapest fixed IO ──────────────────────────────────
  const fixedMatches = FIXED_PLCS
    .filter(p => fixedFits(p, req))
    .sort((a, b) => a.mrp - b.mrp)

  if (fixedMatches.length > 0) {
    const p = fixedMatches[0]
    const items = [
      { code: p.code, desc: `${p.series} – ${p.desc}`, hsn: '85371090', mrp: p.mrp, qty: 1, total: p.mrp, group: 'PLC', note: '' },
      { code: ACC.dlCable.code, desc: ACC.dlCable.desc, hsn: ACC.dlCable.hsn, mrp: ACC.dlCable.mrp, qty: 1, total: ACC.dlCable.mrp, group: 'Accessories', note: '' },
    ]
    const total = items.reduce((s, i) => s + i.total, 0)
    buckets.push({
      rank: 1, tier: 'Budget',
      name: `${p.series} – ${p.desc}`,
      tagline: 'Compact fixed-IO PLC. All required channels on-board. No expansion needed.',
      family: p.series, code: p.code,
      ps: p.ps, mnt: 'Din Rail / Panel',
      pills: [{ t: p.desc, c: 'green' }, { t: 'Fixed IO', c: 'gray' }, { t: p.ps, c: 'blue' }],
      items, total: +total.toFixed(2),
      usedSlots: 0, totalSlots: 0, warnings: [],
    })
  }

  // ── BUCKET 2: Standard — smallest valid MiBRX ────────────────────────────
  if (validBases.length > 0) {
    const byMRP   = [...validBases].sort((a, b) => BASES[a].mrp - BASES[b].mrp)
    const stdCode = byMRP[0]
    const cfg     = buildMiBRX(stdCode, req, false)
    const b       = BASES[stdCode]
    buckets.push({
      rank: 2, tier: 'Standard',
      name: `MiBRX ${b.size} – Modular`,
      tagline: 'Modular expandable PLC. Optimal slot usage with standard signal cards.',
      family: 'MiBRX', code: stdCode,
      ps: b.ps, mnt: b.mnt,
      pills: [
        { t: `${b.slots} Slots`, c: 'blue' },
        { t: `${cfg.usedSlots}/${b.slots} Used`, c: cfg.usedSlots > b.slots ? 'amber' : 'green' },
        { t: b.ps, c: 'gray' }, { t: b.mnt, c: 'gray' },
        ...(b.eth ? [{ t: 'Ethernet', c: 'blue' }] : []),
        ...(b.rtc ? [{ t: 'RTC', c: 'gray' }] : []),
      ],
      ...cfg,
    })
  }

  // ── BUCKET 3: Advanced — most headroom, isolated cards ───────────────────
  if (validBases.length > 0) {
    const withHeadroom = [...validBases]
      .map(code => ({ code, free: BASES[code].slots - slotsNeeded(code, req), mrp: BASES[code].mrp }))
      .sort((a, b) => b.free - a.free || a.mrp - b.mrp)

    const advCode = withHeadroom[0].code
    // Only add if different from standard
    const stdCode = buckets[1]?.code
    if (advCode !== stdCode || validBases.length === 1) {
      const cfg  = buildMiBRX(advCode, req, true)
      const b    = BASES[advCode]
      const free = b.slots - cfg.usedSlots
      buckets.push({
        rank: 3, tier: 'Advanced',
        name: `MiBRX ${b.size} – Expansion Ready`,
        tagline: `${free} free slot${free !== 1 ? 's' : ''} for future IO. Industrial-grade isolated signal cards.`,
        family: 'MiBRX', code: advCode,
        ps: b.ps, mnt: b.mnt,
        pills: [
          { t: `${b.slots} Slots`, c: 'blue' },
          { t: `${free} Free`, c: 'green' },
          { t: b.ps, c: 'gray' }, { t: b.mnt, c: 'gray' },
          { t: 'Isolated Cards', c: 'amber' },
          ...(b.eth ? [{ t: 'Ethernet', c: 'blue' }] : []),
        ],
        ...cfg,
      })
    }
  }

  // Pad to at least 3 if we have fewer
  while (buckets.length < 3 && validBases.length > 0) {
    const usedCodes = new Set(buckets.map(b => b.code))
    const remaining = validBases.filter(c => !usedCodes.has(c))
    if (!remaining.length) break
    remaining.sort((a, b) => BASES[a].mrp - BASES[b].mrp)
    const xCode = remaining[0]
    const cfg   = buildMiBRX(xCode, req, false)
    const b     = BASES[xCode]
    buckets.push({
      rank: buckets.length + 1, tier: 'Alternative',
      name: `MiBRX ${b.size} – Alternative`,
      tagline: 'Alternative configuration for this IO requirement.',
      family: 'MiBRX', code: xCode,
      ps: b.ps, mnt: b.mnt,
      pills: [{ t: b.ps, c: 'gray' }, { t: b.mnt, c: 'gray' }],
      ...cfg,
    })
  }

  if (buckets.length === 0)
    warnings.push('No configuration found for this IO requirement. Please review your inputs.')

  return { buckets, warnings }
}
