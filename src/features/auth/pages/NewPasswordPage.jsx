import BrandMark from '../../../components/BrandMark'
import BackgroundShapes from '../../../components/BackgroundShapes'
import NewPasswordForm from '../components/NewPasswordForm'

function NewPasswordPage({ onComplete }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f3f3] px-5 py-8 text-black sm:px-10 lg:px-0 lg:py-0">
      <BackgroundShapes />

      <div className="relative z-10 lg:absolute lg:left-[63px] lg:top-[84px]">
        <BrandMark />
      </div>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-[850px] rounded-[32px] border border-[#e5e5e5] bg-white px-5 py-10 shadow-[0_4px_10px_rgba(0,0,0,0.18)] sm:mt-20 sm:rounded-[42px] sm:px-12 sm:py-14 lg:mt-[206px] lg:min-h-[581px] lg:px-[50px] lg:py-[70px]">
        <h1 className="font-[Poppins] text-3xl font-bold leading-none text-black sm:text-[40px]">
          Create a New Password
        </h1>
        <p className="mt-7 font-['Mona_Sans',Poppins,sans-serif] text-base font-normal leading-none text-[#777777] sm:text-[20px]">
          Create a Secure and Unique Password
        </p>

        <div className="mt-16">
          <NewPasswordForm onComplete={onComplete} />
        </div>
      </section>
    </main>
  )
}

export default NewPasswordPage
