import { useState } from 'react'
import { Pill, SlotBar, Btn, Alert } from './ui'

const inr = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

const TIER_STYLE = {
  Budget:      { badge: 'bg-selgreen-light text-selgreen', icon: '🟢', border: 'hover:border-selgreen/30' },
  Standard:    { badge: 'bg-blue-50 text-blue-600',        icon: '🔵', border: 'hover:border-blue-200' },
  Advanced:    { badge: 'bg-purple-50 text-purple-600',    icon: '🟣', border: 'hover:border-purple-200' },
  Alternative: { badge: 'bg-gray-100 text-gray-500',       icon: '⚪', border: 'hover:border-gray-300' },
}

function BOMGroup({ group, rows }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1.5 mb-2">
        {group}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
          <span className="font-mono text-[11px] font-medium text-navy w-48 flex-shrink-0 mt-0.5">{r.code}</span>
          <span className="flex-1 text-[12px] text-gray-600 leading-snug">
            {r.desc}
            {r.note && <span className="block text-[11px] text-gray-400 mt-0.5">{r.note}</span>}
          </span>
          <span className="text-[11px] text-gray-400 w-6 text-center flex-shrink-0">×{r.qty}</span>
          <span className="text-[12px] font-semibold text-navy w-20 text-right flex-shrink-0">{inr(r.total)}</span>
        </div>
      ))}
    </div>
  )
}

export default function BucketCard({ bucket, onSelectForEmail }) {
  const [open, setOpen] = useState(false)
  const style = TIER_STYLE[bucket.tier] || TIER_STYLE.Alternative

  // Group BOM items
  const groups = {}
  ;(bucket.items || []).forEach(item => {
    if (!groups[item.group]) groups[item.group] = []
    groups[item.group].push(item)
  })

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm transition-all ${style.border}`}>

      {/* Header */}
      <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="text-xl mt-0.5 flex-shrink-0">{style.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[15px] font-bold text-navy tracking-tight">{bucket.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              {bucket.tier}
            </span>
          </div>
          <p className="text-[12px] text-gray-400 mt-1">{bucket.tagline}</p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="text-[20px] font-black text-navy tracking-tighter leading-none">{inr(bucket.total)}</div>
          <div className="text-[10px] text-gray-400 mt-1">Indicative MRP</div>
          <div className="text-[11px] text-gray-400 mt-1.5">{open ? '▲ Hide' : '▼ BOM'}</div>
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5 px-5 pb-3">
        {(bucket.pills || []).map((p, i) => <Pill key={i} t={p.t} c={p.c} />)}
      </div>

      {/* Slot bar */}
      {bucket.totalSlots > 0 && (
        <div className="px-5 pb-4">
          <SlotBar used={bucket.usedSlots} total={bucket.totalSlots} />
        </div>
      )}

      {/* Warnings */}
      {(bucket.warnings || []).map((w, i) => (
        <div className="px-5 pb-2" key={i}><Alert type="warn">⚠ {w}</Alert></div>
      ))}

      {/* Expanded BOM */}
      {open && (
        <div className="border-t border-gray-100 px-5 pt-4 pb-2">
          {Object.entries(groups).map(([g, rows]) => (
            <BOMGroup key={g} group={g} rows={rows} />
          ))}
          <div className="flex justify-between items-center border-t-2 border-navy pt-3 mt-2 mb-4">
            <span className="text-[13px] font-bold text-navy">Total Indicative MRP (excl. GST)</span>
            <span className="text-[16px] font-black text-navy">{inr(bucket.total)}</span>
          </div>
          {/* Per-bucket email CTA */}
          <div className="flex justify-end mb-3">
            <Btn onClick={() => onSelectForEmail(bucket)}>
              Email me this configuration →
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}
