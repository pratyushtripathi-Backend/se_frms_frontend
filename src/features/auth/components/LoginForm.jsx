import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import TextField from '../../../components/forms/TextField'
import Button from '../../../components/ui/Button'
import { getAuthErrorMessage } from '../services/authError'
import { login } from '../services/authService'
import { saveAuthUser } from '../services/authUserSession'
import { getRequiredClientAuthMetadata } from '../services/clientAuthMetadata'

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
      const clientMetadata = await getRequiredClientAuthMetadata()
      console.log('Login client metadata:', clientMetadata)
      const response = await login({
        ...credentials,
        ...clientMetadata,
      })
      console.log('Login success:', response.data)
      saveAuthUser(response.data)
      onLoginSuccess(credentials.email, credentials)
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError, 'Unable to login. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5 sm:space-y-6 lg:space-y-7" onSubmit={handleSubmit}>
      <TextField
        compact
        icon={Mail}
        label="Email"
        name="email"
        onChange={handleChange}
        placeholder="secureEdge.in"
        type="email"
        value={credentials.email}
      />
      <TextField
        actionIcon={isPasswordVisible ? Eye : EyeOff}
        compact
        icon={LockKeyhole}
        label="Password"
        name="password"
        onActionClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
        onChange={handleChange}
        placeholder="************"
        type={isPasswordVisible ? 'text' : 'password'}
        value={credentials.password}
      />

      <div className="flex flex-col gap-3 sm:-mt-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2.5 text-sm font-medium text-[#5f5f5f] sm:text-[15px]">
          <input
            className="h-4 w-4 rounded border-[#d8d8d8] text-[#f50707] focus:ring-[#f50707] sm:h-5 sm:w-5"
            type="checkbox"
          />
          Remember me
        </label>
        <button
          className="self-start text-sm font-semibold text-[#005dff] hover:text-[#0045bf] sm:self-auto sm:text-[15px]"
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

      <Button className="h-[48px] text-[15px] leading-none sm:h-[48px] sm:text-[15px]" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Logging in...' : 'Continue to Login'}
      </Button>
    </form>
  )
}

export default LoginForm
