import { BASES, DISPLAYS, DISPLAY_OPTIONS, DSP_PREF_MAP, IOCARDS, COMBO_CARDS,
         FLEXYS, FLEXYS_IOCARDS, FIXED_PLCS, ACC } from '../data/products'
import { getProductImage } from '../data/productImages'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function img(code) { return getProductImage(code) || '' }

function makeItem(code, desc, hsn, mrp, qty, group, note = '') {
  return { code, desc, hsn, mrp: +mrp.toFixed(2), qty, total: +(mrp * qty).toFixed(2), group, note, imageUrl: img(code) }
}

// ─── PIN-SHARING RESOLVER ─────────────────────────────────────────────────────
// Returns how many on-board DI are available given user's FI and AI-V requests
function resolveOnboardDI(base, reqFI, reqAIV) {
  const useFI  = reqFI  > 0 && base.fi  > 0
  const useAIV = reqAIV > 0 && base.aiOnboard?.type === 'V' && base.aiOnboard?.count > 0
  if (useFI && useAIV) return base.diFIV ?? base.diFI ?? base.di
  if (useFI)           return base.diFI  ?? base.di
  if (useAIV)          return base.diV   ?? base.di
  return base.di
}

// Returns how many on-board AI channels of a specific type are available
function resolveOnboardAI(base, type) {
  if (!base.aiOnboard) return 0
  const ob = base.aiOnboard
  if (ob.type === type) return ob.count
  if (ob.type === 'mixed' && ob.detail) return ob.detail[type] || 0
  return 0
}

// ─── DISPLAY PICKER ───────────────────────────────────────────────────────────
function pickDisplay(baseCode, dspPref) {
  const base = BASES[baseCode]
  const opts = DISPLAY_OPTIONS[base.size] || []
  const preferred = DSP_PREF_MAP[dspPref] || DSP_PREF_MAP['Any']
  // Try to find display matching preference
  for (const pref of preferred) {
    const match = opts.find(k => DISPLAYS[k]?.dspType === pref)
    if (match && DISPLAYS[match]) return DISPLAYS[match]
  }
  // Fallback to first available
  const fallback = opts.find(k => DISPLAYS[k])
  return fallback ? DISPLAYS[fallback] : null
}

// ─── SLOT COUNT ESTIMATOR for MiBRX ──────────────────────────────────────────
export function slotsNeeded(baseCode, req) {
  const base = BASES[baseCode]
  if (!base) return 99

  // On-board availability after pin-sharing
  const obDI  = resolveOnboardDI(base, req.fi, req.aiV)
  const obFI  = base.fi
  const obRO  = base.ro
  const obAIV = resolveOnboardAI(base, 'V')
  const obAII = resolveOnboardAI(base, 'I')
  const obAITC= resolveOnboardAI(base, 'TC')

  const extra = (need, have, ch) => need > have ? Math.ceil((need - have) / ch) : 0
  let s = 0
  s += extra(req.di,   obDI,  6)
  s += extra(req.ro,   obRO,  4)
  s += extra(req.to,   0,     4)
  s += extra(req.fi,   obFI,  2)
  s += extra(req.aiV,  obAIV, 2)
  s += extra(req.aiI,  obAII, 2)
  s += extra(req.aiTC, obAITC,2)
  s += Math.ceil((req.aiRTD || 0) / 2)
  s += Math.ceil((req.aiPTC || 0) / 2)
  s += Math.ceil((req.aiNTC || 0) / 2)
  s += Math.ceil((req.aiLC  || 0) / 2)
  s += Math.ceil((req.aoV   || 0) / 2)
  s += Math.ceil((req.aoI   || 0) / 2)
  if (req.dl   && !base.rtc)  s++
  if (req.wifi && !base.wifi) s++
  return s
}

