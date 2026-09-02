// ─── PRODUCT DATABASE ────────────────────────────────────────────────────────
// Source: Product_Selection_Tool_1.xlsx — FInal Sheet + Product Details
// MRP: FY 2026-27

// ─── BASE MODULES ────────────────────────────────────────────────────────────
// Pin-sharing columns from sheet:
//   di        = on-board DI when neither FI nor AI-V used
//   diFI      = on-board DI remaining when FI is used (no AI-V)
//   diV       = on-board DI remaining when AI-V is used (no FI)
//   diFIV     = on-board DI remaining when both FI and AI-V used
//   aiOnboard = { type: 'V'|'I'|'mixed', count } — type-specific on-board AI
//   fi        = on-board fast input channels
//   ro        = on-board relay outputs
//   ntc       = true if NTC dedicated pin present (never consumes DI)
//   rtc       = true if RTC built-in
//   eth       = true if Ethernet built-in
//   smps      = 'RPS60-24-CE' if 24VDC product needs SMPS
//   dlCable   = download cable part code
//   ps        = aux power supply
//   mnt       = mounting type
//   size      = form factor label

export const BASES = {
  'MIBRX-2M-1-0-0-24VAC': {
    mrp:4753.1, slots:2, di:3, diFI:3, diV:3, diFIV:null,
    fi:0, ro:0, aiOnboard:null, ntc:false, rtc:false, eth:false,
    ps:'18 to 32 VAC', mnt:'Din Rail', size:'2M', hsn:'85371090',
    smps:null, dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 2M Base – 24VAC, 2 Slots, 3DI'
  },
  'MIBRX-2M-1-0-0-24VDC': {
    mrp:4412.1, slots:2, di:3, diFI:1, diV:3, diFIV:1,
    fi:1, ro:0, aiOnboard:{type:'V',count:1}, ntc:false, rtc:false, eth:false,
    ps:'18 to 32 VDC', mnt:'Din Rail', size:'2M', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 2M Base – 24VDC, 2 Slots, 3DI (incl 1FI, 1AI-V)'
  },
  'MIBRX-4M-1-1-1-230V': {
    mrp:7326.0, slots:4, di:5, diFI:3, diV:4, diFIV:2,
    fi:1, ro:0, aiOnboard:{type:'V',count:1}, ntc:true, rtc:true, eth:false,
    ps:'90 to 270 VAC', mnt:'Din Rail', size:'4M', hsn:'85371090',
    smps:null, dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 4M Base – 230VAC, 4 Slots, 5DI (incl 1FI, 1AI-V), NTC, RTC'
  },
  'MIBRX-4M-1-1-1-24VDC': {
    mrp:7990.4, slots:4, di:5, diFI:3, diV:4, diFIV:2,
    fi:1, ro:0, aiOnboard:{type:'V',count:1}, ntc:true, rtc:true, eth:false,
    ps:'18 to 32 VDC', mnt:'Din Rail', size:'4M', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 4M Base – 24VDC, 4 Slots, 5DI (incl 1FI, 1AI-V), NTC, RTC'
  },
  'MIBRX-4M-2-1-1-1-24VDC': {
    mrp:12019.7, slots:4, di:2, diFI:2, diV:2, diFIV:2,
    fi:0, ro:0, aiOnboard:null, ntc:false, rtc:true, eth:true,
    ps:'18 to 32 VDC', mnt:'Din Rail', size:'4M', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 4M Base – Isolated 24VDC, 4 Slots, 2DI, Ethernet+Modbus, RTC'
  },
  'MIBRX-6M-1-1-1-230V': {
    mrp:12589.5, slots:6, di:11, diFI:9, diV:10, diFIV:8,
    fi:1, ro:4, aiOnboard:{type:'V',count:1}, ntc:true, rtc:true, eth:false,
    ps:'90 to 270 VAC', mnt:'Din Rail', size:'6M', hsn:'85371090',
    smps:null, dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 6M Base – 230VAC, 6 Slots, 11DI + 4RO (incl 1FI, 1AI-V), NTC, RTC'
  },
  'MIBRX-6M-3-1-1-0-1-24VDC': {
    mrp:19365.5, slots:6, di:8, diFI:6, diV:8, diFIV:8, // diFIV pending BD verification
    fi:1, ro:0, aiOnboard:null, ntc:false, rtc:true, eth:true,
    ps:'18 to 32 VDC', mnt:'Din Rail', size:'6M', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 6M Base – Isolated 24VDC, 6 Slots, 8DI, Ethernet+Modbus, RTC'
  },
  'MIBRX-48-0-0-230V': {
    mrp:6033.5, slots:2, di:6, diFI:4, diV:5, diFIV:3,
    fi:1, ro:0, aiOnboard:{type:'V',count:1}, ntc:true, rtc:false, eth:false,
    ps:'90 to 270 VAC', mnt:'Panel', size:'48x96', hsn:'85371090',
    smps:null, dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 48×96 Base – 230VAC, 2 Slots, 6DI (incl 1FI, 1AI-V), NTC'
  },
  'MIBRX-48-0-0-24VDC': {
    mrp:6684.7, slots:2, di:7, diFI:5, diV:6, diFIV:4,
    fi:1, ro:0, aiOnboard:{type:'mixed',count:2, detail:{V:2,I:1}}, ntc:true, rtc:false, eth:false,
    ps:'18 to 32 VDC', mnt:'Panel', size:'48x96', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 48×96 Base – 24VDC, 2 Slots, 7DI (incl 1FI, 2AI-V), 1AI-I, NTC'
  },
  'MIBRX-72-0-1-230V': {
    mrp:6814.5, slots:2, di:4, diFI:4, diV:3, diFIV:1,
    fi:0, ro:3, aiOnboard:{type:'V',count:1}, ntc:true, rtc:true, eth:false,
    ps:'90 to 270 VAC', mnt:'Panel', size:'72x72', hsn:'85371090',
    smps:null, dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 72×72 Base – 230VAC, 2 Slots, 4DI + 3RO (incl 1AI-V), NTC, RTC'
  },
  'MIBRX-72-0-1-24VDC': {
    mrp:9025.5, slots:2, di:4, diFI:2, diV:3, diFIV:1,
    fi:1, ro:4, aiOnboard:{type:'mixed',count:2, detail:{V:1,I:1}}, ntc:true, rtc:true, eth:false,
    ps:'18 to 32 VDC', mnt:'Panel', size:'72x72', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 72×72 Base – 24VDC, 2 Slots, 4DI + 4RO (incl 1FI, 1AI-V), 1AI-I, NTC, RTC'
  },
  'MIBRX-96-1-1-230V': {
    mrp:8290.7, slots:6, di:4, diFI:2, diV:3, diFIV:1,
    fi:1, ro:0, aiOnboard:{type:'V',count:1}, ntc:true, rtc:true, eth:false,
    ps:'90 to 270 VAC', mnt:'Panel', size:'96x96', hsn:'85371090',
    smps:null, dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 96×96 Base – 230VAC, 6 Slots, 4DI (incl 1FI, 1AI-V), NTC, RTC'
  },
  'MIBRX-96-1-1-24VDC': {
    mrp:9474.3, slots:6, di:6, diFI:4, diV:5, diFIV:3,
    fi:1, ro:0, aiOnboard:{type:'mixed',count:2, detail:{V:1,I:1}}, ntc:true, rtc:true, eth:false,
    ps:'18 to 32 VDC', mnt:'Panel', size:'96x96', hsn:'85371090',
    smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02',
    desc:'MiBRX 96×96 Base – 24VDC, 6 Slots, 6DI (incl 1FI, 1AI-V), 1AI-I, NTC, RTC'
  },
}

