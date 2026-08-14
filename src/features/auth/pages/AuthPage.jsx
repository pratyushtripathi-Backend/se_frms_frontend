import { useEffect, useState } from 'react'
import BrandMark from '../../../components/BrandMark'
import DashboardPage from '../../dashboard_1/DashboardPage'
import AuthLayout from '../components/AuthLayout'
import { AUTH_STEPS } from '../constants/authFlow'
import { logout } from '../services/authService'
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearAuthSession,
  consumeAuthRedirectMessage,
  expireAuthSession,
  getAuthToken,
  getAuthTokenExpiresAt,
} from '../services/authUserSession'
import ForgotPasswordPage from './ForgotPasswordPage'
import LoginPage from './LoginPage'
import LogoutPage from './LogoutPage'
import NewPasswordPage from './NewPasswordPage'
import OtpVerificationPage from './OtpVerificationPage'
import PasswordUpdatedPage from './PasswordUpdatedPage'

const STEP_ROUTES = {
  [AUTH_STEPS.LOGIN]: '/',
  [AUTH_STEPS.FORGOT_PASSWORD]: '/forgot-password',
  [AUTH_STEPS.NEW_PASSWORD]: '/create-new-password',
  [AUTH_STEPS.PASSWORD_UPDATED]: '/password-updated',
  [AUTH_STEPS.OTP_VERIFICATION]: '/otp-verification',
  [AUTH_STEPS.DASHBOARD]: '/dashboard',
  [AUTH_STEPS.LOGOUT]: '/logout',
}

const ROUTE_STEPS = {
  '/': AUTH_STEPS.LOGIN,
  '/forgot-password': AUTH_STEPS.FORGOT_PASSWORD,
  '/create-new-password': AUTH_STEPS.NEW_PASSWORD,
  '/password-updated': AUTH_STEPS.PASSWORD_UPDATED,
  '/otp-verification': AUTH_STEPS.OTP_VERIFICATION,
  '/dashboard': AUTH_STEPS.DASHBOARD,
  '/logout': AUTH_STEPS.LOGOUT,
}

function getStepFromPathname() {
  if (window.location.pathname.startsWith('/dashboard') && !getAuthToken()) {
    window.history.replaceState({}, '', '/')
    return AUTH_STEPS.LOGIN
  }

  if (window.location.pathname.startsWith('/dashboard')) {
    return AUTH_STEPS.DASHBOARD
  }

  return ROUTE_STEPS[window.location.pathname] ?? AUTH_STEPS.LOGIN
}

function AuthPage() {
  const [step, setStep] = useState(getStepFromPathname)
  const [loginEmail, setLoginEmail] = useState(
    () => window.sessionStorage.getItem('frmsLoginEmail') ?? '',
  )
  const [loginCredentials, setLoginCredentials] = useState(null)
  const [loginNotice, setLoginNotice] = useState(consumeAuthRedirectMessage)

  useEffect(() => {
    const handlePopState = () => setStep(getStepFromPathname())

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleSessionExpired = (event) => {
      setLoginEmail('')
      setLoginNotice(event.detail?.message || consumeAuthRedirectMessage())
      window.history.replaceState({}, '', '/')
      setStep(AUTH_STEPS.LOGIN)
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [])

  useEffect(() => {
    const token = getAuthToken()
    const expiresAt = getAuthTokenExpiresAt()

    if (!token || !expiresAt) {
      return undefined
    }

    const remainingTime = expiresAt - Date.now()

    if (remainingTime <= 0) {
      expireAuthSession()
      return undefined
    }

    const expiryTimer = window.setTimeout(expireAuthSession, remainingTime)

    return () => window.clearTimeout(expiryTimer)
  }, [step])

  const navigateToStep = (nextStep) => {
    const nextPath = STEP_ROUTES[nextStep]

    if (nextPath && window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setStep(nextStep)
  }

  const goToLogin = () => {
    setLoginNotice('')
    navigateToStep(AUTH_STEPS.LOGIN)
  }
  const goToForgotPassword = () => navigateToStep(AUTH_STEPS.FORGOT_PASSWORD)
  const goToPasswordUpdated = () => navigateToStep(AUTH_STEPS.PASSWORD_UPDATED)
  const goToDashboard = () => navigateToStep(AUTH_STEPS.DASHBOARD)
  const goToOtpVerification = (email = loginEmail, credentials = null) => {
    setLoginEmail(email)
    setLoginCredentials(credentials)
    window.sessionStorage.setItem('frmsLoginEmail', email)
    navigateToStep(AUTH_STEPS.OTP_VERIFICATION)
  }
  const goToLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuthSession()
      setLoginEmail('')
      navigateToStep(AUTH_STEPS.LOGIN)
    }
  }

  if (step === AUTH_STEPS.OTP_VERIFICATION) {
    return (
      <OtpVerificationPage
        email={loginEmail}
        loginCredentials={loginCredentials}
        onBackToLogin={goToLogin}
        onVerified={goToDashboard}
      />
    )
  }

  if (step === AUTH_STEPS.DASHBOARD) {
    if (!getAuthToken()) {
      return null
    }

    return <DashboardPage onLogout={goToLogout} />
  }

  if (step === AUTH_STEPS.FORGOT_PASSWORD) {
    return <ForgotPasswordPage onBackToLogin={goToLogin} />
  }

  if (step === AUTH_STEPS.NEW_PASSWORD) {
    return <NewPasswordPage onComplete={goToPasswordUpdated} />
  }

  if (step === AUTH_STEPS.PASSWORD_UPDATED) {
    return <PasswordUpdatedPage onContinue={goToLogin} />
  }

  return (
    <AuthLayout>
      <section className="w-full max-w-[852px]">
        <div className="mb-8 sm:mb-10 lg:hidden">
          <BrandMark compact />
        </div>

        {step === AUTH_STEPS.LOGIN && (
          <LoginPage
            notice={loginNotice}
            onForgotPassword={goToForgotPassword}
            onLoginSuccess={goToOtpVerification}
            onLogout={goToLogout}
          />
        )}
        {step === AUTH_STEPS.LOGOUT && (
          <LogoutPage onBackToLogin={goToLogin} />
        )}
      </section>
    </AuthLayout>
  )
}

export default AuthPage
