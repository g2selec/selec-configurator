import { Toggle, Btn } from './ui'

const TOGGLES = [
  { key: 'eth',  label: 'Ethernet (Built-in)',     hint: 'Modbus TCP / EtherNet/IP — selects Ethernet-capable base automatically' },
  { key: 'wifi', label: 'WiFi',                    hint: 'MIBRX-SC-WIFI slot card — uses one expansion slot' },
  { key: 'dl',   label: 'Datalogging + RTC',       hint: 'MIBRX-SC-DL — 2MB logging, skipped if base already has RTC' },
  { key: 'hmi',  label: 'Add External HMI Panel',  hint: 'Selec SP112/SP115 series — shown as an add-on in results' },
]

export default function SpecialStep({ sp, setSp, onBack, onGenerate }) {
  const set = (key, val) => setSp(prev => ({ ...prev, [key]: val }))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-[17px] font-bold text-navy tracking-tight">Communication &amp; Special Functions</h2>
        <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
          Each slot card uses one expansion slot. Ethernet auto-selects a compatible base module.
        </p>
      </div>

      <div className="px-7 pb-7">
        <div className="flex flex-col gap-3 max-w-lg mt-4">
          {TOGGLES.map(t => (
            <Toggle key={t.key} label={t.label} hint={t.hint} checked={sp[t.key] || false} onChange={v => set(t.key, v)} />
          ))}
        </div>

        <div className="flex gap-3 justify-end mt-7">
          <Btn variant="secondary" onClick={onBack}>← Back</Btn>
          <Btn onClick={onGenerate}>Find Configurations →</Btn>
        </div>
      </div>
    </div>
  )
}
