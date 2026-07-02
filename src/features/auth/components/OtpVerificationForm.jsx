import { useRef, useState } from 'react'
import { verifyOtp } from '../services/authService'

const OTP_LENGTH = 6

function OtpVerificationForm({ email }) {
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef([])

  const otp = otpDigits.join('')

  const handleChange = (index, event) => {
    const nextValue = event.target.value.replace(/\D/g, '').slice(-1)

    setOtpDigits((currentDigits) => {
      const nextDigits = [...currentDigits]
      nextDigits[index] = nextValue
      return nextDigits
    })

    if (nextValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email) {
      setError('Email is missing. Please login again.')
      return
    }

    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the 6-digit OTP.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await verifyOtp({ email, otp })
      console.log('OTP verification success:', response.data)
    } catch (verifyError) {
      const message =
        verifyError.response?.data?.message ??
        verifyError.message ??
        'Unable to verify OTP. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid grid-cols-6 gap-3 sm:gap-5">
        {otpDigits.map((digit, index) => (
          <input
            className="aspect-square min-w-0 rounded-xl border border-[#d8d8d8] bg-white text-center text-xl font-semibold outline-none transition focus:border-[#f50707] focus:ring-4 focus:ring-red-100 sm:text-2xl"
            inputMode="numeric"
            key={index}
            maxLength="1"
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            value={digit}
          />
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-[#d90000]">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-7">
        <button
          className="h-[58px] rounded-xl border border-black bg-white text-base font-bold text-[#5f5f5f] transition hover:bg-gray-50 sm:h-[72px] sm:text-[22px]"
          type="button"
        >
          Resend Code
        </button>
        <button
          className="h-[58px] rounded-xl bg-[#f50707] text-base font-bold text-white shadow-sm shadow-red-900/20 transition hover:bg-[#d90000] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[72px] sm:text-[22px]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Verifying...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}

export default OtpVerificationForm