// ─── DISPLAY MODULES ─────────────────────────────────────────────────────────
// Keyed by size + display type for engine lookup
export const DISPLAYS = {
  '2M-Blind':       { code:'MIBRX-DSP-2M-0-1-06-A',    mrp:594.0,   hsn:'85389000', desc:'MiBRX Display 2M – Blind, 6 LED',           dspType:'Blind' },
  '2M-7Seg':        { code:'MIBRX-DSP-2M-7-1-04-A',    mrp:965.8,   hsn:'85389000', desc:'MiBRX Display 2M – 7-Segment (4 digit)',     dspType:'7 Segment LED' },
  '4M-Blind':       { code:'MIBRX-DSP-4M-0-1-06-A',    mrp:839.3,   hsn:'85389000', desc:'MiBRX Display 4M – Blind, 6 LED',           dspType:'Blind' },
  '4M-LCD':         { code:'MIBRX-DSP-4M-8-2-08-A',    mrp:1978.9,  hsn:'85389000', desc:'MiBRX Display 4M – LCD Text (8×2)',          dspType:'LCD Text' },
  '6M-LCD':         { code:'MIBRX-DSP-6M-8-2-08-A',    mrp:2217.6,  hsn:'85389000', desc:'MiBRX Display 6M – LCD Text (8×2)',          dspType:'LCD Text' },
  '6M-Adapter':     { code:'MIBRX-DSP-AP-6M',           mrp:960.3,   hsn:'85389000', desc:'MiBRX 6M Adapter Plate',                     dspType:'Blind' },
  '48x96-7Seg':     { code:'MIBRX-DSP-48-7-2-11-A',    mrp:2249.5,  hsn:'85389000', desc:'MiBRX Display 48×96 – 7-Seg, Bar Graph',    dspType:'7 Segment LED' },
  '72x72-7Seg':     { code:'MIBRX-DSP-72-7-2-10-B',    mrp:2016.3,  hsn:'85389000', desc:'MiBRX Display 72×72 – 7-Segment',           dspType:'7 Segment LED' },
  '72x72-LCD':      { code:'MIBRX-DSP-72-8-2-08-B',    mrp:2194.5,  hsn:'85389000', desc:'MiBRX Display 72×72 – LCD Text (8×2)',      dspType:'LCD Text' },
  '96x96-LCD16x4':  { code:'MIBRX-DSP-96-8-4-16-B',    mrp:3923.7,  hsn:'85389000', desc:'MiBRX Display 96×96 – LCD Text (16×4)',     dspType:'LCD Text' },
  '96x96-LCD16x2':  { code:'MIBRX-DSP-96-8-2-16-B',    mrp:2589.4,  hsn:'85389000', desc:'MiBRX Display 96×96 – LCD Text (16×2)',     dspType:'LCD Text' },
  '96x96-Graphic':  { code:'MIBRX-DSP-IND-96-8-0-00-C',mrp:11815.1, hsn:'85389000', desc:'MiBRX Independent Display 96×96 – 3.5" Touch',dspType:'3.5 Inch HMI' },
}

