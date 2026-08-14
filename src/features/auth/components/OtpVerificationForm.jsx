import { useEffect, useRef, useState } from 'react'
import { getAuthErrorMessage } from '../services/authError'
import { login, verifyOtp } from '../services/authService'
import { saveAuthToken, saveAuthUser } from '../services/authUserSession'
import { getRequiredClientAuthMetadata } from '../services/clientAuthMetadata'

const OTP_LENGTH = 6
const RESEND_TIMER_SECONDS = 60

function OtpVerificationForm({ email, loginCredentials, onVerified }) {
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_TIMER_SECONDS)
  const inputRefs = useRef([])

  const otp = otpDigits.join('')
  const isResendDisabled = resendTimer > 0

  useEffect(() => {
    if (resendTimer <= 0) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setResendTimer((currentTimer) => Math.max(currentTimer - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [resendTimer])

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
      const clientMetadata = await getRequiredClientAuthMetadata()
      console.log('OTP client metadata:', clientMetadata)
      const response = await verifyOtp({
        email,
        otp,
        ...clientMetadata,
      })
      console.log('OTP verification success:', response.data)
      const token = saveAuthToken(response.data)

      if (!token) {
        console.warn('OTP verification response did not include a token:', response.data)
        setError('Authentication token is missing from OTP verification response.')
        return
      }

      saveAuthUser(response.data)
      onVerified?.()
    } catch (verifyError) {
      setError(
        getAuthErrorMessage(verifyError, 'Unable to verify OTP. Please try again.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (isResendDisabled) {
      return
    }

    if (!loginCredentials?.email || !loginCredentials?.password) {
      setError('Login details are missing. Please login again to resend OTP.')
      return
    }

    setError('')
    setIsResending(true)

    try {
      const clientMetadata = await getRequiredClientAuthMetadata()
      const response = await login({
        ...loginCredentials,
        ...clientMetadata,
      })
      console.log('OTP resend success:', response.data)
      saveAuthUser(response.data)
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setResendTimer(RESEND_TIMER_SECONDS)
      inputRefs.current[0]?.focus()
    } catch (resendError) {
      setError(
        getAuthErrorMessage(resendError, 'Unable to resend OTP. Please try again.'),
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-6 gap-3 sm:gap-[15px]">
        {otpDigits.map((digit, index) => (
          <input
            className="aspect-square min-w-0 rounded-[6px] border border-[#d8d8d8] bg-white text-center text-xl font-semibold text-black outline-none transition focus:border-[#f50707] focus:ring-4 focus:ring-red-100 sm:h-[50px] sm:w-[50px] sm:text-2xl"
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

      <p className="-mt-2 text-center text-[13px] font-medium text-[#777777]">
        Didn&apos;t receive the code?{' '}
        {isResendDisabled ? (
          <span>
            Resend code in 00:{String(resendTimer).padStart(2, '0')} sec
          </span>
        ) : (
          <span className="font-semibold text-[#f50707]">You can resend code now</span>
        )}
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-[#d90000]">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-[22px]">
        <button
          className="h-[48px] rounded-[8px] border border-[#5d5d5d] bg-white text-base font-semibold text-[#5f5f5f] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-[#D6D6D6] disabled:text-[#A3A3A3] disabled:hover:bg-white sm:text-[14px]"
          disabled={isResendDisabled || isResending}
          onClick={handleResendCode}
          type="button"
        >
          {isResending ? 'Resending...' : 'Resend Code'}
        </button>
        <button
          className="h-[48px] rounded-[8px] bg-[#f50707] text-base font-semibold text-white shadow-sm shadow-red-900/20 transition hover:bg-[#d90000] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[14px]"
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
