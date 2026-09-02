const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''

async function post(payload, sessionId) {
  if (!APPS_SCRIPT_URL) { console.warn('VITE_APPS_SCRIPT_URL not set'); return }
  try {
    const body    = JSON.stringify({ ...payload, sessionId })
    const encoded = encodeURIComponent(body)
    await fetch(`${APPS_SCRIPT_URL}?payload=${encoded}`, { method:'GET', mode:'no-cors' })
  } catch(e) { console.warn('Sheet capture failed:', e) }
}

export function useSheetCapture(sessionId) {
  const captureRequirement = (io, sp, buckets) =>
    post({ type:'requirement', io, sp,
      buckets: buckets.map(b => ({ name:b.name, total:b.total, tier:b.tier }))
    }, sessionId)

  const captureLead = ({ name, email, company, phone }, io, sp, selectedBucket) =>
    post({
      type: 'lead', name, email, company, phone, io, sp,
      selectedBucket: {
        name:     selectedBucket.name,
        tier:     selectedBucket.tier,
        code:     selectedBucket.code || selectedBucket.baseCode,
        plcTotal: selectedBucket.plcTotal,
        accTotal: selectedBucket.accTotal,
        total:    selectedBucket.total,
        items:    [
          ...(selectedBucket.plcItems || []),
          ...(selectedBucket.accItems || []),
        ],
      },
    }, sessionId)

  return { captureRequirement, captureLead }
}
