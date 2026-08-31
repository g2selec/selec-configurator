const STEPS = ['I/O Requirements', 'Special Functions', 'Configurations']

export default function StepBar({ step }) {
  return (
    <div className="bg-white border-b border-gray-100 flex overflow-x-auto scrollbar-hide sticky top-[60px] z-40">
      {STEPS.map((label, i) => {
        const active = step === i
        const done   = step > i
        return (
          <div
            key={label}
            className={`flex-1 min-w-[90px] px-3 py-3.5 text-center text-[11px] whitespace-nowrap border-b-2 transition-all ${
              active ? 'border-yellow font-bold text-navy bg-yellow-light'
              : done  ? 'border-transparent font-medium text-selgreen'
              :         'border-transparent text-gray-400'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold mr-1.5 ${
              active ? 'bg-yellow text-navy'
              : done  ? 'bg-selgreen text-white'
              :         'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : i + 1}
            </span>
            {label}
          </div>
        )
      })}
    </div>
  )
}