// Display options per base size — ordered by preference (LCD > 7Seg > Blind)
export const DISPLAY_OPTIONS = {
  '2M':    ['2M-LCD', '2M-7Seg', '2M-Blind'],   // 2M has no LCD, engine falls back
  '4M':    ['4M-LCD', '4M-Blind'],
  '6M':    ['6M-LCD', '6M-Adapter'],
  '48x96': ['48x96-7Seg'],
  '72x72': ['72x72-LCD', '72x72-7Seg'],
  '96x96': ['96x96-LCD16x4', '96x96-LCD16x2', '96x96-Graphic'],
}

// Map display preference label → dspType keys
export const DSP_PREF_MAP = {
  'Blind':         ['Blind'],
  '7 Segment LED': ['7 Segment LED'],
  'LCD Text':      ['LCD Text'],
  '3.5 Inch HMI':  ['3.5 Inch HMI'],
  'Any':           ['LCD Text', '7 Segment LED', 'Blind', '3.5 Inch HMI'],
}

// ─── MiBRX IO SLOT CARDS ─────────────────────────────────────────────────────
// Standard cards (engine default — best value non-isolated)
// Combo cards included — engine tries these first when they reduce slots+cost
export const IOCARDS = {
  di:    [
    { code:'MIBRX-SC-DI06',    ch:6, mrp:496.1,  hsn:'85389000', desc:'6 Digital Inputs' },
    { code:'MIBRX-SC-DI04',    ch:4, mrp:392.7,  hsn:'85389000', desc:'4 Digital Inputs' },
  ],
  ro:    [
    { code:'MIBRX-SC-RO04',    ch:4, mrp:1725.9, hsn:'85389000', desc:'4 Relay Outputs' },
    { code:'MIBRX-SC-RO03',    ch:3, mrp:859.1,  hsn:'85389000', desc:'3 Relay Outputs' },
    { code:'MIBRX-SC-RO05',    ch:5, mrp:2236.3, hsn:'85389000', desc:'5 Relay Outputs (1.5A)' },
  ],
  to:    [
    { code:'MIBRX-SC-TO04',    ch:4, mrp:1017.5, hsn:'85389000', desc:'4 Transistor Outputs' },
  ],
  fi:    [
    { code:'MIBRX-SC-FI02',    ch:2, mrp:1216.6, hsn:'85389000', desc:'2 Fast Inputs (10KHz)' },
  ],
  aiV:   [
    { code:'MIBRX-SC-AI02-V',  ch:2, mrp:698.5,  hsn:'85389000', desc:'2 AI Voltage' },
    { code:'MIBRX-SC-AI02-V-ISO',ch:2,mrp:4255.9,hsn:'85389000', desc:'2 AI Voltage (Isolated)' },
  ],
  aiI:   [
    { code:'MIBRX-SC-AI02-I',  ch:2, mrp:678.7,  hsn:'85389000', desc:'2 AI Current' },
    { code:'MIBRX-SC-AI02-I-ISO',ch:2,mrp:4281.2,hsn:'85389000', desc:'2 AI Current (Isolated)' },
  ],
  aiTC:  [
    { code:'MIBRX-SC-AI02-TC', ch:2, mrp:983.4,  hsn:'85389000', desc:'2 AI Thermocouple' },
    { code:'MIBRX-SC-AI02-TC-ISO',ch:2,mrp:4232.8,hsn:'85389000',desc:'2 AI Thermocouple (Isolated)' },
  ],
  aiRTD: [
    { code:'MIBRX-SC-AI02-RTD',ch:2, mrp:966.9,  hsn:'85389000', desc:'2 AI RTD' },
    { code:'MIBRX-SC-AI02-RTD-ISO',ch:2,mrp:4283.4,hsn:'85389000',desc:'2 AI RTD (Isolated)' },
  ],
  aiPTC: [{ code:'MIBRX-SC-AI02-PTC',ch:2,mrp:805.2, hsn:'85389000', desc:'2 AI PTC' }],
  aiNTC: [{ code:'MIBRX-SC-AI02-NTC',ch:2,mrp:805.2, hsn:'85389000', desc:'2 AI NTC' }],
  aiLC:  [{ code:'MIBRX-SC-LC02',    ch:2,mrp:4446.2,hsn:'85389000', desc:'2 AI Load Cell (24-bit)' }],
  aoV:   [{ code:'MIBRX-SC-AO02-V-ISO',ch:2,mrp:4140.4,hsn:'85389000',desc:'2 AO Voltage (Isolated)' }],
  aoI:   [{ code:'MIBRX-SC-AO02-I-ISO',ch:2,mrp:3646.5,hsn:'85389000',desc:'2 AO Current (Isolated)' }],
}

