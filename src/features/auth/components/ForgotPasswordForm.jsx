import { Mail } from 'lucide-react'
import { useState } from 'react'
import TextField from '../../../components/forms/TextField'
import { getAuthErrorMessage } from '../services/authError'
import { forgotPassword } from '../services/authService'

function ForgotPasswordForm({ onCancel }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await forgotPassword({ email })
      setSuccessMessage(
        response.data?.message ?? 'Password reset link sent successfully.',
      )
    } catch (forgotPasswordError) {
      setError(
        getAuthErrorMessage(
          forgotPasswordError,
          'Unable to send password reset link. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <TextField
        icon={Mail}
        label="Email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="example@gmail.com"
        type="email"
        value={email}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-[#d90000]">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-7">
        <button
          className="h-[58px] rounded-xl border border-black bg-white text-base font-bold text-[#5f5f5f] transition hover:bg-gray-50 sm:h-[72px] sm:text-[22px]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="h-[58px] rounded-xl bg-[#f50707] text-base font-bold text-white shadow-sm shadow-red-900/20 transition hover:bg-[#d90000] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[72px] sm:text-[22px]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Sending...' : 'Reset Password'}
        </button>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
