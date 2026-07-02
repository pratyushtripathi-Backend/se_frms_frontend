import { LogOut } from 'lucide-react'
import Button from '../../../components/ui/Button'
import AuthHeader from '../components/AuthHeader'
import { AUTH_STEP_CONTENT, AUTH_STEPS } from '../constants/authFlow'

function LogoutPage({ onBackToLogin }) {
  return (
    <>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#0b6fb8]">
        <LogOut size={25} strokeWidth={2.4} />
      </div>

      <AuthHeader content={AUTH_STEP_CONTENT[AUTH_STEPS.LOGOUT]} />

      <div className="mt-9">
        <Button onClick={onBackToLogin}>Back to login</Button>
      </div>
    </>
  )
}

export default LogoutPage