// Combo cards — each saves a slot vs separate cards; engine tries these first
// Format: { code, mrp, hsn, desc, provides: {di?, ro?, to?, aiTC?, aiRTD?} }
export const COMBO_CARDS = [
  { code:'MIBRX-SC-DI02-RO03', mrp:1172.6, hsn:'85389000', desc:'2 DI + 3 Relay Outputs',          provides:{di:2, ro:3} },
  { code:'MIBRX-SC-DI02-TO02', mrp:654.5,  hsn:'85389000', desc:'2 DI + 2 Transistor Outputs',      provides:{di:2, to:2} },
  { code:'MIBRX-SC-DI02-AI01-T',mrp:806.3, hsn:'85389000', desc:'2 DI + 1 AI TC/RTD',              provides:{di:2, aiTC:1} },
]

// ─── FLEXYS FAMILY ───────────────────────────────────────────────────────────
// Three sub-families. Each needs: base + logic card + PS card + IO cards
// All Flexys use AC-USB-RS485-03 for downloading, RPS60-24-CE for 24VDC PS cards

export const FLEXYS = {
  rail: {
    label: 'Flexys Rail',
    mnt: 'Din Rail',
    base:    { code:'FL-RL-BS-6-CE-RoHS',          mrp:3066.8,  hsn:'85371090', desc:'Flexys Rail – Base Card (4 slots)' },
    logicCard:{ code:'FL-RL-LG-1-0-1-V2-CE-RoHS',  mrp:11708.4, hsn:'85371090', desc:'Flexys Rail – Logic Card, RTC, Modbus' },
    psOptions:[
      { code:'FL-RL-PS-230V',           mrp:2897.4, hsn:'85389000', desc:'Flexys Rail PS – 230VAC, 0 DI',  ps:'90 to 270 VAC', di:0 },
      { code:'FL-RL-DI04-PS-24V-CE-RoHS',mrp:2913.7,hsn:'85389000', desc:'Flexys Rail PS – 24VDC, 4 DI',  ps:'18 to 32 VDC',  di:4, smps:'RPS60-24-CE' },
    ],
    maxSlots: 4,
    dlCable: 'AC-USB-RS485-03',
  },
  graphic: {
    label: 'Flexys Graphic',
    mnt: 'Panel',
    base:    { code:'FL-GT35-DSP-V2',              mrp:15906.0, hsn:'85389000', desc:'Flexys Graphic – 3.5" Touch Display Base (3 slots)' },
    logicCard:{ code:'FL-GT35-LG-1-0-1-V2',        mrp:7987.1,  hsn:'85389000', desc:'Flexys Graphic – Logic Card, RTC, Modbus' },
    psOptions:[
      { code:'FL-GT35-DI04-PS-230V-CE-RoHS',mrp:4678.3,hsn:'85389000',desc:'Flexys Graphic PS – 230VAC, 4 DI', ps:'90 to 270 VAC', di:4 },
      { code:'FL-GT35-DI04-PS-24V-CE-RoHS', mrp:5073.2,hsn:'85389000',desc:'Flexys Graphic PS – 24VDC, 4 DI',  ps:'18 to 32 VDC',  di:4, smps:'RPS60-24-CE' },
    ],
    maxSlots: 3,
    dlCable: 'AC-USB-RS485-03',
  },
  tx4: {
    label: 'Flexys TX4',
    mnt: 'Panel',
    base:    { code:'FL-TX4-LG-1-0-1-V2-CE-RoHS',  mrp:17560.4, hsn:'85371090', desc:'Flexys TX4 – Logic Card Base, RTC, Modbus (4 slots)' },
    logicCard: null,
    psOptions:[
      { code:'FL-TX4-DI04-PS-230V-CE-RoHS',mrp:4219.6,hsn:'85389000',desc:'Flexys TX4 PS – 230VAC, 4 DI', ps:'90 to 270 VAC', di:4 },
      { code:'FL-TX4-DI04-PS-24V-CE-RoHS', mrp:3908.3,hsn:'85389000',desc:'Flexys TX4 PS – 24VDC, 4 DI',  ps:'18 to 32 VDC',  di:4, smps:'RPS60-24-CE' },
    ],
    maxSlots: 4,
    dlCable: 'AC-USB-RS485-03',
  },
}

