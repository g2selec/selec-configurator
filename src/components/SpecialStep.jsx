import { Toggle, Btn } from './ui'

const TOGGLES = [
  { key: 'eth',  label: 'Ethernet (Built-in)',    hint: 'Modbus TCP / EtherNet/IP — selects Ethernet-capable base automatically' },
  { key: 'wifi', label: 'WiFi Slot Card',         hint: 'MIBRX-SC-WIFI — uses one expansion slot' },
  { key: 'dl',   label: 'Datalogging + RTC',      hint: 'MIBRX-SC-DL — 2MB logging; skipped if base already has RTC built-in' },
  { key: 'hmi',  label: 'Add External HMI Panel', hint: 'Selec SP112/SP115 series — shown as add-on in results' },
]

const DSP_OPTIONS = ['Any', 'Blind', '7 Segment LED', 'LCD Text', '3.5 Inch HMI']
const PS_OPTIONS  = ['Any', '18 to 32 VDC', '90 to 270 VAC', '18 to 32 VAC']

export default function SpecialStep({ sp, setSp, onBack, onGenerate }) {
  const set = (key, val) => setSp(prev => ({ ...prev, [key]: val }))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-[17px] font-bold text-navy tracking-tight">Communication, Display &amp; Power</h2>
        <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
          Display and power supply are used as filters on the results — all valid options are shown, then narrowed by your preference.
        </p>
      </div>
      <div className="px-7 pb-7">

        {/* Display preference */}
        <div className="mt-4 mb-5">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Display Preference</div>
          <div className="flex flex-wrap gap-2">
            {DSP_OPTIONS.map(opt => (
              <button key={opt}
                onClick={() => set('displayPref', opt)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                  (sp.displayPref || 'Any') === opt
                    ? 'border-yellow bg-yellow-mid text-navy'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                }`}
              >{opt}</button>
            ))}
          </div>
        </div>

        {/* Power supply preference */}
        <div className="mb-5">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Aux Power Supply</div>
          <div className="flex flex-wrap gap-2">
            {PS_OPTIONS.map(opt => (
              <button key={opt}
                onClick={() => set('ps', opt)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                  (sp.ps || 'Any') === opt
                    ? 'border-yellow bg-yellow-mid text-navy'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                }`}
              >{opt}</button>
            ))}
          </div>
        </div>

        {/* Special function toggles */}
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Special Functions</div>
        <div className="flex flex-col gap-3 max-w-lg">
          {TOGGLES.map(t => (
            <Toggle key={t.key} label={t.label} hint={t.hint}
              checked={sp[t.key] || false} onChange={v => set(t.key, v)} />
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
