import { useState } from 'react'
import { Input, Btn } from './ui'

export default function LeadModal({ bucket, onSubmit, onClose }) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const valid = name.trim() && email.trim() && email.includes('@')

  const handleSubmit = async () => {
    if (!valid) { setError('Please enter a valid name and email.'); return }
    setError('')
    setSending(true)
    await onSubmit(name.trim(), email.trim())
    setSending(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">

        {done ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-[17px] font-bold text-navy mb-2">Proposal sent!</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Your BOM and pricing summary for <strong className="text-navy">{bucket?.name}</strong> are
              on their way to <strong className="text-navy">{email}</strong>.<br/>
              Our team will follow up shortly.
            </p>
            <Btn className="mt-6 w-full" onClick={onClose}>Done</Btn>
          </div>
        ) : (
          <>
            <h3 className="text-[17px] font-bold text-navy mb-1">Get your proposal</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-1">
              We'll email the full BOM and pricing for{' '}
              <strong className="text-navy">{bucket?.name}</strong>.
            </p>
            <p className="text-[11px] text-gray-400 mb-5">
              Indicative MRP: <strong className="text-navy">
                ₹{Number(bucket?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </p>

            <div className="flex flex-col gap-4 mb-5">
              <Input label="Full Name" placeholder="e.g. Ramesh Patel" value={name} onChange={setName} required />
              <Input label="Email Address" type="email" placeholder="name@company.com" value={email} onChange={setEmail} required />
            </div>

            {error && <p className="text-[12px] text-red-600 mb-3">{error}</p>}

            <div className="flex gap-3">
              <Btn variant="secondary" className="flex-1" onClick={onClose} disabled={sending}>Cancel</Btn>
              <Btn className="flex-[2]" onClick={handleSubmit} disabled={!valid || sending}>
                {sending ? 'Sending…' : 'Send PDF →'}
              </Btn>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
              Only your name and email are collected. We won't share your details.
            </p>
          </>
        )}

      </div>
    </div>
  )
}
