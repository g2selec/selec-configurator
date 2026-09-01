// ─── BASE MODULES ────────────────────────────────────────────────────────────
// on-board IO extracted from ODS descriptions
export const BASES = {
  'MIBRX-2M-1-0-0-24VAC':    { mrp:4753.1,  slots:2, di:3, fi:0, ro:0, to:0, aiV:0, aiI:0, ntc:0, rtc:false, eth:false, ps:'24VAC',  mnt:'Din Rail', size:'2M',    hsn:'85371090' },
  'MIBRX-2M-1-0-0-24VDC':    { mrp:4412.1,  slots:2, di:3, fi:1, ro:0, to:0, aiV:0, aiI:0, ntc:0, rtc:false, eth:false, ps:'24VDC',  mnt:'Din Rail', size:'2M',    hsn:'85371090' },
  'MIBRX-4M-1-1-1-230V':     { mrp:7326.0,  slots:4, di:5, fi:1, ro:0, to:0, aiV:1, aiI:0, ntc:1, rtc:true,  eth:false, ps:'230VAC', mnt:'Din Rail', size:'4M',    hsn:'85371090' },
  'MIBRX-4M-1-1-1-24VDC':    { mrp:7990.4,  slots:4, di:5, fi:1, ro:0, to:0, aiV:1, aiI:0, ntc:1, rtc:true,  eth:false, ps:'24VDC',  mnt:'Din Rail', size:'4M',    hsn:'85371090' },
  'MIBRX-4M-2-1-1-1-24VDC':  { mrp:12019.7, slots:4, di:2, fi:0, ro:0, to:0, aiV:0, aiI:0, ntc:0, rtc:true,  eth:true,  ps:'24VDC',  mnt:'Din Rail', size:'4M',    hsn:'85371090' },
  'MIBRX-6M-1-1-1-230V':     { mrp:12589.5, slots:6, di:11,fi:1, ro:4, to:0, aiV:1, aiI:0, ntc:1, rtc:true,  eth:false, ps:'230VAC', mnt:'Din Rail', size:'6M',    hsn:'85371090' },
  'MIBRX-6M-3-1-1-0-1-24VDC':{ mrp:19365.5, slots:6, di:8,  fi:0, ro:0, to:0, aiV:0, aiI:0, ntc:0, rtc:true,  eth:true,  ps:'24VDC',  mnt:'Din Rail', size:'6M',    hsn:'85371090' },
  'MIBRX-6M-2-1-1-0-1-24VDC':{ mrp:18250.0, slots:6, di:12, fi:0, ro:0, to:0, aiV:0, aiI:0, ntc:0, rtc:true,  eth:true,  ps:'24VDC',  mnt:'Din Rail', size:'6M',    hsn:'85371090' },
  'MIBRX-48-0-0-230V':        { mrp:6033.5,  slots:2, di:6, fi:1, ro:0, to:0, aiV:1, aiI:0, ntc:1, rtc:false, eth:false, ps:'230VAC', mnt:'Panel',    size:'48x96', hsn:'85371090' },
  'MIBRX-48-0-0-24VDC':       { mrp:6684.7,  slots:2, di:7, fi:1, ro:0, to:0, aiV:2, aiI:1, ntc:1, rtc:false, eth:false, ps:'24VDC',  mnt:'Panel',    size:'48x96', hsn:'85371090' },
  'MIBRX-72-0-1-230V':        { mrp:6814.5,  slots:2, di:4, fi:1, ro:3, to:0, aiV:1, aiI:0, ntc:1, rtc:true,  eth:false, ps:'230VAC', mnt:'Panel',    size:'72x72', hsn:'85371090' },
  'MIBRX-72-0-1-24VDC':       { mrp:9025.5,  slots:2, di:4, fi:1, ro:4, to:0, aiV:1, aiI:1, ntc:1, rtc:true,  eth:false, ps:'24VDC',  mnt:'Panel',    size:'72x72', hsn:'85371090' },
  'MIBRX-96-1-1-230V':        { mrp:8290.7,  slots:6, di:4, fi:1, ro:0, to:0, aiV:1, aiI:0, ntc:1, rtc:true,  eth:false, ps:'230VAC', mnt:'Panel',    size:'96x96', hsn:'85371090' },
  'MIBRX-96-1-1-24VDC':       { mrp:9474.3,  slots:6, di:6, fi:1, ro:0, to:0, aiV:1, aiI:1, ntc:1, rtc:true,  eth:false, ps:'24VDC',  mnt:'Panel',    size:'96x96', hsn:'85371090' },
}

