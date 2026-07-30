import BrandMark from '../../../components/BrandMark'
import BackgroundShapes from '../../../components/BackgroundShapes'
import passwordUpdatedLock from '../../../assets/password-updated-lock.png'

function PasswordUpdatedPage({ onContinue }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f3f3] px-5 py-8 text-black sm:px-10 lg:px-0 lg:py-0">
      <BackgroundShapes />

      <div className="relative z-10 lg:absolute lg:left-[63px] lg:top-[84px]">
        <BrandMark />
      </div>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-[850px] rounded-[32px] border border-[#e5e5e5] bg-white px-5 py-12 shadow-[0_4px_10px_rgba(0,0,0,0.18)] sm:mt-20 sm:rounded-[42px] sm:px-12 sm:py-14 lg:mt-[160px] lg:min-h-[624px] lg:px-[88px] lg:py-[72px]">
        <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
          <img
            alt="Password updated confirmation"
            className="h-auto w-[150px] object-contain sm:h-[185px] sm:w-[184px]"
            src={passwordUpdatedLock}
          />

          <h1 className="mt-12 font-[Poppins] text-3xl font-bold leading-none text-black sm:mt-14 sm:text-[40px]">
            Password Updated
          </h1>
          <p className="mt-5 max-w-[560px] font-['Mona_Sans',Poppins,sans-serif] text-base font-normal leading-7 text-[#777777] sm:mt-6 sm:text-[20px]">
            Your password has been changed successfully. For security reasons,
            you may need to sign in again on your devices
          </p>

          <button
            className="mt-9 h-[58px] rounded-xl bg-[#3f3f3f] px-10 text-base font-bold text-white transition hover:bg-[#2f2f2f] sm:mt-12 sm:h-[72px] sm:px-12 sm:text-[22px]"
            onClick={onContinue}
            type="button"
          >
            Continue to Sign In
          </button>
        </div>
      </section>
    </main>
  )
}

export default PasswordUpdatedPage
