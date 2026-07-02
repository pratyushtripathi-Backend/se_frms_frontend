import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import TextField from '../../../components/forms/TextField'
import Button from '../../../components/ui/Button'
import { login } from '../services/authService'

function LoginForm({ onForgotPassword, onLoginSuccess }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await login(credentials)
      console.log('Login success:', response.data)
      onLoginSuccess(credentials.email)
    } catch (loginError) {
      const message =
        loginError.response?.data?.message ??
        loginError.message ??
        'Unable to login. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6 sm:space-y-9 lg:space-y-11" onSubmit={handleSubmit}>
      <TextField
        icon={Mail}
        label="Email"
        name="email"
        onChange={handleChange}
        placeholder="example@gmail.com"
        type="email"
        value={credentials.email}
      />
      <TextField
        actionIcon={isPasswordVisible ? Eye : EyeOff}
        icon={LockKeyhole}
        label="Password"
        name="password"
        onActionClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
        onChange={handleChange}
        placeholder="************"
        type={isPasswordVisible ? 'text' : 'password'}
        value={credentials.password}
      />

      <div className="flex flex-col gap-4 sm:-mt-3 sm:flex-row sm:items-center sm:justify-between lg:-mt-5">
        <label className="flex items-center gap-3 text-sm font-medium text-[#5f5f5f] sm:text-base">
          <input
            className="h-5 w-5 rounded border-[#d8d8d8] text-[#f50707] focus:ring-[#f50707] sm:h-6 sm:w-6"
            type="checkbox"
          />
          Remember me
        </label>
        <button
          className="self-start text-sm font-semibold text-[#005dff] hover:text-[#0045bf] sm:self-auto sm:text-base"
          onClick={onForgotPassword}
          type="button"
        >
          Forgot Password ?
        </button>
      </div>

      {error && (
        <p className="-mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-[#d90000]">
          {error}
        </p>
      )}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Logging in...' : 'Continue to Login'}
      </Button>
    </form>
  )
}

export default LoginForm