// ─── DISPLAY MODULES ─────────────────────────────────────────────────────────
export const DISPLAYS = {
  '2M-Blind':      { code:'MIBRX-DSP-2M-0-1-06-A',     mrp:594.0,   hsn:'85389000', desc:'Blind, 6 LED' },
  '2M-7Seg':       { code:'MIBRX-DSP-2M-7-1-04-A',     mrp:965.8,   hsn:'85389000', desc:'7-Segment, 6 LED' },
  '4M-Blind':      { code:'MIBRX-DSP-4M-0-1-06-A',     mrp:839.3,   hsn:'85389000', desc:'Blind, 6 LED' },
  '4M-LCD':        { code:'MIBRX-DSP-4M-8-2-08-A',     mrp:1978.9,  hsn:'85389000', desc:'LCD Text 8×2' },
  '6M-LCD':        { code:'MIBRX-DSP-6M-8-2-08-A',     mrp:2217.6,  hsn:'85389000', desc:'LCD Text 8×2' },
  '6M-Adapter':    { code:'MIBRX-DSP-AP-6M',            mrp:960.3,   hsn:'85389000', desc:'Adapter Plate' },
  '48x96-7Seg':    { code:'MIBRX-DSP-48-7-2-11-A',     mrp:2249.5,  hsn:'85389000', desc:'7-Seg, Bar Graph, 6 LED' },
  '72x72-7Seg':    { code:'MIBRX-DSP-72-7-2-10-B',     mrp:2016.3,  hsn:'85389000', desc:'7-Segment, 4 LED' },
  '72x72-LCD':     { code:'MIBRX-DSP-72-8-2-08-B',     mrp:2194.5,  hsn:'85389000', desc:'LCD Text 8×2' },
  '96x96-LCD16x4': { code:'MIBRX-DSP-96-8-4-16-B',     mrp:3923.7,  hsn:'85389000', desc:'LCD Text 16×4' },
  '96x96-LCD16x2': { code:'MIBRX-DSP-96-8-2-16-B',     mrp:2589.4,  hsn:'85389000', desc:'LCD Text 16×2' },
  'Ind-3.5Touch':  { code:'MIBRX-DSP-IND-96-8-0-00-C', mrp:11815.1, hsn:'85389000', desc:'3.5" Graphic Touch' },
}

// ─── IO SLOT CARDS ───────────────────────────────────────────────────────────
export const IOCARDS = {
  di:    [{ code:'MIBRX-SC-DI06',       ch:6, mrp:496.1,  hsn:'85389000', desc:'6 Digital Inputs' },
          { code:'MIBRX-SC-DI04',       ch:4, mrp:392.7,  hsn:'85389000', desc:'4 Digital Inputs' }],
  ro:    [{ code:'MIBRX-SC-RO04',       ch:4, mrp:1725.9, hsn:'85389000', desc:'4 Relay Outputs' },
          { code:'MIBRX-SC-RO03',       ch:3, mrp:859.1,  hsn:'85389000', desc:'3 Relay Outputs' }],
  to:    [{ code:'MIBRX-SC-TO04',       ch:4, mrp:1017.5, hsn:'85389000', desc:'4 Transistor Outputs' }],
  fi:    [{ code:'MIBRX-SC-FI02',       ch:2, mrp:1216.6, hsn:'85389000', desc:'2 Fast Inputs (10KHz)' }],
  aiV:   [{ code:'MIBRX-SC-AI02-V',     ch:2, mrp:698.5,  hsn:'85389000', desc:'2 AI Voltage' },
          { code:'MIBRX-SC-AI02-V-ISO', ch:2, mrp:4255.9, hsn:'85389000', desc:'2 AI Voltage (Isolated)' }],
  aiI:   [{ code:'MIBRX-SC-AI02-I',     ch:2, mrp:678.7,  hsn:'85389000', desc:'2 AI Current' },
          { code:'MIBRX-SC-AI02-I-ISO', ch:2, mrp:4281.2, hsn:'85389000', desc:'2 AI Current (Isolated)' }],
  aiTC:  [{ code:'MIBRX-SC-AI02-TC',    ch:2, mrp:983.4,  hsn:'85389000', desc:'2 AI Thermocouple' },
          { code:'MIBRX-SC-AI02-TC-ISO',ch:2, mrp:4232.8, hsn:'85389000', desc:'2 AI Thermocouple (Isolated)' }],
  aiPTC: [{ code:'MIBRX-SC-AI02-PTC',   ch:2, mrp:805.2,  hsn:'85389000', desc:'2 AI PTC' }],
  aiNTC: [{ code:'MIBRX-SC-AI02-NTC',   ch:2, mrp:805.2,  hsn:'85389000', desc:'2 AI NTC' }],
  aiRTD: [{ code:'MIBRX-SC-AI02-RTD',   ch:2, mrp:966.9,  hsn:'85389000', desc:'2 AI RTD' },
          { code:'MIBRX-SC-AI02-RTD-ISO',ch:2,mrp:4283.4, hsn:'85389000', desc:'2 AI RTD (Isolated)' }],
  aiLC:  [{ code:'MIBRX-SC-LC02',        ch:2, mrp:4446.2, hsn:'85389000', desc:'2 Load Cell (24-bit)' }],
  aoV:   [{ code:'MIBRX-SC-AO02-V-ISO', ch:2, mrp:4140.4, hsn:'85389000', desc:'2 AO Voltage (Isolated)' }],
  aoI:   [{ code:'MIBRX-SC-AO02-I-ISO', ch:2, mrp:3646.5, hsn:'85389000', desc:'2 AO Current (Isolated)' }],
}

