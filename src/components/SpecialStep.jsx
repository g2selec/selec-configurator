import { Toggle, Btn } from './ui'
import { HMI_OPTIONS } from '../data/products'

const TOGGLES = [
  { key: 'eth',  label: 'Ethernet (Built-in)',    hint: 'Modbus TCP / EtherNet/IP — selects Ethernet-capable base automatically' },
  { key: 'wifi', label: 'WiFi Slot Card',         hint: 'MIBRX-SC-WIFI — occupies one IO card slot' },
  { key: 'dl',   label: 'Datalogging + RTC',      hint: 'MIBRX-SC-DL — 2MB logging; skipped if base already has RTC built-in' },
]

const DSP_OPTIONS = ['Any', 'Blind', '7 Segment LED', 'LCD Text', '3.5" Touch']
const PS_OPTIONS  = ['Any', '18 to 32 VDC', '90 to 270 VAC', '18 to 32 VAC']

export default function SpecialStep({ sp, setSp, onBack, onGenerate }) {
  const set = (key, val) => setSp(prev => ({ ...prev, [key]: val }))

  const hmiOn = sp.hmi || false

  const toggleHmi = (val) => {
    // When turning off, also clear the selected HMI option
    setSp(prev => ({ ...prev, hmi: val, hmiOption: val ? prev.hmiOption : null }))
  }

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

          {/* HMI toggle + inline panel picker */}
          <Toggle
            label="Add External HMI Panel"
            hint="Selec SP112/SP115 series — MiBRX Din Rail only"
            checked={hmiOn}
            onChange={toggleHmi}
          />
          {hmiOn && (
            <div className="ml-0 mt-1 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Select HMI Panel</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HMI_OPTIONS.map(h => {
                  const selected = sp.hmiOption?.code === h.code
                  return (
                    <button key={h.code}
                      onClick={() => set('hmiOption', selected ? null : h)}
                      className={`text-left rounded-xl border px-3 py-2.5 transition-all ${
                        selected
                          ? 'border-yellow bg-yellow-mid'
                          : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="text-[12px] font-bold text-navy">{h.size} — {h.code}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{h.desc}</div>
                      <div className="text-[13px] font-bold text-green-700 mt-1">
                        ₹{Math.round(h.mrp).toLocaleString('en-IN')}
                      </div>
                    </button>
                  )
                })}
              </div>
              {!sp.hmiOption && (
                <p className="text-[11px] text-amber-600 mt-2">↑ Select an HMI panel to continue</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-7">
          <Btn variant="secondary" onClick={onBack}>← Back</Btn>
          <Btn onClick={onGenerate} disabled={hmiOn && !sp.hmiOption}>Find Configurations →</Btn>
        </div>
      </div>
    </div>
  )
}
