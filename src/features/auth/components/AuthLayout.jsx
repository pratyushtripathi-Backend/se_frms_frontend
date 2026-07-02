import BrandMark from '../../../components/BrandMark'
import leftShape from '../../../assets/left-shape.png'
import AuthAside from './AuthAside'

function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-black">
      <section className="grid min-h-screen lg:grid-cols-[50.7%_49.3%]">
        <div className="relative flex min-h-screen flex-col overflow-hidden px-5 py-8 sm:px-8 md:px-[6.5%] md:py-12">
          <img
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 h-auto w-[min(92vw,560px)] max-w-none sm:w-[min(72vw,650px)] md:w-[min(62vw,760px)] lg:w-[min(43vw,860px)]"
            src={leftShape}
          />
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
