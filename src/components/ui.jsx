import React from 'react'
// ─── NUMBER STEPPER ──────────────────────────────────────────────────────────
export function Stepper({ label, hint, value, onChange }) {
  // Track raw string separately so user can clear and retype without fighting
  const [raw, setRaw] = React.useState(String(value))

  // Sync when parent resets value (e.g. "Start Over")
  React.useEffect(() => { setRaw(String(value)) }, [value])

  const handleChange = (e) => {
    const str = e.target.value
    // Allow empty string while typing — don't force 0 immediately
    if (str === '' || str === '-') { setRaw(''); return }
    const num = parseInt(str, 10)
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(99, num))
      setRaw(String(clamped))
      onChange(clamped)
    }
  }

  const handleBlur = () => {
    // On blur, if empty → set to 0
    if (raw === '' || raw === '-') { setRaw('0'); onChange(0) }
  }

  const dec = () => { const v = Math.max(0, value - 1); setRaw(String(v)); onChange(v) }
  const inc = () => { const v = Math.min(99, value + 1); setRaw(String(v)); onChange(v) }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</span>
      {hint && <span className="text-[11px] text-gray-400 -mt-1">{hint}</span>}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:border-yellow-400 focus-within:bg-white transition-colors">
        <button onClick={dec}
          className="w-9 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg font-light flex-shrink-0 transition-colors select-none"
        >−</button>
        <input
          type="number" min={0} max={99}
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex-1 border-none bg-transparent text-center text-[15px] font-bold text-navy outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button onClick={inc}
          className="w-9 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg font-light flex-shrink-0 transition-colors select-none"
        >+</button>
      </div>
    </div>
  )
}

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
export function Toggle({ label, hint, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition-all text-left ${
        checked ? 'border-yellow-400 bg-yellow-light' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-navy">{label}</div>
        {hint && <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div>}
      </div>
      <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ml-4 ${checked ? 'bg-yellow-400' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  )
}

// ─── PILL ────────────────────────────────────────────────────────────────────
const pillColors = {
  green: 'bg-selgreen-light text-selgreen',
  blue:  'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-700',
  gray:  'bg-gray-100 text-gray-600',
  yellow:'bg-yellow-mid text-yellow-800',
}
export function Pill({ t, c = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${pillColors[c] || pillColors.gray}`}>
      {t}
    </span>
  )
}

// ─── SLOT BAR ────────────────────────────────────────────────────────────────
export function SlotBar({ used, total }) {
  if (!total) return null
  const pct   = Math.min(100, (used / total) * 100)
  const color = used > total ? 'bg-red-500' : pct > 80 ? 'bg-amber-400' : 'bg-selgreen'
  return (
    <div>
      <div className="text-[11px] text-gray-400 mb-1">IO card slots used: {used} of {total}</div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────
export function SectionDivider({ children }) {
  return (
    <div className="text-[11px] font-bold text-navy bg-gray-100 rounded-md px-3 py-2 mt-5 mb-3 tracking-wide">
      {children}
    </div>
  )
}

// ─── ALERT ───────────────────────────────────────────────────────────────────
export function Alert({ type = 'warn', children }) {
  const styles = {
    warn:  'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-700',
    info:  'bg-blue-50 border-blue-200 text-blue-700',
  }
  return (
    <div className={`border rounded-lg px-4 py-3 text-[13px] leading-relaxed mb-3 ${styles[type]}`}>
      {children}
    </div>
  )
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', disabled, className = '' }) {
  const base = 'rounded-xl px-5 py-3 text-sm font-bold transition-all cursor-pointer border-none font-sans'
  const variants = {
    primary:   'bg-yellow text-navy hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0',
    secondary: 'bg-white text-navy border border-gray-200 hover:border-gray-400',
    ghost:     'bg-transparent text-navy hover:bg-gray-100',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
export function Input({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-500 tracking-wide">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy bg-gray-50 outline-none focus:border-yellow-400 focus:bg-white transition-colors w-full font-sans"
      />
    </div>
  )
}
