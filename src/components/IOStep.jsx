import { Stepper, SectionDivider, Btn } from './ui'

const DIGITAL = [
  { key: 'di',  label: 'Digital Inputs',       hint: 'Standard 24VDC' },
  { key: 'ro',  label: 'Relay Outputs',         hint: 'Changeover contacts' },
  { key: 'to',  label: 'Transistor Outputs',    hint: 'High-speed switching' },
  { key: 'fi',  label: 'Fast Inputs',           hint: 'Counting up to 10KHz' },
]
const ANALOG_IN = [
  { key: 'aiV',   label: 'Voltage',       hint: '0–10 VDC' },
  { key: 'aiI',   label: 'Current',       hint: '0–20 mA' },
  { key: 'aiTC',  label: 'Thermocouple',  hint: 'TC types' },
  { key: 'aiRTD', label: 'RTD',           hint: 'PT100' },
  { key: 'aiPTC', label: 'PTC',           hint: '' },
  { key: 'aiNTC', label: 'NTC',           hint: 'Many bases have built-in NTC' },
  { key: 'aiLC',  label: 'Load Cell',     hint: '24-bit' },
]
const ANALOG_OUT = [
  { key: 'aoV', label: 'Voltage', hint: '0–10 VDC' },
  { key: 'aoI', label: 'Current', hint: '0–20 mA' },
]

export default function IOStep({ io, setIO, onNext }) {
  const set = (key, val) => setIO(prev => ({ ...prev, [key]: val }))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-[17px] font-bold text-navy tracking-tight">What I/O does your application need?</h2>
        <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
          Enter the number of channels required for each type. On-board pins are used first — slot cards are added only for the remainder.
        </p>
      </div>

      <div className="px-7 pb-7">
        <SectionDivider>Digital I/O</SectionDivider>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {DIGITAL.map(f => (
            <Stepper key={f.key} label={f.label} hint={f.hint} value={io[f.key] || 0} onChange={v => set(f.key, v)} />
          ))}
        </div>

        <SectionDivider>Analog Inputs</SectionDivider>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {ANALOG_IN.map(f => (
            <Stepper key={f.key} label={f.label} hint={f.hint} value={io[f.key] || 0} onChange={v => set(f.key, v)} />
          ))}
        </div>

        <SectionDivider>Analog Outputs</SectionDivider>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {ANALOG_OUT.map(f => (
            <Stepper key={f.key} label={f.label} hint={f.hint} value={io[f.key] || 0} onChange={v => set(f.key, v)} />
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Btn onClick={onNext}>Next: Special Functions →</Btn>
        </div>
      </div>
    </div>
  )
}