// ─── MiBRX BOM BUILDER ───────────────────────────────────────────────────────
function buildMiBRX(baseCode, req, dspPref, useIsolated = false) {
  const base  = BASES[baseCode]
  const plcItems = []
  const accItems = []
  const warnings = []
  let usedSlots = 0

  const addPLC = (code, desc, hsn, mrp, qty, note = '') =>
    plcItems.push(makeItem(code, desc, hsn, mrp, qty, 'PLC', note))
  const addACC = (code, desc, hsn, mrp, qty, note = '') =>
    accItems.push(makeItem(code, desc, hsn, mrp, qty, 'Accessories', note))

  // Base module
  addPLC(baseCode, base.desc, base.hsn, base.mrp, 1)

  // Display
  const dsp = pickDisplay(baseCode, dspPref)
  if (dsp) addPLC(dsp.code, dsp.desc, dsp.hsn, dsp.mrp, 1)

  // Pin-sharing resolution
  const obDI  = resolveOnboardDI(base, req.fi, req.aiV)
  const obFI  = base.fi
  const obRO  = base.ro
  const obAIV = resolveOnboardAI(base, 'V')
  const obAII = resolveOnboardAI(base, 'I')
  const obAITC= resolveOnboardAI(base, 'TC')

  // ── Combo card pass (try to satisfy remaining needs with fewest slots) ──────
  let remDI = Math.max(0, req.di - obDI)
  let remRO = Math.max(0, req.ro - obRO)
  let remTO = req.to || 0
  let remAITC = Math.max(0, (req.aiTC || 0) - obAITC)

  // Try each combo card
  for (const combo of COMBO_CARDS) {
    const p = combo.provides
    // Check if combo satisfies any outstanding need and is cheaper than separate cards
    if (p.di && p.ro && remDI > 0 && remRO > 0) {
      // DI+RO combo
      const useQty = Math.min(Math.ceil(remDI / p.di), Math.ceil(remRO / p.ro))
      if (useQty > 0) {
        // Compare cost vs separate
        const comboCost = combo.mrp * useQty
        const diCard = IOCARDS.di[0]; const roCard = IOCARDS.ro[0]
        const sepCost = (diCard.mrp * Math.ceil(remDI / diCard.ch)) + (roCard.mrp * Math.ceil(remRO / roCard.ch))
        if (comboCost < sepCost) {
          addPLC(combo.code, combo.desc, combo.hsn, combo.mrp, useQty, 'Combo card')
          usedSlots += useQty
          remDI = Math.max(0, remDI - p.di * useQty)
          remRO = Math.max(0, remRO - p.ro * useQty)
        }
      }
    } else if (p.di && p.to && remDI > 0 && remTO > 0) {
      const useQty = Math.min(Math.ceil(remDI / p.di), Math.ceil(remTO / p.to))
      if (useQty > 0) {
        addPLC(combo.code, combo.desc, combo.hsn, combo.mrp, useQty, 'Combo card')
        usedSlots += useQty
        remDI = Math.max(0, remDI - p.di * useQty)
        remTO = Math.max(0, remTO - p.to * useQty)
      }
    } else if (p.di && p.aiTC && remDI > 0 && remAITC > 0) {
      const useQty = Math.min(Math.ceil(remDI / p.di), Math.ceil(remAITC / p.aiTC))
      if (useQty > 0) {
        addPLC(combo.code, combo.desc, combo.hsn, combo.mrp, useQty, 'Combo card')
        usedSlots += useQty
        remDI = Math.max(0, remDI - p.di * useQty)
        remAITC = Math.max(0, remAITC - p.aiTC * useQty)
      }
    }
  }

  // ── Standard IO cards for remaining needs ────────────────────────────────
  const assignCards = (remaining, cardDefs, note = '') => {
    if (remaining <= 0) return
    const card = (useIsolated && cardDefs.length > 1) ? cardDefs[1] : cardDefs[0]
    const qty  = Math.ceil(remaining / card.ch)
    usedSlots += qty
    addPLC(card.code, card.desc, card.hsn, card.mrp, qty, note)
  }

  assignCards(remDI,  IOCARDS.di,  obDI > 0 ? `${obDI} ch on-board · ${Math.max(0,req.di-obDI)} ch via cards` : '')
  assignCards(remRO,  IOCARDS.ro,  obRO > 0 ? `${obRO} ch on-board · ${Math.max(0,req.ro-obRO)} ch via cards` : '')
  assignCards(remTO,  IOCARDS.to)
  assignCards(Math.max(0, (req.fi||0) - obFI), IOCARDS.fi,   obFI > 0 ? `${obFI} ch on-board` : '')
  assignCards(Math.max(0, (req.aiV||0) - obAIV), IOCARDS.aiV)
  assignCards(Math.max(0, (req.aiI||0) - obAII), IOCARDS.aiI)
  assignCards(remAITC, IOCARDS.aiTC)
  assignCards(req.aiRTD||0, IOCARDS.aiRTD)
  assignCards(req.aiPTC||0, IOCARDS.aiPTC)
  assignCards(req.aiNTC||0, IOCARDS.aiNTC)
  assignCards(req.aiLC||0,  IOCARDS.aiLC)
  assignCards(req.aoV||0,   IOCARDS.aoV)
  assignCards(req.aoI||0,   IOCARDS.aoI)

  // Special function cards
  if (req.dl && !base.rtc) {
    usedSlots++
    addPLC('MIBRX-SC-DL', 'MiBRX Slot Card – Datalogging (2MB) & RTC', '85389000', 2392.5, 1)
  }
  if (req.wifi) {
    usedSlots++
    addPLC('MIBRX-SC-WIFI', 'MiBRX Slot Card – WiFi', '85389000', 3621.2, 1)
  }

  // Slot overflow check
  if (usedSlots > base.slots)
    warnings.push(`Requires ${usedSlots} expansion slots — base has ${base.slots}. Consider a larger base.`)

  // ── Accessories (mandatory, separate section) ─────────────────────────────
  if (base.smps) addACC(base.smps, ACC.smps.desc, ACC.smps.hsn, ACC.smps.mrp, 1, 'Required for 24VDC supply')

  // Download cable (from base spec)
  const dlAcc = ACC[base.dlCable === 'AC-USB-RS485-02' ? 'dlMiBRX' : 'dlFlexys']
  addACC(base.dlCable, dlAcc.desc, dlAcc.hsn, dlAcc.mrp, 1, 'Programming cable')

  // Expansion cable if multiple slot cards used
  if (usedSlots > 1) addACC(ACC.expCable.code, ACC.expCable.desc, ACC.expCable.hsn, ACC.expCable.mrp, 1, 'For slot card expansion')

  // HMI communication cable
  if (req.hmi) addACC(ACC.commCable.code, ACC.commCable.desc, ACC.commCable.hsn, ACC.commCable.mrp, 1, 'For HMI connection')

  const plcTotal = plcItems.reduce((s, i) => s + i.total, 0)
  const accTotal = accItems.reduce((s, i) => s + i.total, 0)
  const total    = +(plcTotal + accTotal).toFixed(2)

  // Complexity score: number of physical units (1 base = 1 unit; each slot card rack = 1 unit)
  const unitCount = 1 + (usedSlots > base.slots ? Math.ceil(usedSlots / base.slots) - 1 : 0)

  return {
    plcItems, accItems, plcTotal: +plcTotal.toFixed(2), accTotal: +accTotal.toFixed(2), total,
    usedSlots, totalSlots: base.slots, warnings,
    series: 'MiBRX', baseCode, mnt: base.mnt, ps: base.ps, dsp: dspPref,
    unitCount, cardCount: usedSlots
  }
}