// ─── FIXED IO PLCs ───────────────────────────────────────────────────────────
export const FIXED_PLCS = [
  { code:'DIGIX-1-230V-CE-RoHS',    mrp:10678.8, series:'DIGIX',  ps:'230VAC', di:8,  ro:5, to:0, fi:0, aiV:0, aiI:0, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0, eth:false, desc:'8DI · 5RO' },
  { code:'DIGIX-1-0-0-24VDC-CE-RoHS',mrp:10759.1,series:'DIGIX',  ps:'24VDC',  di:8,  ro:5, to:0, fi:0, aiV:0, aiI:0, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0, eth:false, desc:'8DI · 5RO' },
  { code:'TWIX-1-230V',              mrp:8421.6,  series:'TWIX',   ps:'230VAC', di:6,  ro:4, to:0, fi:0, aiV:0, aiI:0, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0, eth:false, desc:'6DI · 4RO · 1AI TC/RTD' },
  { code:'TWIX-1-24VDC',             mrp:9887.9,  series:'TWIX',   ps:'24VDC',  di:6,  ro:4, to:0, fi:0, aiV:0, aiI:0, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0, eth:false, desc:'6DI · 4RO · 1AI TC/RTD' },
  { code:'TWIX-2-230V',              mrp:13835.8, series:'TWIX',   ps:'230VAC', di:6,  ro:5, to:0, fi:0, aiV:2, aiI:2, aiTC:2, aiRTD:2, aiPTC:0, aiNTC:0, aiLC:0, aoV:1, aoI:1, eth:false, desc:'6DI · 5RO · 6AI · 1AO' },
  { code:'TWIX-2-24V-CU-ROHS',       mrp:14586.0, series:'TWIX',   ps:'24VDC',  di:6,  ro:5, to:0, fi:0, aiV:2, aiI:2, aiTC:2, aiRTD:2, aiPTC:0, aiNTC:0, aiLC:0, aoV:1, aoI:1, eth:false, desc:'6DI · 5RO · 6AI · 1AO' },
  { code:'TWIX-3-24VDC',             mrp:10250.9, series:'TWIX',   ps:'24VDC',  di:8,  ro:0, to:6, fi:0, aiV:0, aiI:0, aiTC:1, aiRTD:1, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0, eth:false, desc:'8DI · 6DO · 1AI TC/RTD' },
  { code:'MM3032-2-0-0-230V V2',     mrp:15226.2, series:'MM303X', ps:'230VAC', di:8,  ro:6, to:0, fi:1, aiV:2, aiI:2, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:1, aoI:0, eth:false, desc:'8DI · 6RO · 2AI · 1AO' },
  { code:'MM3032-2-0-0-24V V2',      mrp:16710.1, series:'MM303X', ps:'24VDC',  di:8,  ro:6, to:0, fi:1, aiV:1, aiI:1, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:1, aiLC:0, aoV:0, aoI:0, eth:false, desc:'8DI · 6RO · 1AI · NTC' },
  { code:'MM3030-4-V2',              mrp:23366.2, series:'MM303X', ps:'24VDC',  di:10, ro:0, to:8, fi:1, aiV:2, aiI:2, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0, aoV:0, aoI:0, eth:true,  desc:'10DI · 8DO · 2AI · Ethernet' },
]

// ─── HMI ─────────────────────────────────────────────────────────────────────
export const HMI_OPTIONS = [
  { code:'SP115-GT43-S1',    mrp:12728.0,  size:'4.3"',  eth:false, desc:'4.3" · No Ethernet' },
  { code:'SP112-GT40-S1-CE', mrp:16809.0,  size:'4.3"',  eth:false, desc:'4.3" · No Ethernet (CE)' },
  { code:'SP112-GT40-ET1-CE',mrp:20311.0,  size:'4.3"',  eth:true,  desc:'4.3" · With Ethernet' },
  { code:'SP115-GT70-S1',    mrp:15274.0,  size:'7"',    eth:false, desc:'7" · No Ethernet' },
  { code:'SP112-GT70-S1-CE', mrp:18560.0,  size:'7"',    eth:false, desc:'7" · No Ethernet (CE)' },
  { code:'SP112-GT70-ET1-CE',mrp:24998.0,  size:'7"',    eth:true,  desc:'7" · With Ethernet' },
  { code:'SP112-GT100-ET1-CE',mrp:40232.0, size:'10.1"', eth:true,  desc:'10.1" · With Ethernet' },
]

// ─── ACCESSORIES ─────────────────────────────────────────────────────────────
export const ACC = {
  dlCable:  { code:'ACH-002-CE-RoHS', mrp:784.3,  hsn:'85444299', desc:'Programming Cable – 9Pin to RJ25' },
  expCable: { code:'ACH-004-CE-RoHS', mrp:578.6,  hsn:'85444299', desc:'Expansion Cable – RJ25 to RJ25' },
  hmiCable: { code:'ACH-001-CE-RoHS', mrp:861.3,  hsn:'85444299', desc:'Comm Cable – 9Pin to 9Pin' },
}
