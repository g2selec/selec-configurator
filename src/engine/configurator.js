import { BASES, HMI_OPTIONS, DISPLAYS, DISPLAY_OPTIONS, DSP_PREF_MAP, IOCARDS, COMBO_CARDS,
         SLAVE_DISPLAYS,
         FLEXYS, FLEXYS_IOCARDS, FIXED_PLCS, ACC,
         IO_COMPAT, BASE_TO_MATRIX,
         FLEXYS_SETS, FLEXYS_EXP, FLEXYS_ACC_SET1, FLEXYS_ACH004,
         FLEXYS_HMI_CABLE, FLEXYS_DL, FLEXYS_CASES, FLEXYS_MAX_SLOTS } from '../data/products'
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

// ─── IO CARD COMPATIBILITY VALIDATOR ─────────────────────────────────────────
// Returns null if valid, or a rejection reason string if invalid
// Called before generating a config — if invalid, base is skipped entirely

function validateCardCompat(baseCode, req) {
  const matrixKey = BASE_TO_MATRIX[baseCode]
  if (!matrixKey) return null // no matrix data = no restriction
  const m = IO_COMPAT[matrixKey]
  if (!m) return null

  // Helper: get compat rule for a card
  const rule = (cardCode) => {
    if (cardCode in m) return m[cardCode]
    return true // not listed = assumed compatible
  }

  // Helper: check a card type — returns rejection string or null
  const check = (cardCode, qty, label) => {
    const r = rule(cardCode)
    if (r === false) return `${label} cards not supported on this base`
    if (r === 'S2_only' && qty > 1) return `Only 1 ${label} card supported (Slot 2 only)`
    if (typeof r === 'number' && qty > r) return `Max ${r} ${label} card(s) on this base (requested ${qty})`
    return null
  }

  const base = BASES[baseCode]

  // Calculate card counts needed (same logic as buildMiBRX)
  const obDI  = resolveOnboardDI(base, req.fi, req.aiV)
  const obRO  = base.ro
  const obAIV = resolveOnboardAI(base, 'V')
  const obAII = resolveOnboardAI(base, 'I')

  const diCards  = Math.max(0, (req.di||0)  - obDI)  > 0 ? Math.ceil(Math.max(0,(req.di||0)-obDI)/6)  : 0
  const roCards  = Math.max(0, (req.ro||0)  - obRO)  > 0 ? Math.ceil(Math.max(0,(req.ro||0)-obRO)/4)  : 0
  const toCards  = (req.to||0)  > 0 ? Math.ceil((req.to||0)/4)  : 0
  const aoVCards = (req.aoV||0) > 0 ? Math.ceil((req.aoV||0)/2) : 0
  const aoICards = (req.aoI||0) > 0 ? Math.ceil((req.aoI||0)/2) : 0
  const dlCards  = (req.dl && !base.rtc) ? 1 : 0
  const wifiCards= req.wifi ? 1 : 0
  const lcCards  = (req.aiLC||0) > 0 ? Math.ceil((req.aiLC||0)/2) : 0

  // RO card check
  if (roCards > 0) {
    const roCard = IOCARDS.ro[0] // MIBRX-SC-RO04
    const err = check(roCard.code, roCards, 'Relay Output')
    if (err) return err
  }

  // AO card check
  const aoCards = aoVCards + aoICards
  if (aoCards > 0) {
    const aoCard = 'MIBRX-SC-AO02-V-I-ISO'
    const err = check(aoCard, aoCards, 'Analog Output')
    if (err) return err
  }

  // Combined RO + AO limit (230V models)
  const maxCombined = m._max_ro_ao_combined
  if (maxCombined !== null && maxCombined !== undefined) {
    const combined = roCards + aoCards
    if (combined > maxCombined) {
      return `Combined Relay Output + Analog Output cards exceed limit of ${maxCombined} on this 230V base (need ${combined})`
    }
  }

  // DL card check
  if (dlCards > 0) {
    const r = rule('MIBRX-SC-DL')
    if (r === false) return 'Datalogging card not supported on this base'
    // If DL is S2_only and we also have AI/AO/LC cards — calibration conflict warning
    // (we allow but note it — not a hard block since user may not need calibration)
  }

  // WiFi card check
  if (wifiCards > 0) {
    const r = rule('MIBRX-SC-WIFI')
    if (r === false) return 'WiFi card not supported on this base'
    if (r === 'S2_only' && (dlCards > 0)) return 'WiFi and Datalogging both require Slot 2 — cannot use both on this base'
  }

  // LC card check
  if (lcCards > 0) {
    const r = rule('MIBRX-SC-LC02')
    if (r === false) return 'Load Cell card not supported on this base'
  }

  return null // all good
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
    warnings.push(`Requires ${usedSlots} IO card slots — base has ${base.slots}. Consider a larger base.`)

  // ── Accessories (mandatory, separate section) ─────────────────────────────
  if (base.smps) addACC(base.smps, ACC.smps.desc, ACC.smps.hsn, ACC.smps.mrp, 1, 'Required for 24VDC supply')

  // Download cable (from base spec)
  const dlAcc = ACC[base.dlCable === 'AC-USB-RS485-02' ? 'dlMiBRX' : 'dlFlexys']
  addACC(base.dlCable, dlAcc.desc, dlAcc.hsn, dlAcc.mrp, 1, 'Programming cable')

  // Expansion cable only needed for multi-unit (master+slave) — not added here

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

// ─── FLEXYS SLOT CALCULATOR ──────────────────────────────────────────────────
// Counts IO cards needed — PS card's 4 built-in DI used first, no slot consumed
function calcFlexysSlots(req, psDI) {
  const obDI = psDI || 0
  const extraDI = Math.max(0, (req.di || 0) - obDI)

  let slots = 0
  if (extraDI > 0)       slots += Math.ceil(extraDI / FLEXYS_IOCARDS.di[0].ch)
  if (req.ro  > 0)       slots += Math.ceil(req.ro  / FLEXYS_IOCARDS.ro[0].ch)
  if (req.to  > 0)       slots += Math.ceil(req.to  / FLEXYS_IOCARDS.to[0].ch)
  if (req.aiV > 0)       slots += Math.ceil(req.aiV / FLEXYS_IOCARDS.aiV[0].ch)
  if (req.aiI > 0)       slots += Math.ceil(req.aiI / FLEXYS_IOCARDS.aiI[0].ch)
  if (req.aiTC > 0)      slots += Math.ceil(req.aiTC / FLEXYS_IOCARDS.aiTC[0].ch)
  if (req.aiRTD > 0)     slots += Math.ceil(req.aiRTD / FLEXYS_IOCARDS.aiRTD[0].ch)
  if (req.aiLC > 0)      slots += Math.ceil(req.aiLC / FLEXYS_IOCARDS.aiLC[0].ch)
  if (req.aiNTC > 0)     slots += Math.ceil(req.aiNTC / FLEXYS_IOCARDS.aiNTC[0].ch)
  if (req.aoV > 0)       slots += Math.ceil(req.aoV / FLEXYS_IOCARDS.aoV[0].ch)
  if (req.aoI > 0)       slots += Math.ceil(req.aoI / FLEXYS_IOCARDS.aoI[0].ch)
  return slots
}

// ─── FLEXYS BOM BUILDER ───────────────────────────────────────────────────────
function buildFlexysConfig(mainSet, req, selectedPs, hmiOption) {
  const plcItems = []
  const accItems = []
  const warnings = []

  const addPLC = (code, desc, hsn, mrp, qty, note = '') =>
    plcItems.push(makeItem(code, desc, hsn, mrp, qty, 'PLC', note))
  const addACC = (code, desc, hsn, mrp, qty, note = '') =>
    accItems.push(makeItem(code, desc, hsn, mrp, qty, 'Accessories', note))

  const setDef  = FLEXYS_SETS[mainSet]  // 'set1' or 'set2'
  const ps      = selectedPs === '90 to 270 VAC'
    ? setDef.psOptions.find(p => p.ps === '90 to 270 VAC')
    : setDef.psOptions.find(p => p.ps === '18 to 32 VDC')
  if (!ps) return null

  const psDI    = ps.di || 0
  const slotsNeeded = calcFlexysSlots(req, psDI)

  // Fallback if exceeds max
  if (slotsNeeded > FLEXYS_MAX_SLOTS) {
    return { tooLarge: true, slotsNeeded }
  }

  // Find the right case
  const caseRow = FLEXYS_CASES.find(c => slotsNeeded >= c.minSlots && slotsNeeded <= c.maxSlots)
  if (!caseRow) return { tooLarge: true, slotsNeeded }

  // ── Main unit ──────────────────────────────────────────────────────────────
  if (mainSet === 'set1') {
    // TX4 — base is the logic card combined
    addPLC(setDef.base.code, setDef.base.desc, setDef.base.hsn, setDef.base.mrp, 1)
  } else {
    // Rail — separate base + logic card
    addPLC(setDef.base.code,      setDef.base.desc,      setDef.base.hsn,      setDef.base.mrp,      1)
    addPLC(setDef.logicCard.code, setDef.logicCard.desc, setDef.logicCard.hsn, setDef.logicCard.mrp, 1)
  }
  addPLC(ps.code, ps.desc, ps.hsn, ps.mrp, 1, 'Main unit power supply')

  // ── IO cards on main unit ─────────────────────────────────────────────────
  // Fill main unit slots first (up to 4), rest go to slave slots
  const mainSlotsAvail = setDef.ioSlots
  let slotsRemaining   = slotsNeeded
  let slotsOnMain      = Math.min(slotsRemaining, mainSlotsAvail)
  // (IO cards are added as a group — engine doesn't split across units at card level)
  // Add all IO cards — they'll physically distribute across main + slaves
  const addIOCards = (needed, cardDefs, label) => {
    if (!needed || needed <= 0) return
    const card = cardDefs[0]
    const qty  = Math.ceil(needed / card.ch)
    addPLC(card.code, card.desc, card.hsn, card.mrp, qty, label)
  }

  const extraDI = Math.max(0, (req.di || 0) - psDI)
  addIOCards(extraDI,        FLEXYS_IOCARDS.di,   `${psDI} DI from PS card · ${extraDI} via IO cards`)
  addIOCards(req.ro  || 0,   FLEXYS_IOCARDS.ro,   '')
  addIOCards(req.to  || 0,   FLEXYS_IOCARDS.to,   '')
  addIOCards(req.aiV || 0,   FLEXYS_IOCARDS.aiV,  '')
  addIOCards(req.aiI || 0,   FLEXYS_IOCARDS.aiI,  '')
  addIOCards(req.aiTC || 0,  FLEXYS_IOCARDS.aiTC, '')
  addIOCards(req.aiRTD || 0, FLEXYS_IOCARDS.aiRTD,'')
  addIOCards(req.aiLC || 0,  FLEXYS_IOCARDS.aiLC, '')
  addIOCards(req.aiNTC || 0, FLEXYS_IOCARDS.aiNTC,'')
  addIOCards(req.aoV || 0,   FLEXYS_IOCARDS.aoV,  '')
  addIOCards(req.aoI || 0,   FLEXYS_IOCARDS.aoI,  '')

  // ── EXP FLEX 2M modules ───────────────────────────────────────────────────
  if (caseRow.expFlex > 0) {
    addPLC(FLEXYS_EXP.code, FLEXYS_EXP.desc, FLEXYS_EXP.hsn, FLEXYS_EXP.mrp, caseRow.expFlex,
      `Expansion slot${caseRow.expFlex > 1 ? 's' : ''} for extra IO cards`)
  }

  // ── Set 2 slave units ─────────────────────────────────────────────────────
  const slaveSet = FLEXYS_SETS.set2
  const slavePs  = selectedPs === '90 to 270 VAC'
    ? slaveSet.psOptions.find(p => p.ps === '90 to 270 VAC')
    : slaveSet.psOptions.find(p => p.ps === '18 to 32 VDC')

  if (caseRow.set2Slaves > 0 && slavePs) {
    addPLC(slaveSet.base.code,      slaveSet.base.desc,      slaveSet.base.hsn,      slaveSet.base.mrp,      caseRow.set2Slaves, 'Slave unit base')
    addPLC(slaveSet.logicCard.code, slaveSet.logicCard.desc, slaveSet.logicCard.hsn, slaveSet.logicCard.mrp, caseRow.set2Slaves, 'Slave unit logic card')
    addPLC(slavePs.code,            slavePs.desc,            slavePs.hsn,            slavePs.mrp,            caseRow.set2Slaves, 'Slave unit power supply')
  }

  // ── HMI ───────────────────────────────────────────────────────────────────
  if (hmiOption) {
    addPLC(hmiOption.code, hmiOption.desc, '85371090', hmiOption.mrp, 1, 'External HMI Panel')
  }

  // ── Accessories ───────────────────────────────────────────────────────────
  // SMPS for main if 24VDC
  if (ps.smps) addACC(ACC.smps.code, ACC.smps.desc, ACC.smps.hsn, ACC.smps.mrp, 1, 'Main unit SMPS')

  // Accessory Set 1 × accSet1Count (RPS60 + ACH-004 + AC-IOEXP-03)
  if (caseRow.accSet1Count > 0) {
    FLEXYS_ACC_SET1.forEach(a => {
      addACC(a.code, a.desc, a.hsn, a.mrp, caseRow.accSet1Count, 'Accessory Set 1')
    })
  }

  // Extra ACH-004 per Set 2 slave (beyond what's in Acc Set 1)
  if (caseRow.needACH004 && caseRow.set2Slaves > 0) {
    addACC(FLEXYS_ACH004.code, FLEXYS_ACH004.desc, FLEXYS_ACH004.hsn, FLEXYS_ACH004.mrp,
      caseRow.set2Slaves, 'Inter-unit expansion cable')
  }

  // HMI cable
  if (hmiOption) {
    addACC(FLEXYS_HMI_CABLE.code, FLEXYS_HMI_CABLE.desc, FLEXYS_HMI_CABLE.hsn, FLEXYS_HMI_CABLE.mrp, 1, 'HMI communication cable')
  }

  // Download cable
  const dlCable = caseRow.dlMulti ? FLEXYS_DL.multi : FLEXYS_DL.single
  addACC(dlCable.code, dlCable.desc, dlCable.hsn, dlCable.mrp, 1, 'Programming cable')

  const plcTotal = plcItems.reduce((s, i) => s + i.total, 0)
  const accTotal = accItems.reduce((s, i) => s + i.total, 0)
  const total    = +(plcTotal + accTotal).toFixed(2)

  // Complexity: 1 main + slaves = unitCount
  const unitCount = 1 + caseRow.set2Slaves
  const cardCount = slotsNeeded

  return {
    plcItems, accItems,
    plcTotal: +plcTotal.toFixed(2),
    accTotal: +accTotal.toFixed(2),
    total,
    usedSlots: slotsNeeded,
    totalSlots: mainSlotsAvail + (caseRow.set2Slaves * 4) + caseRow.expFlex,
    warnings,
    series: setDef.label,
    baseCode: setDef.base.code,
    mnt: mainSet === 'set1' ? 'Panel' : 'Din Rail',
    ps: selectedPs || 'Any',
    dsp: hmiOption ? '3.5 Inch HMI' : 'Any',
    unitCount,
    cardCount,
    caseIndex: FLEXYS_CASES.indexOf(caseRow) + 1,
  }
}

// ─── COMPLEXITY SCORE ────────────────────────────────────────────────────────
// ─── COMPLEXITY SCORE ─────────────────────────────────────────────────────────
// Lower = less complex.  unitCount × 10 + cardCount
function complexityScore(cfg) {
  return (cfg.unitCount || 1) * 10 + (cfg.cardCount || 0)
}

// ─── MiBRX MULTI-UNIT BUILDER ────────────────────────────────────────────────
// Called only when no single base satisfies the requirement
// Picks largest master + smallest slave(s) to cover remaining IO

function buildMiBRXMultiUnit(req, dspPref) {
  // All master bases sorted by slots descending (prefer largest master)
  const masterBases = Object.keys(BASES)
    .filter(code => BASES[code].master)
    .sort((a, b) => BASES[b].slots - BASES[a].slots || BASES[a].mrp - BASES[b].mrp)

  // All slave bases sorted by slots ascending (smallest slave first = fewer units)
  const slaveBases = Object.keys(BASES)
    .filter(code => BASES[code].slave)
    .sort((a, b) => BASES[a].slots - BASES[b].slots || BASES[a].mrp - BASES[b].mrp)

  const results = []

  for (const masterCode of masterBases) {
    const master = BASES[masterCode]

    // Check compat for master
    if (validateCardCompat(masterCode, req) !== null) continue

    // Build master BOM (handles as much IO as possible)
    const masterCfg = buildMiBRX(masterCode, req, dspPref, false)

    // How much IO is still unmet after master?
    // Master covers its on-board IO + slots worth of cards
    // Remaining need = what overflows master slots
    const masterSlotsFull = masterCfg.usedSlots <= master.slots
    if (masterSlotsFull) continue // single unit works — skip (handled elsewhere)

    // Calculate remaining IO after master is maxed out
    const obDI  = resolveOnboardDI(master, req.fi, req.aiV)
    const obRO  = master.ro
    const obFI  = master.fi
    const obAIV = resolveOnboardAI(master, 'V')
    const obAII = resolveOnboardAI(master, 'I')

    // Slots the master can fill
    const masterAvail = master.slots
    // We need to know which IO cards fill the master and what's left for slaves
    // Simplified: calculate remaining after master handles what it can

    const remReq = { ...req }
    // Subtract on-board first
    remReq.di    = Math.max(0, (req.di  || 0) - obDI)
    remReq.ro    = Math.max(0, (req.ro  || 0) - obRO)
    remReq.fi    = Math.max(0, (req.fi  || 0) - obFI)
    remReq.aiV   = Math.max(0, (req.aiV || 0) - obAIV)
    remReq.aiI   = Math.max(0, (req.aiI || 0) - obAII)
    // Subtract what fits in master slots (6 ch DI cards, 4 ch RO cards etc.)
    let masterSlotsUsed = 0
    const subtractCards = (need, ch) => {
      if (need <= 0 || masterSlotsUsed >= masterAvail) return need
      const cardsNeeded = Math.ceil(need / ch)
      const cardsFit    = Math.min(cardsNeeded, masterAvail - masterSlotsUsed)
      masterSlotsUsed  += cardsFit
      return Math.max(0, need - cardsFit * ch)
    }
    remReq.di    = subtractCards(remReq.di,    6)
    remReq.ro    = subtractCards(remReq.ro,    4)
    remReq.to    = subtractCards(remReq.to||0, 4)
    remReq.fi    = subtractCards(remReq.fi,    2)
    remReq.aiV   = subtractCards(remReq.aiV,   2)
    remReq.aiI   = subtractCards(remReq.aiI,   2)
    remReq.aiTC  = subtractCards(remReq.aiTC||0,2)
    remReq.aiRTD = subtractCards(remReq.aiRTD||0,2)
    remReq.aiPTC = subtractCards(remReq.aiPTC||0,2)
    remReq.aiNTC = subtractCards(remReq.aiNTC||0,2)
    remReq.aiLC  = subtractCards(remReq.aiLC||0,2)
    remReq.aoV   = subtractCards(remReq.aoV||0,2)
    remReq.aoI   = subtractCards(remReq.aoI||0,2)

    const hasRemaining = Object.values(remReq).some(v => v > 0)
    if (!hasRemaining) continue // master alone handles it — shouldn't happen here

    // Find slave(s) to cover remaining IO
    // Try single slave first, then two slaves
    for (const slaveCode of slaveBases) {
      if (slaveCode === masterCode) continue
      const slave = BASES[slaveCode]

      // Same PS family preferred
      const masterPS = master.ps
      if (!slave.ps.includes(masterPS.includes('VDC') ? 'VDC' : masterPS.includes('VAC') ? 'VAC' : '')) {
        // Mismatched PS — skip for now (can relax later per BD input)
        // continue  ← commented out so mixed PS is allowed
      }

      // Check if slave + compat can cover remaining
      const slaveCompat = validateCardCompat(slaveCode, remReq)
      if (slaveCompat !== null) continue

      const slaveSlotsNeeded = slotsNeeded(slaveCode, remReq)
      if (slaveSlotsNeeded <= slave.slots) {
        // One slave is enough — build it
        const slaveCfg = buildMiBRX(slaveCode, remReq, 'Any', false)

        // Build slave display (adapter plate)
        const slaveDsp = SLAVE_DISPLAYS[slave.size]

        // Override slave plcItems to replace display with adapter plate
        const slavePlcItems = slaveCfg.plcItems.map(item => {
          // Replace display module with adapter plate
          if (slaveDsp && Object.values(DISPLAYS).find(d => d.code === item.code)) {
            return makeItem(slaveDsp.code, slaveDsp.desc, slaveDsp.hsn, slaveDsp.mrp, 1, 'PLC', 'Slave unit display')
          }
          return item
        })

        // Accessories: expansion cable if 2+ slaves (here 1 slave = direct wire)
        const masterPlcItems = masterCfg.plcItems
        const masterAccItems = masterCfg.accItems

        // Combine
        const allPlcItems = [...masterPlcItems, ...slavePlcItems]
        const allAccItems = [...masterAccItems, ...slaveCfg.accItems]

        // Add slave download cable to accessories
        const slaveAccCode = slave.dlCable === 'AC-USB-RS485-02' ? 'AC-USB-RS485-02' : 'AC-USB-RS485-03'
        const slaveAccDl   = ACC[slave.dlCable === 'AC-USB-RS485-02' ? 'dlMiBRX' : 'dlFlexys']
        if (!allAccItems.find(i => i.code === slaveAccCode)) {
          allAccItems.push(makeItem(slaveAccCode, slaveAccDl.desc, slaveAccDl.hsn, slaveAccDl.mrp, 1, 'Accessories', 'Slave programming cable'))
        }

        const plcTotal = allPlcItems.reduce((s, i) => s + i.total, 0)
        const accTotal = allAccItems.reduce((s, i) => s + i.total, 0)
        const total    = +(plcTotal + accTotal).toFixed(2)

        results.push({
          family:   'MiBRX Multi-Unit',
          code:     masterCode,
          baseCode: masterCode,
          mnt:      master.mnt,
          ps:       master.ps,
          dsp:      dspPref,
          plcItems: allPlcItems,
          accItems: allAccItems,
          plcTotal: +plcTotal.toFixed(2),
          accTotal: +accTotal.toFixed(2),
          total,
          usedSlots:  masterSlotsUsed + slaveSlotsNeeded,
          totalSlots: master.slots + slave.slots,
          unitCount:  2,
          cardCount:  masterSlotsUsed + slaveSlotsNeeded,
          warnings:   [
            `Multi-unit configuration: ${master.size} master + ${slave.size} slave. Direct RS485 wiring required.`,
            ...(slaveCfg.warnings || []),
          ],
          pills: [
            { t: `${master.size} Master`, c: 'blue' },
            { t: `${slave.size} Slave`,   c: 'amber' },
            { t: master.ps, c: 'gray' },
            { t: master.mnt, c: 'gray' },
            { t: '2 Units', c: 'amber' },
          ],
        })
        break // found a working slave — don't try more for this master
      }
    }

    if (results.length >= 3) break // enough candidates
  }

  return results
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
      family: plc.series, code: plc.code, mnt: 'Din Rail', ps: plc.ps,
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
    if (slotsNeeded(code, req) > b.slots) return false
    const compatError = validateCardCompat(code, req)
    if (compatError) return false
    return true
  })

  for (const baseCode of validBases) {
    const b   = BASES[baseCode]
    const cfg = buildMiBRX(baseCode, req, dspPref, false)
    candidates.push({
      family: 'MiBRX', code: baseCode, mnt: b.mnt, ps: b.ps,
      ...cfg,
      pills: [
        { t: `${b.slots} Slots`, c: 'blue' },
        { t: `${cfg.usedSlots}/${b.slots} Slots`, c: cfg.usedSlots > b.slots ? 'amber' : 'green' },
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
  // Only if no ethernet/wifi required (Flexys uses Modbus only)
  // No mix with MiBRX — completely separate family
  if (!req.wifi && !req.eth) {
    const flexysConfigs = [
      { mainSet:'set1', label:'Flexys TX4',   mnt:'Panel',    psLabel: req.ps },
      { mainSet:'set2', label:'Flexys Rail',  mnt:'Din Rail', psLabel: req.ps },
    ]

    for (const fc of flexysConfigs) {
      // Try both power supply options if user hasn't specified
      const psOptions = fc.psLabel && fc.psLabel !== 'Any'
        ? [fc.psLabel]
        : ['90 to 270 VAC', '18 to 32 VDC']

      for (const psOpt of psOptions) {
        const cfg = buildFlexysConfig(fc.mainSet, req, psOpt, null)
        if (!cfg) continue

        if (cfg.tooLarge) {
          // Add a warning to the global warnings list once
          if (!warnings.find(w => w.includes('Flexys'))) {
            warnings.push(
              `Your IO requirement needs ${cfg.slotsNeeded} IO card slots which exceeds the maximum Flexys capacity of ${FLEXYS_MAX_SLOTS} slots. ` +
              `Please contact Selec support at plc1@selec.com for a custom configuration.`
            )
          }
          continue
        }

        const setDef = FLEXYS_SETS[fc.mainSet]
        candidates.push({
          family: fc.label,
          code:   setDef.base.code,
          mnt:    cfg.mnt,
          ps:     psOpt,
          ...cfg,
          pills: [
            { t: fc.label, c: 'purple' },
            { t: `${cfg.usedSlots}/${cfg.totalSlots} Slots`, c: 'blue' },
            { t: psOpt.includes('VDC') ? '24VDC' : '230VAC', c: 'gray' },
            { t: cfg.mnt, c: 'gray' },
            ...(cfg.unitCount > 1 ? [{ t: `${cfg.unitCount} Units`, c: 'amber' }] : []),
          ]
        })
        break // one PS option per mounting is enough
      }
    }

    // Flexys Rail with HMI (if user requested HMI)
    if (req.hmi) {
      const hmiOpt = HMI_OPTIONS[1] // default 4.3" CE
      const cfg = buildFlexysConfig('set2', req, req.ps && req.ps !== 'Any' ? req.ps : '18 to 32 VDC', hmiOpt)
      if (cfg && !cfg.tooLarge) {
        candidates.push({
          family: 'Flexys Rail + HMI',
          code:   FLEXYS_SETS.set2.base.code + '-HMI',
          mnt:    'Din Rail',
          ps:     cfg.ps,
          ...cfg,
          pills: [
            { t: 'Flexys Rail', c: 'purple' },
            { t: 'HMI Panel', c: 'blue' },
            { t: `${cfg.usedSlots}/${cfg.totalSlots} Slots`, c: 'blue' },
            ...(cfg.unitCount > 1 ? [{ t: `${cfg.unitCount} Units`, c: 'amber' }] : []),
          ]
        })
      }
    }
  }

  // ── MiBRX Multi-Unit — triggered only when no single-unit MiBRX configs found ──
  if (candidates.filter(c => c.family === 'MiBRX').length === 0) {
    const multiConfigs = buildMiBRXMultiUnit(req, dspPref)
    candidates.push(...multiConfigs)
    if (multiConfigs.length > 0) {
      warnings.push('No single-unit configuration found for this requirement. Showing multi-unit options.')
    }
  }

  if (candidates.length === 0) {
    warnings.push('No configuration found for this requirement. Please contact plc1@selec.com for support.')
    return { allCandidates: [], warnings }
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
  const sorted     = [...pool].sort((a, b) => a.total - b.total)
  const midCost    = sorted[Math.floor(sorted.length / 2)]?.total || 0

  // Complexity split is relative to the pool — median complexity, not absolute threshold
  const complexities = pool.map(c => complexityScore(c)).sort((a, b) => a - b)
  const midComplex   = complexities[Math.floor(complexities.length / 2)] || 10

  const isLowCost    = c => c.total <= midCost
  const isLowComplex = c => complexityScore(c) <= midComplex

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

  // ── Return all ranked candidates + top 3 default ────────────────────────
  // ResultsStep picks top 3 after applying filters (mount, power, display)
  // This way filtering always re-selects top 3 from the filtered pool

  // Ensure every candidate has a name
  pool.forEach(c => {
    if (!c.name) {
      c.name = `${c.family || ''} – ${(c.code || c.baseCode || '').replace('-ISO','')}`
    }
    if (!c.tagline) {
      c.tagline = buildTagline(c, c.tier || '')
    }
  })

  // Return the full pool (all valid configs) so ResultsStep can filter freely
  // ranked preserves quadrant ordering — pool is the complete set
  ranked.forEach((r, i) => { r._quadrantRank = i + 1 })
  pool.forEach(c => { if (!c._quadrantRank) c._quadrantRank = 99 })
  const allSorted = [...pool].sort((a, b) => (a._quadrantRank - b._quadrantRank) || a.total - b.total)
  return { allCandidates: allSorted, warnings }
}

function buildTagline(cfg, tier) {
  const units = cfg.unitCount === 1 ? 'Single unit' : `${cfg.unitCount} units`
  const cards = cfg.cardCount > 0
    ? `, ${cfg.cardCount} IO slot card${cfg.cardCount > 1 ? 's' : ''}`
    : ', all IO on-board'
  return `${units}${cards} · ${tier}`
}