// ─── FIXED PLC FIT CHECK ─────────────────────────────────────────────────────
function fixedFits(plc, req) {
  // Effective DI after FI pin-sharing on fixed PLCs
  const effectiveDI = (req.fi > 0 && plc.fi > 0) ? plc.diFI : plc.di
  if (req.di   > effectiveDI)  return false
  if (req.ro   > plc.ro)       return false
  if (req.to   > plc.to)       return false
  if (req.fi   > plc.fi)       return false
  if (req.aiV  > plc.aiV)      return false
  if (req.aiI  > plc.aiI)      return false
  if (req.aiTC > plc.aiTC)     return false
  if (req.aiRTD> plc.aiRTD)    return false
  if (req.aiPTC > 0 || req.aiNTC > 0 || req.aiLC > 0) return false
  if (req.aoV  > (plc.aoV||0)) return false
  if (req.aoI  > (plc.aoI||0)) return false
  if (req.eth  && !plc.eth)    return false
  if (req.wifi)                return false
  if (req.dl)                  return false
  return true
}

// ─── FLEXYS BOM BUILDER ───────────────────────────────────────────────────────
function buildFlexys(subfamily, req) {
  const fam = FLEXYS[subfamily]
  const plcItems = []
  const accItems = []
  const warnings = []
  let usedSlots = 0

  const addPLC = (code, desc, hsn, mrp, qty, note = '') =>
    plcItems.push(makeItem(code, desc, hsn, mrp, qty, 'PLC', note))
  const addACC = (code, desc, hsn, mrp, qty, note = '') =>
    accItems.push(makeItem(code, desc, hsn, mrp, qty, 'Accessories', note))

  // Pick PS card by power supply
  const psCard = req.ps === '90 to 270 VAC'
    ? fam.psOptions.find(p => p.ps === '90 to 270 VAC')
    : fam.psOptions.find(p => p.ps === '18 to 32 VDC')
  if (!psCard) { return null }

  // Base
  const base = fam.base
  addPLC(base.code, base.desc, base.hsn, base.mrp, 1)

  // Logic card (Flexys Rail and Graphic have separate logic card; TX4 is combined)
  if (fam.logicCard) addPLC(fam.logicCard.code, fam.logicCard.desc, fam.logicCard.hsn, fam.logicCard.mrp, 1)

  // PS card (has 4 built-in DI — no pin sharing on Flexys)
  addPLC(psCard.code, psCard.desc, psCard.hsn, psCard.mrp, 1)
  const obDI = psCard.di || 0

  // IO cards — Flexys uses its own larger cards
  const remDI  = Math.max(0, (req.di  || 0) - obDI)
  const assignF = (remaining, cardDefs) => {
    if (!remaining || remaining <= 0) return
    const card = cardDefs[0]
    const qty  = Math.ceil(remaining / card.ch)
    usedSlots += qty
    // Check for expansion
    if (usedSlots > fam.maxSlots) {
      const expNeeded = Math.ceil((usedSlots - fam.maxSlots) / 4)
      warnings.push(`Requires expansion module(s) — add ${expNeeded}× EXP FLEX 2M (₹3,291.20 each)`)
    }
    addPLC(card.code, card.desc, card.hsn, card.mrp, qty)
  }

  assignF(remDI,          FLEXYS_IOCARDS.di)
  assignF(req.ro||0,      FLEXYS_IOCARDS.ro)
  assignF(req.to||0,      FLEXYS_IOCARDS.to)
  assignF(req.aiV||0,     FLEXYS_IOCARDS.aiV)
  assignF(req.aiI||0,     FLEXYS_IOCARDS.aiI)
  assignF(req.aiTC||0,    FLEXYS_IOCARDS.aiTC)
  assignF(req.aiRTD||0,   FLEXYS_IOCARDS.aiRTD)
  assignF(req.aiLC||0,    FLEXYS_IOCARDS.aiLC)
  assignF(req.aiNTC||0,   FLEXYS_IOCARDS.aiNTC)
  assignF(req.aoV||0,     FLEXYS_IOCARDS.aoV)
  assignF(req.aoI||0,     FLEXYS_IOCARDS.aoI)

  // Accessories
  if (psCard.smps) addACC(psCard.smps, ACC.smps.desc, ACC.smps.hsn, ACC.smps.mrp, 1, 'Required for 24VDC')
  const dlAcc = ACC.dlFlexys
  addACC(fam.dlCable, dlAcc.desc, dlAcc.hsn, dlAcc.mrp, 1, 'Programming cable')
  if (req.hmi) addACC(ACC.commCable.code, ACC.commCable.desc, ACC.commCable.hsn, ACC.commCable.mrp, 1, 'For HMI connection')

  const plcTotal = plcItems.reduce((s, i) => s + i.total, 0)
  const accTotal = accItems.reduce((s, i) => s + i.total, 0)
  const total    = +(plcTotal + accTotal).toFixed(2)

  return {
    plcItems, accItems, plcTotal: +plcTotal.toFixed(2), accTotal: +accTotal.toFixed(2), total,
    usedSlots, totalSlots: fam.maxSlots, warnings,
    series: fam.label, baseCode: base.code,
    mnt: fam.mnt, ps: psCard.ps, dsp: 'N/A',
    unitCount: 1 + Math.floor(usedSlots / (fam.maxSlots + 1)),
    cardCount: usedSlots
  }
}

