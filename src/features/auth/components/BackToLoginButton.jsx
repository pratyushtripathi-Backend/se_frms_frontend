import { ArrowLeft } from 'lucide-react'

function BackToLoginButton({ onClick }) {
  return (
    <button
      className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#0b4c8c]"
      onClick={onClick}
      type="button"
    >
      <ArrowLeft size={17} />
      Back to login
    </button>
  )
}

export default BackToLoginButton
