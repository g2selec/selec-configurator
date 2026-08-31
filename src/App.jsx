import { useState, useMemo } from 'react'
import StepBar    from './components/StepBar'
import IOStep     from './components/IOStep'
import SpecialStep from './components/SpecialStep'
import ResultsStep from './components/ResultsStep'
import { generateBuckets } from './engine/configurator'
import { useSheetCapture }  from './hooks/useSheetCapture'

// Unique session ID per browser visit — ties anonymous requirement to lead
const SESSION_ID = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)

const DEFAULT_IO = {
  di:0, ro:0, to:0, fi:0,
  aiV:0, aiI:0, aiTC:0, aiRTD:0, aiPTC:0, aiNTC:0, aiLC:0,
  aoV:0, aoI:0,
}
const DEFAULT_SP = { eth:false, wifi:false, dl:false, hmi:false }

export default function App() {
  const [step,   setStep]   = useState(0)
  const [io,     setIO]     = useState(DEFAULT_IO)
  const [sp,     setSp]     = useState(DEFAULT_SP)
  const [result, setResult] = useState(null)

  const { captureRequirement, captureLead } = useSheetCapture(SESSION_ID)

  const handleGenerate = () => {
    const res = generateBuckets({ ...io, ...sp })
    setResult(res)
    setStep(2)
    // Anonymous capture — fires regardless of whether user shares contact
    captureRequirement(io, sp, res.buckets)
  }

  const handleCaptureLead = async (name, email, selectedBucket) => {
    await captureLead(name, email, io, sp, selectedBucket)
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <header className="bg-navy h-[60px] flex items-center px-7 gap-3.5 sticky top-0 z-50 shadow-lg">
        <div className="w-8 h-8 bg-yellow rounded-lg flex items-center justify-center text-navy font-black text-sm flex-shrink-0">
          S
        </div>
        <div>
          <div className="text-yellow font-black text-[18px] leading-none tracking-tight">SELEC</div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">PLC Configurator</div>
        </div>
        <div className="ml-auto text-white/20 text-[11px]">MRP FY 2026-27</div>
      </header>

      {/* Step bar */}
      <StepBar step={step} />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {step === 0 && (
          <IOStep io={io} setIO={setIO} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <SpecialStep
            sp={sp} setSp={setSp}
            onBack={() => setStep(0)}
            onGenerate={handleGenerate}
          />
        )}
        {step === 2 && result && (
          <ResultsStep
            result={result}
            io={io} sp={sp}
            onBack={() => setStep(1)}
            onCaptureLead={handleCaptureLead}
          />
        )}
      </main>

    </div>
  )
}
