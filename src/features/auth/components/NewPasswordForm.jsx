import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { getAuthErrorMessage } from '../services/authError'
import { resetPassword } from '../services/authService'

function NewPasswordForm({ onComplete, token }) {
  const [formValues, setFormValues] = useState({
    password: '',
    confirmPassword: '',
  })
  const [visibleFields, setVisibleFields] = useState({
    password: false,
    confirmPassword: false,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const toggleVisibility = (fieldName) => {
    setVisibleFields((currentFields) => ({
      ...currentFields,
      [fieldName]: !currentFields[fieldName],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('Reset token is missing. Please use the password reset link from your email.')
      return
    }

    if (formValues.password !== formValues.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({
        token,
        newPassword: formValues.password,
      })
      onComplete?.()
    } catch (resetPasswordError) {
      setError(
        getAuthErrorMessage(
          resetPasswordError,
          'Unable to reset password. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-10" onSubmit={handleSubmit}>
      <PasswordField
        isVisible={visibleFields.password}
        label="New Password"
        name="password"
        onChange={handleChange}
        onToggleVisibility={() => toggleVisibility('password')}
        value={formValues.password}
      />
      <PasswordField
        isVisible={visibleFields.confirmPassword}
        label="Re-enter Password"
        name="confirmPassword"
        onChange={handleChange}
        onToggleVisibility={() => toggleVisibility('confirmPassword')}
        value={formValues.confirmPassword}
      />

      <div className="px-4 sm:px-5">
        <p className="text-xl font-medium text-black sm:text-[22px]">
          Must Contain atleast:
        </p>
        <ul className="mt-5 list-disc space-y-1 pl-7 font-['Mona_Sans',Poppins,sans-serif] text-base font-normal leading-6 text-[#777777] sm:text-[18px]">
          <li>Use at least 16 characters.</li>
          <li>At least 1 uppercase Character</li>
          <li>lowercase Character</li>
          <li>1 special character</li>
        </ul>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-[#d90000]">
          {error}
        </p>
      )}

      <button
        className="h-[58px] w-full rounded-xl bg-[#f50707] text-base font-bold text-white shadow-sm shadow-red-900/20 transition hover:bg-[#d90000] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[72px] sm:text-[22px]"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  )
}

function PasswordField({
  isVisible,
  label,
  name,
  onChange,
  onToggleVisibility,
  value,
}) {
  const ActionIcon = isVisible ? Eye : EyeOff

  return (
    <label className="block">
      <span className="flex min-h-[58px] overflow-hidden rounded-xl border border-[#d8d8d8] bg-white transition focus-within:border-[#bdbdbd] focus-within:ring-4 focus-within:ring-red-100 sm:h-[72px]">
        <span className="flex w-[178px] shrink-0 items-center border-r border-[#d8d8d8] px-4 text-base font-bold text-black sm:w-[284px] sm:px-8 sm:text-[22px]">
          <LockKeyhole className="mr-3 text-black" size={23} strokeWidth={1.9} />
          {label}
        </span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent px-4 text-base font-medium text-black outline-none placeholder:text-[#b7b7b7] sm:px-8 sm:text-xl"
          name={name}
          onChange={onChange}
          placeholder="************"
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <button
          className="flex w-12 shrink-0 items-center justify-center text-black transition hover:text-[#ef1414] sm:w-16"
          onClick={onToggleVisibility}
          type="button"
        >
          <ActionIcon size={24} strokeWidth={1.8} />
        </button>
      </span>
    </label>
  )
}

export default NewPasswordForm
