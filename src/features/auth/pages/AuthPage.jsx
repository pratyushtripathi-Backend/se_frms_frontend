import { useState } from 'react'
import BrandMark from '../../../components/BrandMark'
import AuthLayout from '../components/AuthLayout'
import { AUTH_STEPS } from '../constants/authFlow'
import ForgotPasswordPage from './ForgotPasswordPage'
import LoginPage from './LoginPage'
import LogoutPage from './LogoutPage'
import OtpVerificationPage from './OtpVerificationPage'

function AuthPage() {
  const [step, setStep] = useState(AUTH_STEPS.LOGIN)
  const [loginEmail, setLoginEmail] = useState('')

  const goToLogin = () => setStep(AUTH_STEPS.LOGIN)
  const goToForgotPassword = () => setStep(AUTH_STEPS.FORGOT_PASSWORD)
  const goToOtpVerification = (email = loginEmail) => {
    setLoginEmail(email)
    setStep(AUTH_STEPS.OTP_VERIFICATION)
  }
  const goToLogout = () => setStep(AUTH_STEPS.LOGOUT)

  if (step === AUTH_STEPS.OTP_VERIFICATION) {
    return <OtpVerificationPage email={loginEmail} onBackToLogin={goToLogin} />
  }

  if (step === AUTH_STEPS.FORGOT_PASSWORD) {
    return (
      <ForgotPasswordPage
        onBackToLogin={goToLogin}
        onContinue={goToOtpVerification}
      />
    )
  }

  return (
    <AuthLayout>
      <section className="w-full max-w-[852px]">
        <div className="mb-8 sm:mb-10 lg:hidden">
          <BrandMark compact />
        </div>

        {step === AUTH_STEPS.LOGIN && (
          <LoginPage
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
