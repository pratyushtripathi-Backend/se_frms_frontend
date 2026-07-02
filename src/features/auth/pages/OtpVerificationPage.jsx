import BrandMark from '../../../components/BrandMark'
import BackgroundShapes from '../../../components/BackgroundShapes'
import OtpVerificationForm from '../components/OtpVerificationForm'

function OtpVerificationPage({ email }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f3f3] px-5 py-8 text-black sm:px-10 lg:px-0 lg:py-0">
      <BackgroundShapes />

      <div className="relative z-10 lg:absolute lg:left-[63px] lg:top-[84px]">
        <BrandMark />
      </div>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-[850px] rounded-[32px] border border-[#e5e5e5] bg-white px-5 py-10 shadow-[0_4px_10px_rgba(0,0,0,0.18)] sm:mt-20 sm:rounded-[42px] sm:px-12 sm:py-14 lg:mt-[112px] lg:min-h-[581px] lg:px-[112px] lg:py-[56px]">
        <div className="mx-auto flex max-w-[628px] flex-col items-center">
          <OtpIllustration />
          <h1 className="mt-5 text-center font-[Poppins] text-3xl font-bold leading-none text-black sm:text-[40px]">
            OTP Verification
          </h1>
          <p className="mt-7 text-center font-['Mona_Sans',Poppins,sans-serif] text-base font-normal leading-none text-[#777777] sm:text-[20px]">
            We&apos;ve sent an OTP to your phone. Please enter it below.
          </p>

          <div className="mt-10 w-full">
            <OtpVerificationForm email={email} />
          </div>
        </div>
      </section>
    </main>
  )
}

function OtpIllustration() {
  return (
    <div className="relative h-[154px] w-[210px] sm:h-[184px] sm:w-[250px]">
      <div className="absolute inset-x-5 top-0 h-[148px] rounded-full bg-[#d9d9d9] sm:h-[176px]" />
      <div className="absolute left-[74px] top-5 h-[126px] w-[70px] rounded-t-xl bg-[#18323a] p-2 sm:left-[88px] sm:h-[150px] sm:w-[82px]">
        <div className="h-full rounded-sm bg-white pt-9">
          <div className="mx-auto h-14 w-14 rounded-b-[28px] bg-[#2f5b66]">
            <div className="mx-auto pt-6">
              <div className="mx-auto h-5 w-4 rounded-full bg-[#ff4b55]" />
              <div className="mx-auto h-7 w-3 bg-[#ff4b55]" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-11 h-9 w-24 rounded-lg bg-[#ff4b55] shadow-sm sm:left-14 sm:h-10 sm:w-28">
        <div className="flex h-full items-center justify-center gap-1.5">
          {Array.from({ length: 8 }).map((_, index) => (
            <span className="h-1.5 w-1.5 rounded-full bg-white" key={index} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-1 right-7 h-24 w-16 rounded-t-[32px] border-[12px] border-[#18323a] border-b-0 sm:right-9 sm:h-28 sm:w-20" />
      <div className="absolute bottom-0 right-3 h-20 w-20 rounded-b-md bg-[#ff4b55] sm:h-24 sm:w-24" />
      <div className="absolute bottom-7 right-9 h-8 w-8 rounded-full border-4 border-[#18323a] sm:bottom-8 sm:right-11" />
      <div className="absolute bottom-10 right-[48px] h-4 w-1 rotate-45 bg-[#18323a] sm:right-[57px]" />
      <div className="absolute bottom-10 right-[48px] h-4 w-1 -rotate-45 bg-[#18323a] sm:right-[57px]" />
      <div className="absolute bottom-0 left-6 h-1 w-44 rounded-full bg-[#18323a] sm:w-52" />
    </div>
  )
}

export default OtpVerificationPage