// ─── COMPLEXITY SCORE ─────────────────────────────────────────────────────────
// Lower = less complex.  unitCount × 10 + cardCount
function complexityScore(cfg) {
  return (cfg.unitCount || 1) * 10 + (cfg.cardCount || 0)
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────────────
export function generateBuckets(req) {
  const candidates = [] // {tier, name, tagline, family, pills, ...cfg}
  const warnings   = []
  const dspPref    = req.displayPref || 'Any'

  // ── FIXED PLCs ────────────────────────────────────────────────────────────
  const fixedMatches = FIXED_PLCS
    .filter(p => fixedFits(p, req))
    .sort((a, b) => a.mrp - b.mrp)

  for (const plc of fixedMatches.slice(0, 2)) {
    const plcItems = [makeItem(plc.code, `${plc.series} – ${plc.desc}`, plc.hsn, plc.mrp, 1, 'PLC')]
    const accItems = []
    if (plc.smps) accItems.push(makeItem(plc.smps, ACC.smps.desc, ACC.smps.hsn, ACC.smps.mrp, 1, 'Accessories', 'Required for 24VDC'))
    accItems.push(makeItem(plc.dlCable, ACC.dlFlexys.desc, ACC.dlFlexys.hsn, ACC.dlFlexys.mrp, 1, 'Accessories', 'Programming cable'))
    const plcTotal = plcItems.reduce((s, i) => s + i.total, 0)
    const accTotal = accItems.reduce((s, i) => s + i.total, 0)
    candidates.push({
      family: plc.series, code: plc.code, mnt: 'Any', ps: plc.ps,
      plcItems, accItems, plcTotal: +plcTotal.toFixed(2), accTotal: +accTotal.toFixed(2),
      total: +(plcTotal + accTotal).toFixed(2),
      usedSlots: 0, totalSlots: 0, warnings: [],
      unitCount: 1, cardCount: 0,
      pills: [
        { t: plc.desc, c: 'green' },
        { t: 'Fixed IO', c: 'gray' },
        { t: plc.ps, c: 'blue' },
        { t: plc.series, c: 'gray' },
      ]
    })
  }

  // ── MiBRX ─────────────────────────────────────────────────────────────────
  const validBases = Object.keys(BASES).filter(code => {
    const b = BASES[code]
    if (req.eth && !b.eth) return false
    return slotsNeeded(code, req) <= b.slots
  })

  for (const baseCode of validBases) {
    const b   = BASES[baseCode]
    const cfg = buildMiBRX(baseCode, req, dspPref, false)
    candidates.push({
      family: 'MiBRX', code: baseCode, mnt: b.mnt, ps: b.ps,
      ...cfg,
      pills: [
        { t: `${b.slots} Slots`, c: 'blue' },
        { t: `${cfg.usedSlots}/${b.slots} Used`, c: cfg.usedSlots > b.slots ? 'amber' : 'green' },
        { t: b.ps, c: 'gray' },
        { t: b.mnt, c: 'gray' },
        ...(b.eth ? [{ t: 'Ethernet', c: 'blue' }] : []),
        ...(b.rtc ? [{ t: 'RTC', c: 'gray' }] : []),
      ]
    })
    // Also try isolated card variant for same base if total > threshold
    if (cfg.total > 15000) {
      const cfgIso = buildMiBRX(baseCode, req, dspPref, true)
      candidates.push({
        family: 'MiBRX', code: baseCode + '-ISO', mnt: b.mnt, ps: b.ps,
        ...cfgIso,
        pills: [
          { t: `${b.slots} Slots`, c: 'blue' },
          { t: 'Isolated Cards', c: 'amber' },
          { t: b.ps, c: 'gray' },
          ...(b.eth ? [{ t: 'Ethernet', c: 'blue' }] : []),
        ]
      })
    }
  }

  // ── Flexys ────────────────────────────────────────────────────────────────
  // Only if no ethernet/wifi required (Flexys comms via Modbus only)
  if (!req.wifi) {
    for (const subfamily of ['rail', 'tx4', 'graphic']) {
      const cfg = buildFlexys(subfamily, req)
      if (cfg) {
        const fam = FLEXYS[subfamily]
        candidates.push({
          family: fam.label, code: fam.base.code, mnt: fam.mnt, ps: req.ps || 'Any',
          ...cfg,
          pills: [
            { t: fam.label, c: 'purple' },
            { t: `${cfg.usedSlots}/${cfg.totalSlots} Slots`, c: cfg.usedSlots > cfg.totalSlots ? 'amber' : 'green' },
            { t: fam.mnt, c: 'gray' },
          ]
        })
      }
    }
  }

  if (candidates.length === 0) {
    warnings.push('No configuration found for this requirement. Please review your inputs or contact Selec engineering.')
    return { buckets: [], warnings }
  }

  // ── Apply display preference filter ─────────────────────────────────────────
  // Filter candidates whose display type matches user preference
  const dspFiltered = dspPref === 'Any'
    ? candidates
    : candidates.filter(c => {
        // Fixed PLCs have no display — always include them
        if (c.cardCount === 0 && c.unitCount === 1 && !c.totalSlots) return true
        // Flexys Graphic has built-in 3.5" touch display
        if (c.family === 'Flexys Graphic') return dspPref === '3.5 Inch HMI' || dspPref === 'Any'
        // MiBRX — check if any display option for this base supports the preference
        if (!c.baseCode) return true
        const base = BASES[c.baseCode.replace('-ISO','')]
        if (!base) return true
        const opts = DISPLAY_OPTIONS[base.size] || []
        return opts.some(k => DISPLAYS[k]?.dspType === dspPref)
      })

  const pool = dspFiltered.length > 0 ? dspFiltered : candidates

  // ── Internal 4-quadrant ranking (background) ─────────────────────────────
  const sorted  = [...pool].sort((a, b) => a.total - b.total)
  const midCost = sorted[Math.floor(sorted.length / 2)]?.total || 0

  const isLowCost    = c => c.total <= midCost
  const isLowComplex = c => complexityScore(c) <= 10

  const quadrants = [
    { id:1, label:'Economical · Simple',     filter: c =>  isLowCost(c) &&  isLowComplex(c), icon:'🟢' },
    { id:2, label:'Economical · Scalable',   filter: c =>  isLowCost(c) && !isLowComplex(c), icon:'🔵' },
    { id:3, label:'Premium · Simple',        filter: c => !isLowCost(c) &&  isLowComplex(c), icon:'🟡' },
    { id:4, label:'Premium · Full Featured', filter: c => !isLowCost(c) && !isLowComplex(c), icon:'🟣' },
  ]

  const ranked = []
  const used   = new Set()

  for (const q of quadrants) {
    const matches = pool
      .filter((c, i) => q.filter(c) && !used.has(i))
      .sort((a, b) => a.total - b.total || complexityScore(a) - complexityScore(b))
    if (matches.length > 0) {
      const best = matches[0]
      used.add(pool.indexOf(best))
      ranked.push({ rank:q.id, tier:q.label, icon:q.icon, ...best,
        name: `${best.family} – ${(best.code||'').replace('-ISO','')}`,
        tagline: buildTagline(best, q.label),
      })
    }
  }

  // Fill any empty quadrant from remaining pool
  for (const q of quadrants) {
    if (!ranked.find(b => b.rank === q.id)) {
      const remaining = pool.filter((c, i) => !used.has(i))
        .sort((a, b) => a.total - b.total)
      if (remaining.length > 0) {
        const best = remaining[0]
        used.add(pool.indexOf(best))
        ranked.push({ rank:q.id, tier:q.label, icon:q.icon, ...best,
          name: `${best.family} – ${(best.code||'').replace('-ISO','')}`,
          tagline: buildTagline(best, q.label),
        })
      }
    }
  }

  // ── Always return top 3 (sorted by rank = quadrant priority) ─────────────
  const buckets = ranked
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map((b, i) => ({ ...b, rank: i + 1 })) // re-number 1–3

  return { buckets, warnings }
}

function buildTagline(cfg, tier) {
  const units = cfg.unitCount === 1 ? 'Single unit' : `${cfg.unitCount} units`
  const cards = cfg.cardCount > 0 ? `, ${cfg.cardCount} expansion card${cfg.cardCount > 1 ? 's' : ''}` : ', no expansion cards'
  return `${units}${cards} · ${tier}`
}
