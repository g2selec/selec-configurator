import { useState } from 'react'
import { Pill, SlotBar, Alert } from './ui'
import { getProductImage } from '../data/productImages'

const inr = n => { const num = Number(n); return '₹' + (Number.isInteger(num) ? num.toLocaleString('en-IN') : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) }

const TIER_STYLE = {
  'Economical · Simple':     { color: '#1a8c5b', bg: 'bg-green-50',  text: 'text-green-700' },
  'Economical · Scalable':   { color: '#2563eb', bg: 'bg-blue-50',   text: 'text-blue-700'  },
  'Premium · Simple':        { color: '#d97706', bg: 'bg-amber-50',  text: 'text-amber-700' },
  'Premium · Full Featured': { color: '#7c3aed', bg: 'bg-purple-50', text: 'text-purple-700'},
}

function ProductThumb({ code }) {
  const url = getProductImage(code?.replace('-ISO',''))
  if (!url) return null
  return (
    <img src={url} alt={code} className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
      onError={e => { e.target.style.display = 'none' }} />
  )
}

function BOMSection({ title, items, subtotal }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1.5 mb-2 flex justify-between">
        <span>{title}</span>
        <span className="text-gray-500">{inr(subtotal)}</span>
      </div>
      {items.map((r, i) => (
        <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
          {getProductImage(r.code) && (
            <img src={r.code && getProductImage(r.code)} alt="" className="w-8 h-8 object-contain rounded border border-gray-100 flex-shrink-0 mt-0.5"
              onError={e => { e.target.style.display='none' }} />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[11px] font-medium text-navy">{r.code}</div>
            <div className="text-[11.5px] text-gray-500 leading-snug">{r.desc}</div>
            {r.note && <div className="text-[10px] text-gray-400 mt-0.5">{r.note}</div>}
          </div>
          <div className="text-[11px] text-gray-400 w-5 text-center flex-shrink-0">×{r.qty}</div>
          <div className="text-[12px] font-semibold text-navy w-20 text-right flex-shrink-0">{inr(r.total)}</div>
        </div>
      ))}
    </div>
  )
}

export default function BucketCard({ bucket, onSelectForEmail }) {
  const [open, setOpen] = useState(false)
  const style = TIER_STYLE[bucket.tier] || TIER_STYLE['Economical · Simple']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">

      {/* Header */}
      <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <ProductThumb code={bucket.code} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl">{bucket.icon}</span>
            <h3 className="text-[14px] font-bold text-navy tracking-tight">{bucket.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
              {bucket.tier}
            </span>
          </div>
          <p className="text-[12px] text-gray-400 mt-1">{bucket.tagline}</p>
        </div>
        <div className="flex-shrink-0 text-right ml-2">
          <div className="text-[19px] font-black text-navy tracking-tighter leading-none">{inr(bucket.total)}</div>
          <div className="text-[10px] text-gray-400 mt-1">Indicative MRP</div>
          <div className="text-[11px] text-gray-400 mt-2">{open ? '▲ Hide' : '▼ Details'}</div>
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

      {/* Expanded — BOM gated */}
      {open && (
        <div className="border-t border-gray-100 px-5 pt-4 pb-2">
          {/* Summary counts visible without email */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
            <div className="text-[12px] font-semibold text-navy mb-3">Configuration Summary</div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-center">
                <div className="text-[15px] font-bold text-navy">{bucket.plcItems?.length || 0}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">PLC Items</div>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-center">
                <div className="text-[15px] font-bold text-navy">{bucket.accItems?.length || 0}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Accessories</div>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-center">
                <div className="text-[15px] font-bold text-selgreen">{inr(bucket.plcTotal || 0)}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">PLC Total</div>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-center">
                <div className="text-[15px] font-bold text-selgreen">{inr(bucket.accTotal || 0)}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Accessories</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="text-[13px] font-bold text-navy">Grand Total (excl. GST)</div>
              <div className="text-[16px] font-black text-navy">{inr(bucket.total)}</div>
            </div>
            <div className="text-[11px] text-gray-400 mt-1 text-right">+ GST as Applicable</div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-center">
            <div className="text-[13px] font-semibold text-navy mb-1">Full BOM available via email</div>
            <div className="text-[12px] text-gray-400 mb-3">
              Get the complete line-item quotation with part codes, HSN, quantities and pricing as a formal Selec quotation.
            </div>
            <button
              onClick={() => onSelectForEmail(bucket)}
              className="w-full bg-yellow text-navy font-bold text-[13px] py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow/30 transition-all border-none cursor-pointer font-sans"
            >
              Email me this quotation →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
