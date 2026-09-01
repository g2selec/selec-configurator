import { useState } from 'react'
import { Pill, SlotBar, Btn, Alert } from './ui'
import { getProductImage } from '../data/productImages'

const inr = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

const TIER_STYLE = {
  Budget:      { badge: 'bg-selgreen-light text-selgreen', icon: '🟢', border: 'hover:border-green-200' },
  Standard:    { badge: 'bg-blue-50 text-blue-600',        icon: '🔵', border: 'hover:border-blue-200' },
  Advanced:    { badge: 'bg-purple-50 text-purple-600',    icon: '🟣', border: 'hover:border-purple-200' },
  Alternative: { badge: 'bg-gray-100 text-gray-500',       icon: '⚪', border: 'hover:border-gray-300' },
}

function ProductThumb({ code }) {
  const url = getProductImage(code)
  if (!url) return null
  return (
    <img
      src={url}
      alt={code}
      className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
      onError={e => { e.target.style.display = 'none' }}
    />
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

      {/* Header — always visible, click to expand */}
      <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <ProductThumb code={bucket.code || bucket.baseCode} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl flex-shrink-0">{style.icon}</span>
            <h3 className="text-[15px] font-bold text-navy tracking-tight">{bucket.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              {bucket.tier}
            </span>
          </div>
          <p className="text-[12px] text-gray-400 mt-1">{bucket.tagline}</p>
        </div>

        <div className="flex-shrink-0 text-right ml-2">
          <div className="text-[20px] font-black text-navy tracking-tighter leading-none">
            {inr(bucket.total)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Indicative MRP</div>
          <div className="text-[11px] text-gray-400 mt-2 underline underline-offset-2">
            {open ? '▲ Hide details' : '▼ View details'}
          </div>
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

      {/* Expanded section — BOM gated behind email CTA */}
      {open && (
        <div className="border-t border-gray-100">

          {/* BOM summary — line items hidden, prompt to email */}
          <div className="px-5 pt-5 pb-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-navy">Full Bill of Materials available</div>
                  <div className="text-[12px] text-gray-400 mt-1 leading-relaxed">
                    The detailed BOM with part codes, HSN, quantities, and pricing will be emailed to you as a formal quotation in Selec's format.
                  </div>
                </div>
              </div>

              {/* Component count summary — visible without email */}
              <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(groups).map(([g, rows]) => (
                  <div key={g} className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-center">
                    <div className="text-[16px] font-bold text-navy">{rows.reduce((s,r)=>s+r.qty,0)}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{g}</div>
                  </div>
                ))}
                <div className="bg-yellow-light rounded-lg px-3 py-2 border border-yellow/30 text-center">
                  <div className="text-[16px] font-bold text-navy">{inr(bucket.total)}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Total MRP</div>
                </div>
              </div>

              <button
                onClick={() => onSelectForEmail(bucket)}
                className="mt-4 w-full bg-yellow text-navy font-bold text-[13px] py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow/30 transition-all border-none cursor-pointer font-sans"
              >
                Email me this configuration →
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