// Flexys IO cards — 1 card = 1 slot, max 4 slots per base (8 with expansion)
export const FLEXYS_IOCARDS = {
  di:    [
    { code:'FL-SC-DI14-CE-RoHS',   ch:14, mrp:4136.0, hsn:'85389000', desc:'Flexys IO – 14 DI' },
    { code:'FL-SC-DI10-CE-RoHS',   ch:10, mrp:2956.8, hsn:'85389000', desc:'Flexys IO – 10 DI' },
    { code:'FL-SC-DI04-RO04-CE-RoHS',ch:4,mrp:3957.8, hsn:'85389000', desc:'Flexys IO – 4 DI + 4 RO (combo)', ro:4 },
  ],
  ro:    [
    { code:'FL-SC-RO08-CE-RoHS',   ch:8, mrp:4914.8,  hsn:'85389000', desc:'Flexys IO – 8 Relay Outputs' },
    { code:'FL-SC-RO06-12V',       ch:6, mrp:4915.0,  hsn:'85389000', desc:'Flexys IO – 6 Relay Outputs (12V)' },
  ],
  to:    [{ code:'FL-SC-TO08-CE-RoHS',  ch:8, mrp:3005.2, hsn:'85389000', desc:'Flexys IO – 8 Transistor Outputs' }],
  aiV:   [
    { code:'FL-SC-AI06-V-CE-RoHS', ch:6, mrp:2313.3,  hsn:'85389000', desc:'Flexys IO – 6 AI Voltage' },
    { code:'FL-SC-AI06-V/I',       ch:6, mrp:7737.4,  hsn:'85389000', desc:'Flexys IO – 6 AI Voltage/Current' },
  ],
  aiI:   [{ code:'FL-SC-AI06-I-CE-RoHS',ch:6,mrp:2550.9, hsn:'85389000', desc:'Flexys IO – 6 AI Current' }],
  aiTC:  [{ code:'FL-SC-AI04-TC-CE-RoHS',ch:4,mrp:4423.6,hsn:'85389000', desc:'Flexys IO – 4 AI Thermocouple' }],
  aiRTD: [{ code:'FL-SC-AI04-RTD-CE-RoHS',ch:4,mrp:4610.1,hsn:'85389000',desc:'Flexys IO – 4 AI RTD' }],
  aiLC:  [{ code:'FL-SC-LC04',          ch:4, mrp:21820.7,hsn:'85389000', desc:'Flexys IO – 4 Load Cell (24-bit)' }],
  aoV:   [{ code:'FL-SC-AO04-V-CE-RoHS',ch:4,mrp:9007.9, hsn:'85389000', desc:'Flexys IO – 4 AO Voltage' }],
  aoI:   [{ code:'FL-SC-AO04-I-CE-RoHS',ch:4,mrp:9003.5, hsn:'85389000', desc:'Flexys IO – 4 AO Current' }],
  aiNTC: [{ code:'FL-SC-AI03-NTC-AI03-I',ch:3,mrp:3867.6,hsn:'85389000', desc:'Flexys IO – 3 AI NTC + 3 AI Current' }],
}

