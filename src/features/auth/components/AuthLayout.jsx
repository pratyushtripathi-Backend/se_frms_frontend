import BrandMark from '../../../components/BrandMark'
import BackgroundShapes from '../../../components/BackgroundShapes'
import AuthAside from './AuthAside'

function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-black">
      <section className="grid min-h-screen lg:grid-cols-[50.7%_49.3%]">
        <div className="relative flex min-h-screen flex-col overflow-hidden px-5 py-8 sm:px-8 md:px-[6.5%] md:py-12">
          <BackgroundShapes showRight={false} />
          <div className="relative z-10 mb-8 sm:mb-12 lg:mb-24">
            <BrandMark />
          </div>
          <div className="relative z-10 flex flex-1 items-center pb-4 sm:pb-8">
            {children}
          </div>
        </div>
        <AuthAside />
      </section>
    </main>
  )
}

export default AuthLayout
