import AuthHeader from '../components/AuthHeader'
import LoginForm from '../components/LoginForm'
import { AUTH_STEP_CONTENT, AUTH_STEPS } from '../constants/authFlow'

function LoginPage({ onForgotPassword, onLoginSuccess, onLogout }) {
  return (
    <div className="w-full rounded-[28px] border border-[#e7e7e7] bg-white px-5 py-8 shadow-[0_4px_10px_rgba(0,0,0,0.18)] sm:rounded-[36px] sm:px-8 sm:py-10 md:rounded-[42px] md:px-12 md:py-12 lg:max-w-[637px] xl:px-8 2xl:px-8">
      <AuthHeader content={AUTH_STEP_CONTENT[AUTH_STEPS.LOGIN]} />

      <div className="mt-8 sm:mt-12 lg:mt-16">
        <LoginForm
          onForgotPassword={onForgotPassword}
          onLoginSuccess={onLoginSuccess}
        />
      </div>

      <button className="sr-only" onClick={onLogout} type="button">
        View logout state
      </button>
    </div>
  )
}

export default LoginPage
