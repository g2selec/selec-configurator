import { useState } from 'react'
import { Alert, Btn } from './ui'
import BucketCard from './BucketCard'
import LeadModal from './LeadModal'
import { HMI_OPTIONS } from '../data/products'

const inr = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
        active ? 'border-yellow bg-yellow-mid text-navy' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  )
}

function SummaryStrip({ io, sp, count }) {
  const ioEntries = Object.entries(io).filter(([, v]) => v > 0)
  return (
    <div className="bg-navy rounded-xl px-5 py-4 flex flex-wrap gap-4 mb-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[18px] font-black text-yellow leading-none">{count}</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Options</span>
      </div>
      {ioEntries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <span className="text-[18px] font-black text-yellow leading-none">{v}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">{k.toUpperCase()}</span>
        </div>
      ))}
      {sp.eth  && <div className="flex flex-col gap-0.5"><span className="text-[18px] font-black text-yellow leading-none">ETH</span><span className="text-[10px] text-white/40 uppercase tracking-wider">Ethernet</span></div>}
      {sp.wifi && <div className="flex flex-col gap-0.5"><span className="text-[18px] font-black text-yellow leading-none">WiFi</span><span className="text-[10px] text-white/40 uppercase tracking-wider">WiFi</span></div>}
      {sp.hmi  && <div className="flex flex-col gap-0.5"><span className="text-[18px] font-black text-yellow leading-none">HMI</span><span className="text-[10px] text-white/40 uppercase tracking-wider">Add-on</span></div>}
    </div>
  )
}

export default function ResultsStep({ result, io, sp, onBack, onCaptureLead }) {
  const { buckets, warnings } = result
  const [filterMnt, setFilterMnt] = useState('All')
  const [filterPs,  setFilterPs]  = useState('All')
  const [selectedHMI, setSelectedHMI] = useState(null)
  const [modal, setModal]   = useState(null) // bucket to email

  const shown = buckets.filter(b => {
    if (filterMnt !== 'All' && b.mnt && b.mnt !== filterMnt) return false
    if (filterPs  !== 'All' && b.ps  && !b.ps.includes(filterPs.replace('VAC','').replace('VDC',''))) return false
    return true
  })

  const handleSelectForEmail = (bucket) => setModal(bucket)

  const handleSubmitLead = async (name, email) => {
    await onCaptureLead(name, email, modal)
  }

  return (
    <div className="flex flex-col gap-4">

      <SummaryStrip io={io} sp={sp} count={buckets.length} />

      {warnings.map((w, i) => <Alert key={i} type="warn">⚠ {w}</Alert>)}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Mount</span>
        {['All','Din Rail','Panel'].map(v => (
          <FilterChip key={v} label={v} active={filterMnt === v} onClick={() => setFilterMnt(v)} />
        ))}
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-3 mr-1">Power</span>
        {['All','24VDC','230VAC','24VAC'].map(v => (
          <FilterChip key={v} label={v} active={filterPs === v} onClick={() => setFilterPs(v)} />
        ))}
      </div>

      {/* Bucket cards */}
      {shown.length > 0
        ? shown.map(b => (
            <BucketCard key={b.rank} bucket={b} onSelectForEmail={handleSelectForEmail} />
          ))
        : <Alert type="info">No configurations match the current filters. Try broadening the filter.</Alert>
      }

      {/* HMI Add-on */}
      {sp.hmi && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-[14px] font-bold text-navy mb-1">
            🖥 Add an HMI Panel
            <span className="text-[11px] font-normal text-gray-400 ml-2">Optional · adds to any configuration above</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
            {HMI_OPTIONS.map(h => (
              <button
                key={h.code}
                onClick={() => setSelectedHMI(selectedHMI?.code === h.code ? null : h)}
                className={`text-left border rounded-xl p-3 transition-all ${
                  selectedHMI?.code === h.code
                    ? 'border-yellow bg-yellow-light'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-[11px] font-bold text-navy">{h.code}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{h.desc}</div>
                <div className="text-[13px] font-bold text-selgreen mt-1.5">{inr(h.mrp)}</div>
              </button>
            ))}
          </div>
          {selectedHMI && (
            <div className="mt-3 text-[12px] text-blue-700 bg-blue-50 rounded-lg px-4 py-2.5 border border-blue-100">
              Selected HMI adds <strong>{inr(selectedHMI.mrp)}</strong> + ACH-001 cable (₹861.30) to any configuration.
            </div>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-wrap gap-3 justify-end pt-1">
        <Btn variant="secondary" onClick={onBack}>← Modify</Btn>
      </div>

      <p className="text-[11px] text-gray-400 text-right">
        * Indicative MRP FY 2026-27 · Excl. GST · Subject to Selec's current price list
      </p>

      {/* Lead modal */}
      {modal && (
        <LeadModal
          bucket={modal}
          onSubmit={handleSubmitLead}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
