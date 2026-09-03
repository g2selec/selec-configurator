import { useState, useMemo } from 'react'
import { Alert, Btn } from './ui'
import BucketCard from './BucketCard'
import LeadModal from './LeadModal'
import { HMI_OPTIONS } from '../data/products'

const inr = n => { const num = Number(n); return '₹' + (Number.isInteger(num) ? num.toLocaleString('en-IN') : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) }

// ─── FILTER CHIP ─────────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
        active ? 'border-yellow bg-yellow-mid text-navy' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
      }`}
    >{label}</button>
  )
}

// ─── SUMMARY STRIP ───────────────────────────────────────────────────────────
function SummaryStrip({ io, sp, totalFound }) {
  const ioEntries = Object.entries(io).filter(([, v]) => v > 0)
  return (
    <div className="bg-navy rounded-xl px-5 py-4 flex flex-wrap gap-4 mb-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[18px] font-black text-yellow leading-none">{totalFound}</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Configurations</span>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ResultsStep({ result, io, sp, onBack, onCaptureLead }) {
  const { allCandidates = [], warnings = [] } = result

  const [filterMnt, setFilterMnt] = useState('All')
  const [filterPs,  setFilterPs]  = useState('All')
  const [filterDsp, setFilterDsp] = useState('All')
  const [selectedHMI, setSelectedHMI] = useState(null)
  const [modal, setModal] = useState(null)

  // ── Re-select top 3 from filtered pool ───────────────────────────────────
  const { shown, noMatch } = useMemo(() => {
    // Apply filters to full candidate pool
    const filtered = allCandidates.filter(c => {
      if (filterMnt !== 'All' && c.mnt && c.mnt !== filterMnt) return false
      if (filterPs  !== 'All' && c.ps) {
        // Normalize: "18 to 32 VDC" contains "VDC", "90 to 270 VAC" contains "VAC"
        const psKey = filterPs === '24VDC' ? 'VDC' : filterPs === '230VAC' ? '270' : filterPs === '24VAC' ? '32 VAC' : null
        if (psKey && !c.ps.includes(psKey.split(' ')[0])) return false
      }
      if (filterDsp !== 'All' && c.dsp && c.dsp !== 'N/A') {
        if (c.dsp !== filterDsp && filterDsp !== 'Any') return false
      }
      return true
    })

    if (filtered.length === 0) {
      return { shown: [], noMatch: true }
    }

    // Re-rank filtered pool: pick top 3 by existing rank (quadrant score)
    // already ranked by engine — just take first 3 unique bases
    const seen = new Set()
    const top3 = []
    for (const c of filtered) {
      const key = (c.baseCode || c.code || '') + (c.family || '')
      if (!seen.has(key)) {
        seen.add(key)
        top3.push({ ...c, rank: top3.length + 1 })
        if (top3.length === 3) break
      }
    }

    return { shown: top3, noMatch: false }
  }, [allCandidates, filterMnt, filterPs, filterDsp])

  // Available filter options derived from actual candidates
  const availMnt  = ['All', ...new Set(allCandidates.map(c => c.mnt).filter(m => m && m !== 'Any'))]
  const availPs   = ['All', ...new Set(allCandidates.map(c => {
    if (!c.ps) return null
    if (c.ps.includes('VDC')) return '24VDC'
    if (c.ps.includes('270')) return '230VAC'
    if (c.ps.includes('32 VAC')) return '24VAC'
    return null
  }).filter(Boolean))]
  const availDsp  = ['All', ...new Set(allCandidates.map(c => c.dsp).filter(d => d && d !== 'N/A' && d !== 'Any'))]

  const handleSelectForEmail = (bucket) => setModal(bucket)
  const handleSubmitLead     = async (leadData) => { await onCaptureLead(leadData, modal) }

  return (
    <div className="flex flex-col gap-4">

      <SummaryStrip io={io} sp={sp} totalFound={shown.length} />

      {warnings.map((w, i) => (
        <Alert key={i} type={w.includes('contact Selec support') ? 'info' : 'warn'}>
          {w.includes('contact Selec support') ? '📞 ' : '⚠ '}{w}
        </Alert>
      ))}

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-x-6 gap-y-3 items-center">
        {availMnt.length > 2 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Mount</span>
            {availMnt.map(v => <FilterChip key={v} label={v} active={filterMnt === v} onClick={() => setFilterMnt(v)} />)}
          </div>
        )}
        {availPs.length > 2 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Power</span>
            {availPs.map(v => <FilterChip key={v} label={v} active={filterPs === v} onClick={() => setFilterPs(v)} />)}
          </div>
        )}
        {availDsp.length > 2 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Display</span>
            {availDsp.map(v => <FilterChip key={v} label={v} active={filterDsp === v} onClick={() => setFilterDsp(v)} />)}
          </div>
        )}
        {(filterMnt !== 'All' || filterPs !== 'All' || filterDsp !== 'All') && (
          <button className="text-[11px] text-gray-400 underline underline-offset-2 ml-auto"
            onClick={() => { setFilterMnt('All'); setFilterPs('All'); setFilterDsp('All') }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Results label */}
      <div className="text-[12px] text-gray-400 px-1">
        {filterMnt !== 'All' || filterPs !== 'All' || filterDsp !== 'All'
          ? `Top ${shown.length} recommended configuration${shown.length !== 1 ? 's' : ''} for your selection`
          : `Top ${shown.length} recommended configuration${shown.length !== 1 ? 's' : ''} for your requirement`
        }
      </div>

      {/* Bucket cards */}
      {noMatch
        ? <Alert type="info">
            No configurations match the selected filters.
            Try removing one filter — <strong>{allCandidates.length}</strong> valid options exist without filters.
          </Alert>
        : shown.map(b => (
            <BucketCard key={b.rank} bucket={b} onSelectForEmail={handleSelectForEmail} />
          ))
      }

      {/* HMI Add-on */}
      {sp.hmi && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-[14px] font-bold text-navy mb-1">
            HMI Panel Add-on
            <span className="text-[11px] font-normal text-gray-400 ml-2">Optional · adds to any configuration above</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
            {HMI_OPTIONS.map(h => (
              <button key={h.code}
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
              Selected HMI adds <strong>{inr(selectedHMI.mrp)}</strong> + ACH-001 cable (₹861) to any configuration.
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-end pt-1">
        <Btn variant="secondary" onClick={onBack}>← Modify</Btn>
      </div>

      <p className="text-[11px] text-gray-400 text-right">
        * Indicative MRP FY 2026-27 · Excl. GST · Subject to Selec's current price list
      </p>

      {modal && (
        <LeadModal bucket={modal} onSubmit={handleSubmitLead} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