// ─── FIXED IO PLCs ───────────────────────────────────────────────────────────
export const FIXED_PLCS = [
  {
    code:'DIGIX-1-230V-CE-RoHS', mrp:10678.8, series:'DIGIX', ps:'90 to 270 VAC',
    di:8, ro:5, to:0, fi:1, diFI:6, aiOnboard:null, aiV:0, aiI:0, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:null, dlCable:'AC-USB-RS485-02', hsn:'85371090',
    desc:'8DI · 5RO · 230VAC'
  },
  {
    code:'DIGIX-1-0-0-24VDC-CE-RoHS', mrp:10759.1, series:'DIGIX', ps:'18 to 32 VDC',
    di:8, ro:5, to:0, fi:1, diFI:6, aiOnboard:null, aiV:0, aiI:0, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02', hsn:'85371090',
    desc:'8DI · 5RO · 24VDC'
  },
  {
    code:'TWIX-1-230V', mrp:8421.6, series:'TWIX', ps:'90 to 270 VAC',
    di:6, ro:4, to:0, fi:1, diFI:4, aiOnboard:{type:'TC',count:1}, aiV:0, aiI:0, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:null, dlCable:'AC-USB-RS485-03', hsn:'85371090',
    desc:'6DI · 4RO · 1AI (TC/RTD) · 230VAC'
  },
  {
    code:'TWIX-1-24VDC', mrp:9887.9, series:'TWIX', ps:'18 to 32 VDC',
    di:6, ro:4, to:0, fi:1, diFI:4, aiOnboard:{type:'TC',count:1}, aiV:0, aiI:0, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-03', hsn:'85371090',
    desc:'6DI · 4RO · 1AI (TC/RTD) · 24VDC'
  },
  {
    code:'TWIX-2-230V', mrp:13835.8, series:'TWIX', ps:'90 to 270 VAC',
    di:6, ro:5, to:0, fi:1, diFI:4, aiOnboard:{type:'mixed',count:6}, aiV:2, aiI:2, aiTC:2, aiRTD:2, aiPTC:0, aiNTC:0, aiLC:0, aoV:1, aoI:1,
    eth:false, smps:null, dlCable:'AC-USB-RS485-02', hsn:'85371090',
    desc:'6DI · 5RO · 6AI · 1AO · 230VAC'
  },
  {
    code:'TWIX-2-24V-CU-ROHS', mrp:14586.0, series:'TWIX', ps:'18 to 32 VDC',
    di:6, ro:5, to:0, fi:1, diFI:4, aiOnboard:{type:'mixed',count:6}, aiV:2, aiI:2, aiTC:2, aiRTD:2, aiPTC:0, aiNTC:0, aiLC:0, aoV:1, aoI:1,
    eth:false, smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-02', hsn:'85371090',
    desc:'6DI · 5RO · 6AI · 1AO · 24VDC'
  },
  {
    code:'TWIX-3-24VDC', mrp:10250.9, series:'TWIX', ps:'18 to 32 VDC',
    di:8, ro:0, to:6, fi:1, diFI:6, aiOnboard:{type:'TC',count:1}, aiV:0, aiI:0, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-03', hsn:'85371090',
    desc:'8DI · 6DO · 1AI (TC/RTD) · 24VDC'
  },
  {
    code:'MM3032-2-0-0-230V V2', mrp:15226.2, series:'MM303X', ps:'90 to 270 VAC',
    di:8, ro:6, to:0, fi:1, diFI:6, aiOnboard:{type:'mixed',count:2}, aiV:2, aiI:2, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:1, aoI:0,
    eth:false, smps:null, dlCable:'AC-USB-RS485-03', hsn:'85371090',
    desc:'8DI · 6RO · 2AI (V/I) · 1AO · 230VAC'
  },
  {
    code:'MM3032-2-0-0-24V V2', mrp:16710.1, series:'MM303X', ps:'18 to 32 VDC',
    di:8, ro:6, to:0, fi:1, diFI:6, aiOnboard:{type:'mixed',count:2}, aiV:1, aiI:1, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:1, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-03', hsn:'85371090',
    desc:'8DI · 6RO · 1AI (V/I) · NTC · 24VDC'
  },
  {
    code:'MM3030-4-V2', mrp:23366.2, series:'MM303X', ps:'18 to 32 VDC',
    di:10, ro:0, to:8, fi:2, diFI:6, aiOnboard:{type:'mixed',count:2}, aiV:2, aiI:2, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:true, smps:'RPS60-24-CE', dlCable:'AC-USB-RS485-03', hsn:'85371090',
    desc:'10DI · 8DO · 2AI (V/I) · Ethernet · 24VDC'
  },
  {
    code:'UNIX-1-230V', mrp:7607.6, series:'TWIX', ps:'90 to 270 VAC',
    di:3, ro:2, to:2, fi:1, diFI:2, aiOnboard:{type:'mixed',count:3}, aiV:1, aiI:1, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0,
    eth:false, smps:null, dlCable:'AC-USB-RS485-02', hsn:'85371090',
    desc:'3DI · 2RO · 2TO · 3AI (TC/RTD, I, V) · 230VAC'
  },
]

