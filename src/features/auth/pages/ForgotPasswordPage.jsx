import BrandMark from '../../../components/BrandMark'
import BackgroundShapes from '../../../components/BackgroundShapes'
import forgotPasswordIllustration from '../../../assets/forgot-password-illustration.png'
import ForgotPasswordForm from '../components/ForgotPasswordForm'

function ForgotPasswordPage({ onBackToLogin, onContinue }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f3f3] px-5 py-8 text-black sm:px-10 lg:px-0 lg:py-0">
      <BackgroundShapes />

      <div className="relative z-10 lg:absolute lg:left-[63px] lg:top-[84px]">
        <BrandMark />
      </div>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-[850px] rounded-[32px] border border-[#e5e5e5] bg-white px-5 py-10 shadow-[0_4px_10px_rgba(0,0,0,0.18)] sm:mt-20 sm:rounded-[42px] sm:px-12 sm:py-14 lg:mt-[180px] lg:min-h-[581px] lg:px-[112px] lg:py-[56px]">
        <div className="mx-auto flex max-w-[628px] flex-col">
          <img
            alt="Forgot password illustration"
            className="mx-auto h-auto w-[220px] sm:w-[286px]"
            src={forgotPasswordIllustration}
          />

          <h1 className="mt-8 font-[Poppins] text-3xl font-bold leading-none text-black sm:text-[40px]">
            Forgot Password
          </h1>
          <p className="mt-7 max-w-[560px] font-['Mona_Sans',Poppins,sans-serif] text-base font-normal leading-7 text-[#777777] sm:text-[20px]">
            Enter your registered email address below, and we&apos;ll send you a
            password reset link to your inbox.
          </p>

          <div className="mt-10">
            <ForgotPasswordForm onCancel={onBackToLogin} onSuccess={onContinue} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
