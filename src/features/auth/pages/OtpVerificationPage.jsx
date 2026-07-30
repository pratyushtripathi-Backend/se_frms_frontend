import BrandMark from '../../../components/BrandMark'
import BackgroundShapes from '../../../components/BackgroundShapes'
import otpIllustrator from '../../../assets/otp-illustrator.png'
import OtpVerificationForm from '../components/OtpVerificationForm'

function OtpVerificationPage({ email, onVerified }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f3f3] px-5 py-8 text-black sm:px-10 lg:px-0 lg:py-0">
      <BackgroundShapes />

      <div className="relative z-10 lg:absolute lg:left-[56px] lg:top-[44px]">
        <BrandMark />
      </div>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-[450px] rounded-[32px] border border-[#e5e5e5] bg-white px-6 py-9 shadow-[0_4px_10px_rgba(0,0,0,0.18)] sm:mt-20 sm:rounded-[42px] sm:px-14 sm:py-12 lg:mt-[90px] lg:min-h-[435px] lg:px-[50px] lg:py-[40px]">
        <div className="mx-auto flex max-w-[414px] flex-col items-center">
          <img
            alt="OTP verification illustration"
            className="h-[100px] w-[100px] object-contain"
            src={otpIllustrator}
          />
          <h1 className="mt-5 w-full text-left font-[Poppins] text-2xl font-bold leading-none text-black sm:text-[28px]">
            OTP Verification
          </h1>
          <p className="mt-4 w-full text-left font-['Mona_Sans',Poppins,sans-serif] text-sm font-normal leading-none text-[#777777] sm:text-[14px]">
            We&apos;ve sent an OTP to your phone. Please enter it below.
          </p>

          <div className="mt-7 w-full">
            <OtpVerificationForm email={email} onVerified={onVerified} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default OtpVerificationPage