// ─── HMI ─────────────────────────────────────────────────────────────────────
export const HMI_OPTIONS = [
  { code:'SP115-GT43-S1',    mrp:12728.0,  size:'4.3"',  eth:false, desc:'4.3" HMI – No Ethernet',             dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP112-GT40-S1-CE', mrp:16809.0,  size:'4.3"',  eth:false, desc:'4.3" HMI – No Ethernet (CE)',         dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP112-GT40-ET1-CE',mrp:20311.0,  size:'4.3"',  eth:true,  desc:'4.3" HMI – With Ethernet',            dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP115-GT70-S1',    mrp:15274.0,  size:'7"',    eth:false, desc:'7" HMI – No Ethernet',                dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP112-GT70-S1-CE', mrp:18560.0,  size:'7"',    eth:false, desc:'7" HMI – No Ethernet (CE)',            dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP112-GT70-ET1-CE',mrp:24998.0,  size:'7"',    eth:true,  desc:'7" HMI – With Ethernet',              dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP112-GT100-ET1-CE',mrp:40232.0, size:'10.1"', eth:true,  desc:'10.1" HMI – With Ethernet',           dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
  { code:'SP115-GT156-ET',   mrp:118584.0, size:'15.6"', eth:true,  desc:'15.6" HMI – With Ethernet',           dlCable:'ACH-002-CE-RoHS', smps:'RPS60-24-CE' },
]

// ─── ACCESSORIES ─────────────────────────────────────────────────────────────
export const ACC = {
  smps:      { code:'RPS60-24-CE',       mrp:2450.0,  hsn:'85044090', desc:'60W 24V/2.5A DIN Rail SMPS – CE Certified' },
  dlMiBRX:   { code:'AC-USB-RS485-02',   mrp:4195.4,  hsn:'84715000', desc:'Download Cable – USB to RS485 (2 wire) for MiBRX' },
  dlFlexys:  { code:'AC-USB-RS485-03',   mrp:4195.4,  hsn:'84715000', desc:'Download Cable – USB to RS485 (RJ25) for Flexys/TWIX/MM303X' },
  expCable:  { code:'ACH-004-CE-RoHS',   mrp:578.6,   hsn:'85444299', desc:'Expansion Cable – RJ25 to RJ25 (6Pin)' },
  hmiCable:  { code:'ACH-002-CE-RoHS',   mrp:784.3,   hsn:'85444299', desc:'Download/Comm Cable – 9-Pin D-Type to RJ25 (6Pin)' },
  commCable: { code:'ACH-001-CE-RoHS',   mrp:861.3,   hsn:'85444299', desc:'Communication Cable – 9-Pin to 9-Pin D-Type' },
}
